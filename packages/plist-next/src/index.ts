import { z } from 'zod';
import type { PlistDict, PlistValue } from './parse.js';

// ─── Types ─────────────────────────────────────────────────────────────────────

export type { PlistDict, PlistValue } from './parse.js';

export interface BuildOptions {
  readonly pretty?: boolean;
}

// ─── Zod schema ────────────────────────────────────────────────────────────────

const BuildOptionsSchema = z
  .object({
    pretty: z.boolean().optional(),
  })
  .optional();

// ─── XML helpers ───────────────────────────────────────────────────────────────

const PLIST_HEADER = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">`;

const PLIST_FOOTER = '</plist>';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function isoDateString(d: Date): string {
  function pad(n: number): string {
    return n < 10 ? `0${n}` : String(n);
  }
  return (
    `${d.getUTCFullYear()}-` +
    `${pad(d.getUTCMonth() + 1)}-` +
    `${pad(d.getUTCDate())}T` +
    `${pad(d.getUTCHours())}:` +
    `${pad(d.getUTCMinutes())}:` +
    `${pad(d.getUTCSeconds())}Z`
  );
}

function getTypeName(val: unknown): string {
  return Object.prototype.toString.call(val).slice(8, -1);
}

// ─── Core recursive serializer ─────────────────────────────────────────────────

function serializeValue(val: PlistValue, indent: string, pretty: boolean): string {
  const nl = pretty ? '\n' : '';
  const nextIndent = pretty ? `${indent}  ` : '';

  if (val === undefined) return '';
  if (val === null) return `${indent}<null/>${nl}`;
  if (val === true) return `${indent}<true/>${nl}`;
  if (val === false) return `${indent}<false/>${nl}`;

  const typeName = getTypeName(val);

  if (typeName === 'String') {
    const s = val as string;
    if (s === '') return `${indent}<string/>${nl}`;
    return `${indent}<string>${escapeXml(s)}</string>${nl}`;
  }

  if (typeName === 'Number') {
    const n = val as number;
    const tag = n % 1 === 0 ? 'integer' : 'real';
    return `${indent}<${tag}>${n}</${tag}>${nl}`;
  }

  if (typeName === 'BigInt') {
    return `${indent}<integer>${val}</integer>${nl}`;
  }

  if (typeName === 'Date') {
    return `${indent}<date>${isoDateString(new Date(val as Date))}</date>${nl}`;
  }

  if (Buffer.isBuffer(val)) {
    return `${indent}<data>${(val as Buffer).toString('base64')}</data>${nl}`;
  }

  if (typeName === 'ArrayBuffer') {
    const bytes = new Uint8Array(val as unknown as ArrayBuffer);
    return `${indent}<data>${Buffer.from(bytes).toString('base64')}</data>${nl}`;
  }

  if (
    val !== null &&
    typeof val === 'object' &&
    'buffer' in val &&
    getTypeName((val as { buffer: unknown }).buffer) === 'ArrayBuffer'
  ) {
    const typed = val as unknown as ArrayBufferView;
    const bytes = new Uint8Array(typed.buffer);
    return `${indent}<data>${Buffer.from(bytes).toString('base64')}</data>${nl}`;
  }

  if (Array.isArray(val)) {
    if (val.length === 0) return `${indent}<array/>${nl}`;
    const items = val
      .map((item) => serializeValue(item as PlistValue, nextIndent, pretty))
      .join('');
    return `${indent}<array>${nl}${items}${indent}</array>${nl}`;
  }

  if (typeName === 'Object') {
    const obj = val as PlistDict;
    const keys = Object.keys(obj).filter((k) => Object.prototype.hasOwnProperty.call(obj, k));
    if (keys.length === 0) return `${indent}<dict/>${nl}`;
    const entries = keys
      .map((k) => {
        const keyLine = `${nextIndent}<key>${escapeXml(k)}</key>${nl}`;
        const valueLine = serializeValue(obj[k] as PlistValue, nextIndent, pretty);
        return keyLine + valueLine;
      })
      .join('');
    return `${indent}<dict>${nl}${entries}${indent}</dict>${nl}`;
  }

  return '';
}

// ─── Public API ─────────────────────────────────────────────────────────────────

/**
 * Generates an XML plist string from a JavaScript value.
 *
 * @param obj - The value to serialize
 * @param opts - Optional build options (default: `{ pretty: true }`)
 * @returns The plist XML string
 */
export function build(obj: PlistValue, opts?: BuildOptions): string {
  const options = BuildOptionsSchema.parse(opts);
  const pretty = options?.pretty !== false;
  const nl = pretty ? '\n' : '';
  const indent = pretty ? '  ' : '';
  const body = serializeValue(obj, indent, pretty);
  return `${PLIST_HEADER}${nl}${body}${PLIST_FOOTER}`;
}

export { parse } from './parse.js';
