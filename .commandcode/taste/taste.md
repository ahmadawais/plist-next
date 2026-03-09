# TypeScript
See [typescript/taste.md](typescript/taste.md)
# Functional Programming
- Use pure functions only — no classes or OOP patterns. Confidence: 0.90
- Never use `class`, `this`, or `new` (except `Map`/`Set`/`Error`). Confidence: 0.90
- No prototypes, inheritance, instance methods, or stateful objects with methods. Confidence: 0.85
- Keep data transforms immutable. Confidence: 0.85
- Pass state explicitly as parameters. Confidence: 0.80

# Code Style
- Errors first, happy path last. Confidence: 0.85
- Use guard clauses at the top, main logic at the bottom. Confidence: 0.85
- Never nest deeper than 2-3 levels (ideally 1 level max). Confidence: 0.85
- Flatten with early `return`, `continue`, `break`. Confidence: 0.80
- Avoid switch/case and else — use if guards almost always. Confidence: 0.80

# CLI Development
See [cli-development/taste.md](cli-development/taste.md)
# Project Structure
- Set up pnpm workspaces and split CLI and source library to avoid shared dependencies. Confidence: 0.90
- Use Zod for runtime validation at system boundaries. Confidence: 0.85
- Use Biome for linting and formatting. Confidence: 0.90
- Use Vitest for tests. Confidence: 0.90

# Development Workflow
See [development-workflow/taste.md](development-workflow/taste.md)
# npm Publishing
- Use `npx npm-name-cli` to check for name availability before publishing. Confidence: 0.80
- Check common variations (e.g., t-dot, t-do-t) for name conflicts. Confidence: 0.75
- In monorepo dependencies, use the actual published package name and version constraint, not generic versions. Confidence: 0.65
- For plist monorepo: Use creative naming (one letter or two creative words) instead of scoped packages. Confidence: 0.80
- Use scoped packages (@username/name) when package name is too similar to existing packages. Confidence: 0.80
