# Development Workflow
- Write tests for new functionality. Confidence: 0.85
- Run `pnpm test` before committing. Confidence: 0.85
- Run `pnpm typecheck` (`tsc --noEmit`) to verify types. Confidence: 0.85
- Run `pnpm build` to catch circular deps and export issues. Confidence: 0.85
- Use commit format: `<type>: <description>` with optional body. Confidence: 0.80
- Commit types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`. Confidence: 0.80
