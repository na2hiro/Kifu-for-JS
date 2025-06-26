# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Kifu for JS is a monorepo for Japanese shogi (chess) game record viewer and related libraries. The project consists of:

- **kifu-for-js**: Main shogi viewer component library with React UI
- **json-kifu-format**: JSON format parser/normalizer for various shogi notation formats (KIF, KI2, CSA, JKF)
- **shogi.js**: Core shogi game engine handling board state, moves, and rules
- **website**: Official documentation site built with Docusaurus

### Package Dependencies
```
shogi.js ← json-kifu-format ← kifu-for-js ← website
shogi.js ← kifu-for-js
```

## Development Commands

### Setup
```bash
# Install dependencies for all packages
npm install

# Run development server with watch mode for all packages
npm run dev

# Run website only
npm run website
```

### Building & Testing
```bash
# Build all packages
npm run build

# Run tests across all packages
npm run test
npm run test:watch  # Watch mode

# Run tests for specific package
cd packages/Kifu-for-JS && npm run test:watch

# Run Cypress E2E tests
npm run cy:open
npm run ci:cy
```

### Code Quality
```bash
# Lint all packages
npm run lint
npm run lint:fix

# Type checking
npm run typecheck
```

### Individual Package Development
```bash
# Kifu-for-JS specific development server
cd packages/Kifu-for-JS && npm run dev

# Individual package builds
cd packages/shogi.js && npm run build
cd packages/json-kifu-format && npm run build
```

## Architecture Overview

### Core Components

1. **Shogi Game Engine** (`packages/shogi.js/src/shogi.ts`)
   - Handles board state, piece movement, and game rules
   - Exports `Shogi` class with methods for move validation, captures, checks
   - Supports both normal play and edit modes

2. **Kifu Format Parser** (`packages/json-kifu-format/src/`)
   - Normalizes various shogi notation formats (KIF, KI2, CSA) to JSON Kifu Format (JKF)
   - `JKFPlayer` class for replaying game moves
   - PEG.js parsers for different notation formats

3. **React UI Components** (`packages/Kifu-for-JS/src/`)
   - **KifuLite**: Main viewer component with board, controls, and comments
   - **KifuStore**: MobX state management for game state and UI
   - **Legacy components**: Backward compatibility components
   - **Lite components**: Modern React components with hooks

### Key Files

- `packages/Kifu-for-JS/src/index.tsx`: Main entry point and loading functions
- `packages/Kifu-for-JS/src/lite/KifuLite.tsx`: Primary viewer component
- `packages/Kifu-for-JS/src/common/stores/KifuStore.ts`: Central state management
- `packages/json-kifu-format/src/jkfplayer.ts`: Game replay logic
- `packages/shogi.js/src/shogi.ts`: Core game engine

### Build System

- **Lerna**: Monorepo management and cross-package builds
- **Webpack**: Module bundling for browser distribution
- **TypeScript**: Type checking across all packages
- **Jest**: Unit testing framework
- **Cypress**: E2E testing for UI components

### UI Architecture

The project uses two rendering approaches:
- **Legacy mode**: jQuery-style DOM manipulation (backward compatibility)
- **Lite mode**: Modern React components with TypeScript and hooks

State management uses MobX with React integration for reactive UI updates.

## Testing Strategy

- **Unit tests**: Jest with coverage reporting in each package
- **E2E tests**: Cypress for browser automation testing
- **Type checking**: TypeScript compiler verification
- **Linting**: ESLint with Prettier for code formatting

## Development Workflow

1. Changes to `shogi.js` require rebuilding `json-kifu-format` and `kifu-for-js`
2. Use `npm run dev` to watch all packages simultaneously
3. Individual package development: `cd packages/<name> && npm run test:watch`
4. Before commits: `npm run lint:fix && npm run typecheck && npm run test`

## File Patterns

- TypeScript source: `src/**/*.ts`, `src/**/*.tsx`
- Tests: `src/**/*.test.ts`, `test/**/*.ts`
- Config files: `webpack.config.js`, `jest.config.js`, `tsconfig.json`
- Generated files: `dist/`, `bundle/`, `cjs/` directories