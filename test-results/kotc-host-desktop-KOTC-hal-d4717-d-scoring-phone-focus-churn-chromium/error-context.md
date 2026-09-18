# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-host-desktop.spec.mjs >> KOTC hall-pressure simulator: 18 players, 12 rounds, slow provider, rapid scoring, phone focus churn
- Location: e2e/kotc-host-desktop.spec.mjs:586:1

# Error details

```
Error: Channel closed
```

```
Error: expect(locator).toContainText(expected) failed

Locator: getByTestId('kotc-score-card-2')
Expected substring: "Saved"
Received string:    "Court 2LIVETeam APlayer 02 & Player 06Team BPlayer 10 & Player 14Saving…Saving…"

Call log:
  - Expect "toContainText" getByTestId('kotc-score-card-2') with timeout 3000ms
  - waiting for getByTestId('kotc-score-card-2')
    5 × locator resolved to <div data-dynamic-content="true" data-testid="kotc-score-card-2" data-source-location="src/components/kotc/KotcV2SessionView.jsx:80:9" class="glass rounded-xl p-3 sm:p-4 space-y-3 border border-amber-400/60">…</div>
      - unexpected value "Court 2LIVETeam APlayer 02 & Player 06Team BPlayer 10 & Player 14Saving…Saving…"
  - Target page, context or browser has been closed

```

```yaml
- text: Court 2 LIVE
- paragraph: Team A
- paragraph: Player 02 & Player 06
- textbox [disabled]: "11"
- paragraph: Team B
- paragraph: Player 10 & Player 14
- textbox [disabled]: "3"
- text: Saving…
- button "Saving…" [disabled]
```

```
Error: browserContext._wrapApiCall: Target page, context or browser has been closed
```