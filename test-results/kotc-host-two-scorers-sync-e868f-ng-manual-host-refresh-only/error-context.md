# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: kotc-host-two-scorers-sync.spec.mjs >> host + two scorer devices: first claim wins, mixed parallel scoring, manual host refresh only
- Location: e2e/kotc-host-two-scorers-sync.spec.mjs:99:1

# Error details

```
Test timeout of 60000ms exceeded.
```

# Page snapshot

```yaml
- main [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]:
        - paragraph [ref=e7]: Round 1 — LIVE
        - paragraph [ref=e8]: 4 courts · 2 bench · 1/4 scores saved
      - generic [ref=e9]:
        - button "Links" [ref=e10] [cursor=pointer]
        - button "Menu" [ref=e11] [cursor=pointer]
    - generic [ref=e12]:
      - paragraph [ref=e13]: What happens next
      - paragraph [ref=e14]: Round 1 live · 1/4 scores saved
      - paragraph [ref=e15]: "Next: collect Court 1, Court 2, Court 4 results. You can correct any saved score before advancing."
    - generic [ref=e16]:
      - generic [ref=e17]:
        - generic [ref=e18]:
          - paragraph [ref=e19]: Play Time
          - paragraph [ref=e20]: 8 min round timer
        - generic [ref=e21]:
          - button "Test speaker and spoken announcement" [ref=e22] [cursor=pointer]
          - button "Float and move timer" [ref=e23] [cursor=pointer]
          - button "Full screen timer" [ref=e24] [cursor=pointer]
      - generic [ref=e25]: 05:59
      - paragraph [ref=e29]: Cue and announcements play at full RallyHub volume using this device’s default voice. Set the actual hall loudness with the device media-volume buttons before play.
      - generic [ref=e30]:
        - button "Pause Timer" [ref=e31] [cursor=pointer]
        - button "Reset" [ref=e32] [cursor=pointer]
      - paragraph [ref=e33]: Tap the speaker once before play to enable sound. The timer itself starts automatically when the sporting round starts.
    - paragraph [ref=e34]: Need to finish early? Pause the timer and enter the final scores now — you do not need to wait for 00:00.
    - generic [ref=e35]:
      - paragraph [ref=e36]: Bench This Round
      - paragraph [ref=e37]: Player 17 · Player 18
    - generic [ref=e38]: 1 of 4 saved — Waiting for Court 1, Court 2, Court 4
    - generic [ref=e40]:
      - generic [ref=e41]:
        - paragraph [ref=e42]: Player Scores
        - paragraph [ref=e43]: 1/4 saved
        - paragraph [ref=e44]: When the courts give the thumbs-up, refresh once to pull in their latest scores.
      - button "Refresh Player Scores" [ref=e45] [cursor=pointer]
    - generic [ref=e46]:
      - generic [ref=e47]:
        - generic [ref=e48]:
          - generic [ref=e49]: Court 1
          - generic [ref=e53]: LIVE
        - generic [ref=e54]:
          - generic [ref=e55]:
            - paragraph [ref=e56]: Team A
            - paragraph [ref=e57]: Player 01 & Player 02
          - textbox [disabled] [ref=e58]
        - generic [ref=e59]:
          - generic [ref=e60]:
            - paragraph [ref=e61]: Team B
            - paragraph [ref=e62]: Player 03 & Player 04
          - textbox [disabled] [ref=e63]
        - generic [ref=e64]: Player entering this court — host score boxes are locked.
      - generic [ref=e65]:
        - generic [ref=e66]:
          - generic [ref=e67]: Court 2
          - generic [ref=e69]: LIVE
        - generic [ref=e70]:
          - generic [ref=e71]:
            - paragraph [ref=e72]: Team A
            - paragraph [ref=e73]: Player 05 & Player 06
          - textbox [disabled] [ref=e74]
        - generic [ref=e75]:
          - generic [ref=e76]:
            - paragraph [ref=e77]: Team B
            - paragraph [ref=e78]: Player 07 & Player 08
          - textbox [disabled] [ref=e79]
        - generic [ref=e80]: Player entering this court — host score boxes are locked.
      - generic [ref=e81]:
        - generic [ref=e82]:
          - generic [ref=e83]: Court 3
          - generic [ref=e85]: SAVED
        - generic [ref=e86]:
          - generic [ref=e87]:
            - paragraph [ref=e88]: Team A
            - paragraph [ref=e89]: Player 09 & Player 10
          - textbox [disabled] [ref=e90]: "6"
        - generic [ref=e91]:
          - generic [ref=e92]:
            - paragraph [ref=e93]: Team B
            - paragraph [ref=e94]: Player 11 & Player 12
          - textbox [disabled] [ref=e95]: "4"
        - generic [ref=e96]: ✓ Saved 6–4
        - button "Edit result" [ref=e97] [cursor=pointer]
      - generic [ref=e98]:
        - generic [ref=e99]:
          - generic [ref=e100]: Court 4
          - generic [ref=e102]: LIVE
        - generic [ref=e103]:
          - generic [ref=e104]:
            - paragraph [ref=e105]: Team A
            - paragraph [ref=e106]: Player 13 & Player 14
          - textbox [ref=e107]
        - generic [ref=e108]:
          - generic [ref=e109]:
            - paragraph [ref=e110]: Team B
            - paragraph [ref=e111]: Player 15 & Player 16
          - textbox [ref=e112]
        - generic [ref=e113]: Start typing in either score box to claim this court as host.
  - generic [ref=e114]:
    - button "Scroll up" [ref=e115] [cursor=pointer]
    - button "Scroll down" [disabled]
```