# 🤖 Agent Instructions (AGENTS.md)

Welcome, AI Coding Agent! This document provides essential context, build commands, and code style guidelines for operating within the `commait` repository. Follow these rules strictly to ensure consistency, prevent broken builds, and write maintainable code.

## 📌 1. Project Context
**CommAIt** is an AI-powered Git commit message generator built with Node.js and TypeScript. It reads staged git diffs, filters out noisy files, and queries an AI model (OpenAI or a local LLM) to generate concise, formatted commit messages with emojis. 
- **Core CLI:** Uses `commander` for argument parsing.
- **Terminal UI:** Uses `@clack/prompts` for beautiful, interactive terminal flows.

---

## 🛠️ 2. Build, Lint, and Test Commands

When modifying code, you must ensure the project builds correctly and tests pass. Run these commands from the `commait/` directory.

### 🏗️ Build & Dev Commands
- **Build the project:** `npm run build` (Compiles TypeScript into the `dist/` folder).
- **Run in development:** `npm run dev` (Uses `ts-node` to execute `src/index.ts` without compiling).
- **Run the compiled CLI:** `npm run start` (Executes `node dist/index.js`).
- **Test the CLI manually:** `npm run dev -- -h` (to see the help menu).

### 🧪 Testing Commands
*(Note: If Jest is configured in the project, use the following commands. If tests are missing, help create them!)*
- **Run all tests:** `npm test` or `npx jest`
- **Run tests in watch mode:** `npx jest --watch`
- **Run a single test file:** 
  ```bash
  npx jest src/path/to/file.test.ts
  ```
- **Run a single specific test case within a file:** 
  ```bash
  npx jest src/path/to/file.test.ts -t "should generate a valid commit message"
  ```
- **Generate coverage report:** `npx jest --coverage`

### 🧹 Linting & Formatting
- **Run Linter:** `npm run lint` or `npx eslint src/`
- **Fix Linting Errors:** `npm run lint -- --fix`

---

## 🎨 3. Code Style & Architecture Guidelines

### 📎 Imports (CRITICAL RULE)
- **Always use `.js` extensions** for relative imports within TypeScript source files. The project compiles to CommonJS but utilizes ESM-like import paths to ensure Node.js resolves them correctly at runtime.
  - ✅ **DO:** `import { loadConfig } from './config/index.js';`
  - ❌ **DON'T:** `import { loadConfig } from './config';`
  - ❌ **DON'T:** `import { loadConfig } from './config/index.ts';`

### 📝 Formatting & Syntax
- **Indentation:** 2 spaces.
- **Quotes:** Use single quotes (`'`) for strings and imports. Use double quotes (`"`) only when strictly required (like in JSON payloads).
- **Semicolons:** Always include trailing semicolons.
- **Trailing Commas:** Use trailing commas for multiline arrays, objects, and function parameters.

### 🏷️ TypeScript & Types
- **Strict Mode:** The project enforces `"strict": true`. Do not bypass type checks.
- **Explicit Types:** Always type function parameters and return values explicitly.
  - ✅ `async function getStagedDiff(): Promise<string> { ... }`
- **Avoid `any`:** Do not use `any` unless parsing entirely unknown external JSON responses. Prefer `unknown` and perform type narrowing.
- **Centralized Types:** Define shared interfaces and types in `src/utils/types.ts`.

### 🔤 Naming Conventions
- **Variables & Functions:** `camelCase` (e.g., `generateCommitMessage`, `parsedDiff`).
- **Types, Interfaces, Classes:** `PascalCase` (e.g., `CommitAction`, `Config`).
- **Global Constants:** `UPPER_SNAKE_CASE` (e.g., `DEFAULT_MODEL`, `MAX_TOKENS`).
- **File Names:** `kebab-case` or `camelCase` without special characters (e.g., `client.ts`, `logger.ts`).

### 🚨 Error Handling
- **Async Code:** Always wrap asynchronous `await` calls in `try/catch` blocks.
- **Throwing Errors:** Throw standard `Error` instances with descriptive messages.
- **Catching Errors:** Check if the caught error is an instance of `Error` to satisfy TypeScript.
  ```typescript
  try {
    await installGitHook();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logger.error(`Hook installation failed: ${message}`);
    process.exit(1);
  }
  ```

### 🖨️ Logging (CRITICAL RULE)
- **NO `console.log`:** Do not use `console.log`, `console.warn`, or `console.error` directly in the source code.
- **Use the Custom Logger:** Always import and use the custom logger utility from `src/utils/logger.ts`. It utilizes `chalk` for color-coded terminal output.
  ```typescript
  import { logger } from '../utils/logger.js';
  
  logger.info('Analyzing staged changes...');
  logger.success('Commit successful!');
  logger.warning('No files staged.');
  logger.error('Failed to contact AI provider.');
  logger.diff('Showing diff output...');
  logger.thinking('Generating message...');
  ```

### 🖥️ CLI UI & Prompts
- **Interactive Prompts:** For interactive elements, exclusively use `@clack/prompts`.
- **Cancellations:** If a user cancels a prompt (`isCancel(result)`), always handle it gracefully:
  ```typescript
  if (isCancel(action)) {
    logger.warning('Operation cancelled by user.');
    process.exit(0);
  }
  ```

### 🧠 Modularity & Git Safety
- **Single Responsibility:** Keep functions small. Avoid bloating `index.ts`. Place specific domain logic inside `src/ai`, `src/config`, `src/git`, or `src/hook`.
- **Git Safety:** Never execute destructive Git commands (e.g., `git reset --hard`, `git push --force`) programmatically. Ensure the user is always in control of their repository state.
```