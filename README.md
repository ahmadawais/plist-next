![cover](https://raw.githubusercontent.com/commandcode/plist-next/main/.github/cover.png)

# plist-next

Apple's property list parser/builder for Node.js — rewritten in TypeScript with strict types and modern tooling.

## Features

- ✅ **TypeScript first** — Full type safety with strict mode enabled
- ✅ **Zero dependencies** (library) — Only `@xmldom/xmldom` and `zod`
- ✅ **Runtime validation** — Zod schemas at system boundaries
- ✅ **Comprehensive tests** — 45 tests covering all edge cases
- ✅ **ESM & CJS** — Both module formats with TypeScript declarations
- ✅ **CLI included** — Parse and build plists from the command line

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   plist.ts Monorepo                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────┐         ┌──────────────────┐    │
│  │  packages/plist-next│         │ packages/cli-plist
│  │   (Library)      │         │    (CLI Tool)    │    │
│  ├──────────────────┤         ├──────────────────┤    │
│  │ • parse()        │         │ • plist parse    │    │
│  │ • build()        │         │ • plist build    │    │
│  │ • Types          │         │ • stdin support  │    │
│  │ • 45 tests       │         │ • file support   │    │
│  │ • ESM + CJS      │         │ • Commander.js   │    │
│  │ • Zod validation │         │ • picocolors     │    │
│  └──────────────────┘         └──────────────────┘    │
│         ↑                              ↑                │
│         └──────────────────────────────┘                │
│              (workspace:*)                              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Data Flow

**Library:**
```
XML String (plist format)
         ↓
      parse()
         ↓
   JavaScript Object

JavaScript Object
         ↓
      build()
         ↓
   XML String (plist format)
```

**CLI:**
```
File or stdin (plist XML)
         ↓
    plist parse
         ↓
    JSON output

JSON input
         ↓
   plist build
         ↓
   plist XML output
```

## Installation

### Library

```bash
npm install plist-next
```

### CLI

```bash
npm install -g plist-cli
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
// <?xml version="1.0" encoding="UTF-8"?>
// <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
// <plist version="1.0">
//   <dict>
//     <key>name</key>
//     <string>John</string>
//     <key>age</key>
//     <integer>30</integer>
//     <key>active</key>
//     <true/>
//   </dict>
// </plist>
```

### CLI

```bash
# Parse a plist file
plist parse Info.plist

# Parse from stdin
cat Info.plist | plist parse

# Build from JSON
plist build '{"name":"John","age":30}'

# Disable pretty-printing
plist build '{"name":"John"}' --no-pretty
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
