# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app-shell-mobile-regression.spec.mjs >> shared authenticated app shell mobile regression >> /app/tournaments stays phone-width with desktop sidebar closed
- Location: e2e/app-shell-mobile-regression.spec.mjs:53:5

# Error details

```
Test timeout of 45000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - complementary [ref=e4]:
      - generic [ref=e5]:
        - link "RallyHub RallyHub SUPER ADMIN" [ref=e6] [cursor=pointer]:
          - /url: /app
          - img "RallyHub" [ref=e7]
          - generic [ref=e8]:
            - generic [ref=e9]: RallyHub
            - generic [ref=e10]: SUPER ADMIN
        - button [ref=e11] [cursor=pointer]
      - navigation [ref=e15]:
        - generic [ref=e16]: SUPER ADMIN
        - link "Dashboard" [ref=e17] [cursor=pointer]:
          - /url: /app
        - link "Admin Panel" [ref=e24] [cursor=pointer]:
          - /url: /app/admin
        - link "Directory Admin" [ref=e28] [cursor=pointer]:
          - /url: /app/admin?tab=directory
        - link "Public Directory" [ref=e32] [cursor=pointer]:
          - /url: /directory
        - generic [ref=e37]: CLUB OPERATIONS
        - link "Member Messages" [ref=e38] [cursor=pointer]:
          - /url: /app/messages
        - link "Membership" [ref=e42] [cursor=pointer]:
          - /url: /app/membership
        - link "Waiting List" [ref=e48] [cursor=pointer]:
          - /url: /app/waiting-list
        - link "Players" [ref=e53] [cursor=pointer]:
          - /url: /app/players
        - link "Session Bookings" [ref=e60] [cursor=pointer]:
          - /url: /app/guest-bookings
        - link "Events" [ref=e65] [cursor=pointer]:
          - /url: /app/events
        - link "Tournaments" [ref=e69] [cursor=pointer]:
          - /url: /app/tournaments
        - link "Club Trials" [ref=e79] [cursor=pointer]:
          - /url: /app/trials
        - link "Club Leaderboard" [ref=e84] [cursor=pointer]:
          - /url: /app/leaderboard
        - link "Learn" [ref=e88] [cursor=pointer]:
          - /url: /app/learn/manage
        - link "Analytics" [ref=e92] [cursor=pointer]:
          - /url: /app/analytics
        - generic [ref=e96]: ACCOUNT
        - link "My Profile" [ref=e97] [cursor=pointer]:
          - /url: /app/my-profile
      - generic [ref=e105]:
        - paragraph [ref=e106]: RallyHub Admin
        - paragraph [ref=e107]: Super Admin
    - generic [ref=e108]:
      - banner [ref=e109]:
        - button [ref=e110] [cursor=pointer]
        - generic [ref=e112]:
          - button "Current appearance Auto. Change appearance." [ref=e113] [cursor=pointer]
          - button "RA" [ref=e114] [cursor=pointer]
      - main [ref=e116]:
        - generic [ref=e117]:
          - generic [ref=e118]:
            - generic [ref=e119]:
              - heading "Tournament Control Centre" [level=1] [ref=e120]
              - paragraph [ref=e121]: 0 events · create, run and review competitions
            - button "Create Competition" [ref=e123] [cursor=pointer]
          - generic [ref=e124]:
            - generic [ref=e125]:
              - generic [ref=e126]:
                - paragraph [ref=e127]: Start a competition
                - paragraph [ref=e128]: Choose a featured format, add the event details, then continue into its dedicated setup.
              - generic [ref=e129]:
                - button "KOTC Test Sandbox" [ref=e130] [cursor=pointer]
                - button "Import KOTC roster" [ref=e131] [cursor=pointer]
            - generic [ref=e132]:
              - button [ref=e133] [cursor=pointer]:
                - paragraph [ref=e140]: King of the Court
                - paragraph [ref=e141]: Fast-moving court rotation for club sessions and social competition.
              - button [ref=e142] [cursor=pointer]:
                - paragraph [ref=e149]: Tournival
                - paragraph [ref=e150]: Group play followed by a seeded knockout competition.
              - button [ref=e151] [cursor=pointer]:
                - paragraph [ref=e158]: RallyHub Interclub
                - paragraph [ref=e159]: Run an interclub event with fairness, live scoring and event-day controls.
          - generic [ref=e160]:
            - textbox "Search tournaments..." [ref=e165]
            - combobox [ref=e166] [cursor=pointer]:
              - generic: All Statuses
          - generic [ref=e169]:
            - heading "No tournaments" [level=3] [ref=e177]
            - paragraph [ref=e178]: Create your first tournament to get started
            - button "Create Tournament" [ref=e179] [cursor=pointer]
  - contentinfo "RallyHub copyright" [ref=e180]:
    - generic [ref=e181]: © 2026 RallyHub All rights reserved.
```