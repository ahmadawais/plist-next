![cover](https://raw.githubusercontent.com/commandcode/plist-next/main/.github/cover.jpg)

# plist-next

Apple's property list parser/builder for Node.js — TypeScript with strict types and runtime validation.

## Features

- **TypeScript first** — Full type safety with strict mode
- **Runtime validation** — Zod schemas at boundaries
- **Comprehensive tests** — 45 tests covering all edge cases
- **ESM & CJS** — Both module formats with TypeScript declarations
- **Zero CLI dependencies** — Lightweight library


```
XML String (plist format)
         ↓
      parse()
         ↓
   JavaScript Object
```

## Installation

```bash
npm install plist-next
```

## Usage

### Parse

```typescript
import { parse } from 'plist-next';

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>name</key>
    <string>John</string>
    <key>age</key>
    <integer>30</integer>
  </dict>
</plist>`;

const data = parse(xml);
console.log(data); // { name: 'John', age: 30 }
```

### Build

```typescript
import { build } from 'plist-next';

const data = {
  name: 'John',
  age: 30,
  active: true,
};

const xml = build(data);
console.log(xml);
```

```
JavaScript Object
         ↓
      build()
         ↓
   XML String (plist format)
```

## API

### `parse(xml: string): PlistValue`

Parses a plist XML string and returns the decoded value.

**Throws** if the XML is invalid or malformed.

### `build(obj: PlistValue, opts?: BuildOptions): string`

Generates a plist XML string from a JavaScript value.

**Options:**
- `pretty?: boolean` — Pretty-print the output (default: `true`)

## Types

```typescript
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

export interface BuildOptions {
  readonly pretty?: boolean;
}
```

## License

Apache-2.0 by [Ahmad Awais](https://x.com/MrAhmadAwais) built with [Command Code](https://commandcode.ai). Inspired by the [plist.js](https://github.com/TooTallNate/plist.js), albeit completely rewritten with TypeScript, Zod validation, and comprehensive tests.
