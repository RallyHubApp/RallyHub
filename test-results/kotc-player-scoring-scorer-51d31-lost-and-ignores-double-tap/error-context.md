# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-player-scoring.spec.mjs >> scorer reconciles committed save when Base44 response is lost and ignores double tap
- Location: e2e/kotc-player-scoring.spec.mjs:150:1

# Error details

```
Test timeout of 45000ms exceeded.
```

# Page snapshot

```yaml
- main [ref=e4]:
  - generic [ref=e5]:
    - paragraph [ref=e6]: KOTC Scorer
    - heading "E2E Player Scoring" [level=1] [ref=e7]
    - generic [ref=e8]:
      - generic [ref=e9]: Round 1
      - generic [ref=e10]: LIVE
      - generic [ref=e11]: 04:17
    - paragraph [ref=e12]: Scorers can enter and correct current-round results only. The host controls players, bench, pairs, timer and round progression.
    - button "Refresh Round" [ref=e13] [cursor=pointer]
    - paragraph [ref=e14]: No background polling. Refresh when the host announces a new round or if another scorer changes a court.
  - generic [ref=e15]:
    - generic [ref=e16]:
      - generic [ref=e17]:
        - generic [ref=e18]: Court 1
        - generic [ref=e22]: SAVED
      - generic [ref=e23]:
        - generic [ref=e24]: P1A1 & P1A2
        - textbox [disabled] [ref=e25]: "11"
      - generic [ref=e26]:
        - generic [ref=e27]: P1B1 & P1B2
        - textbox [disabled] [ref=e28]: "4"
      - generic [ref=e29]: Score saved
      - generic [ref=e33]: "✓ Score saved: 11–4"
      - button "Undo / Update Score · 90s" [ref=e34] [cursor=pointer]
    - generic [ref=e35]:
      - generic [ref=e36]:
        - generic [ref=e37]: Court 2
        - generic [ref=e39]: SCHEDULED
      - generic [ref=e40]:
        - generic [ref=e41]: P2A1 & P2A2
        - textbox [ref=e42]
      - generic [ref=e43]:
        - generic [ref=e44]: P2B1 & P2B2
        - textbox [ref=e45]
      - generic [ref=e46]: Start typing in either score box to claim this court.
```