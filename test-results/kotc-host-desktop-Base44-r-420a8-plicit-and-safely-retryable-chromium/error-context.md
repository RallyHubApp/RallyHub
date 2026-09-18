# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-host-desktop.spec.mjs >> Base44 resilience: genuine prepare failure stays explicit and safely retryable
- Location: e2e/kotc-host-desktop.spec.mjs:551:1

# Error details

```
Error: Channel closed
```

```
Error: expect(locator).toContainText(expected) failed

Locator: getByTestId('kotc-score-card-4')
Expected substring: "Saved"
Received string:    "Court 4LIVETeam APlayer 03 & Player 08Team BPlayer 10 & Player 13Saving…Saving…"

Call log:
  - Expect "toContainText" getByTestId('kotc-score-card-4') with timeout 2000ms
  - waiting for getByTestId('kotc-score-card-4')
    3 × locator resolved to <div data-dynamic-content="true" data-testid="kotc-score-card-4" data-source-location="src/components/kotc/KotcV2SessionView.jsx:80:9" class="glass rounded-xl p-3 sm:p-4 space-y-3 border border-amber-400/60">…</div>
      - unexpected value "Court 4LIVETeam APlayer 03 & Player 08Team BPlayer 10 & Player 13Saving…Saving…"
  - Target page, context or browser has been closed

```

```yaml
- text: Court 4 LIVE
- paragraph: Team A
- paragraph: Player 03 & Player 08
- textbox [disabled]: "11"
- paragraph: Team B
- paragraph: Player 10 & Player 13
- textbox [disabled]: "3"
- text: Saving…
- button "Saving…" [disabled]
```

```
Error: apiRequestContext._wrapApiCall: Target page, context or browser has been closed
```