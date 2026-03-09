![cover](https://raw.githubusercontent.com/ahmadawais/plist-next/main/.github/cover.jpg)

# plist-cli

Command-line tool for parsing and building Apple plist files.

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

```bash
npx cli-plist
# or global install
npm install -g cli-plist
```

## Usage

### Parse a plist file

```bash
plist parse Info.plist
```

### Parse from stdin

```bash
cat Info.plist | plist parse
```

### Build from JSON

```bash
plist build '{"name":"John","age":30}'
```

### Disable pretty-printing

```bash
plist build '{"name":"John"}' --no-pretty
```

## Commands

### `plist parse [file]`

Parse a plist XML file or stdin and output JSON.

**Arguments:**
- `file` — Path to plist file (reads stdin if omitted)

**Options:**
- `-p, --pretty` — Pretty-print JSON output (default: true)

### `plist build <json>`

Build a plist XML string from a JSON value.

**Arguments:**
- `json` — JSON value to encode as plist

**Options:**
- `--no-pretty` — Disable pretty-printing

## License

Apache-2.0 by [Ahmad Awais](https://x.com/MrAhmadAwais) built with [Command Code](https://commandcode.ai). Inspired by the [plist.js](https://github.com/TooTallNate/plist.js), albeit completely rewritten with TypeScript, Zod validation, and comprehensive tests.
