import { DOMParser } from '@xmldom/xmldom';
import { z } from 'zod';

// ─── Node type constants ───────────────────────────────────────────────────────

const TEXT_NODE = 3;
const CDATA_NODE = 4;
const COMMENT_NODE = 8;

// ─── Types ─────────────────────────────────────────────────────────────────────

export type PlistValue =
  | string
  | number
  | boolean
  | null
  | Buffer
  | Date
  | readonly PlistValue[]
  | PlistDict;

export interface PlistDict {
  readonly [key: string]: PlistValue;
}

// ─── Zod input schema ──────────────────────────────────────────────────────────

const XmlInputSchema = z.string().min(1, 'Cannot parse empty string as plist');

// ─── Helpers ───────────────────────────────────────────────────────────────────

function shouldIgnoreNode(node: ChildNode): boolean {
  return (
    node.nodeType === TEXT_NODE || node.nodeType === COMMENT_NODE || node.nodeType === CDATA_NODE
  );
}

function isEmptyNode(node: Element): boolean {
  return !node.childNodes || node.childNodes.length === 0;
}

function invariant(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

function getTextContent(node: Element): string {
  let result = '';
  for (let i = 0; i < node.childNodes.length; i++) {
    const child = node.childNodes[i];
    if (child == null) continue;
    const t = child.nodeType;
    if (t === TEXT_NODE || t === CDATA_NODE) {
      result += child.nodeValue ?? '';
    }
  }
  return result;
}

// ─── Core recursive parser ──────────────────────────────────────────────────────

function parsePlistNode(node: Element): PlistValue | undefined {
  const name = node.nodeName;

  if (name === 'plist') {
    const items: PlistValue[] = [];
    if (isEmptyNode(node)) return items;
    for (let i = 0; i < node.childNodes.length; i++) {
      const child = node.childNodes[i] as Element;
      if (!shouldIgnoreNode(child)) {
        items.push(parsePlistNode(child) as PlistValue);
      }
    }
    return items;
  }

  if (name === 'dict') {
    const obj: Record<string, PlistValue> = {};
    if (isEmptyNode(node)) return obj;
    let key: string | null = null;
    let counter = 0;
    for (let i = 0; i < node.childNodes.length; i++) {
      const child = node.childNodes[i] as Element;
      if (shouldIgnoreNode(child)) continue;
      if (counter % 2 === 0) {
        invariant(child.nodeName === 'key', 'Missing key while parsing <dict/>.');
        key = parsePlistNode(child) as string;
      } else {
        invariant(
          child.nodeName !== 'key',
          `Unexpected key "${parsePlistNode(child)}" while parsing <dict/>.`,
        );
        obj[key as string] = parsePlistNode(child) as PlistValue;
      }
      counter += 1;
    }
    if (counter % 2 === 1) {
      obj[key as string] = '';
    }
    return obj;
  }

  if (name === 'array') {
    const items: PlistValue[] = [];
    if (isEmptyNode(node)) return items;
    for (let i = 0; i < node.childNodes.length; i++) {
      const child = node.childNodes[i] as Element;
      if (!shouldIgnoreNode(child)) {
        const val = parsePlistNode(child);
        if (val !== undefined && val !== null) items.push(val);
        else if (val === null) items.push(null);
      }
    }
    return items;
  }

  if (name === '#text') {
    return undefined;
  }

  if (name === 'key') {
    if (isEmptyNode(node)) return '';
    const val = node.childNodes[0]?.nodeValue ?? '';
    invariant(
      val !== '__proto__',
      '__proto__ keys can lead to prototype pollution. More details on CVE-2022-22912',
    );
    return val;
  }

  if (name === 'string') {
    return getTextContent(node);
  }

  if (name === 'integer') {
    invariant(!isEmptyNode(node), 'Cannot parse "" as integer.');
    return Number.parseInt(node.childNodes[0]?.nodeValue ?? '', 10);
  }

  if (name === 'real') {
    invariant(!isEmptyNode(node), 'Cannot parse "" as real.');
    return Number.parseFloat(getTextContent(node));
  }

  if (name === 'data') {
    if (isEmptyNode(node)) return Buffer.from('', 'base64');
    let raw = '';
    for (let i = 0; i < node.childNodes.length; i++) {
      const child = node.childNodes[i];
      if (child?.nodeType === TEXT_NODE) {
        raw += (child.nodeValue ?? '').replace(/\s+/g, '');
      }
    }
    return Buffer.from(raw, 'base64');
  }

  if (name === 'date') {
    invariant(!isEmptyNode(node), 'Cannot parse "" as Date.');
    return new Date(node.childNodes[0]?.nodeValue ?? '');
  }

  if (name === 'null') return null;
  if (name === 'true') return true;
  if (name === 'false') return false;

  throw new Error(`Invalid PLIST tag ${name}`);
}

// ─── Public API ─────────────────────────────────────────────────────────────────

/**
 * Parses a Plist XML string and returns the decoded value.
 *
 * @param xml - The XML string to decode
 * @returns The decoded value from the plist XML
 */
export function parse(xml: unknown): PlistValue {
  const validated = XmlInputSchema.parse(xml);
  const doc = new DOMParser().parseFromString(validated, 'text/xml');
  invariant(
    doc.documentElement.nodeName === 'plist',
    'Malformed document. First element should be <plist>',
  );
  const plist = parsePlistNode(doc.documentElement);

  if (Array.isArray(plist) && plist.length === 1) {
    return plist[0] as PlistValue;
  }

  return plist as PlistValue;
}
