# .

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Logging Configuration

The application uses a structured logging system with different levels:

- **INFO**: General application flow (always shown in development)
- **WARN**: Warnings and non-critical issues
- **ERROR**: Errors (always shown, even in production)
- **DEBUG**: Detailed debugging information (only shown when `VITE_VERBOSE_LOGGING=true`)
- **BOOKING**: Booking-related operations
- **AUTH**: Authentication-related operations

To enable verbose debug logging, set the environment variable:
```bash
VITE_VERBOSE_LOGGING=true
```

This will show detailed debug information in the browser console.
