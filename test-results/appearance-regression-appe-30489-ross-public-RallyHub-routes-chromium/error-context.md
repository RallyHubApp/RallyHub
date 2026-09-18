# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: appearance-regression.spec.mjs >> appearance persists across public RallyHub routes
- Location: e2e/appearance-regression.spec.mjs:119:1

# Error details

```
Error: Channel closed
```

```
Error: page.goto: Target page, context or browser has been closed
Call log:
  - navigating to "http://127.0.0.1:5173/directory", waiting until "load"

```

```
Error: apiRequestContext._wrapApiCall: Target page, context or browser has been closed
```