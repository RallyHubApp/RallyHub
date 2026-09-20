# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: unified-account-directory-journey.spec.mjs >> directory help explains one account with separate permissions
- Location: e2e/unified-account-directory-journey.spec.mjs:34:1

# Error details

```
Error: Channel closed
```

```
Error: locator.click: Target page, context or browser has been closed
Call log:
  - waiting for getByRole('button', { name: /Does claiming my listing give me RallyHub Club access\?/ })

```

```
Error: browserContext.close: Target page, context or browser has been closed
```