# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app-shell-mobile-regression.spec.mjs >> shared authenticated app shell mobile regression >> /app/admin stays phone-width with desktop sidebar closed
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
        - link "Club Trials" [ref=e77] [cursor=pointer]:
          - /url: /app/trials
        - link "Club Leaderboard" [ref=e82] [cursor=pointer]:
          - /url: /app/leaderboard
        - link "Learn" [ref=e86] [cursor=pointer]:
          - /url: /app/learn/manage
        - link "Analytics" [ref=e90] [cursor=pointer]:
          - /url: /app/analytics
        - generic [ref=e94]: ACCOUNT
        - link "My Profile" [ref=e95] [cursor=pointer]:
          - /url: /app/my-profile
      - generic [ref=e103]:
        - paragraph [ref=e104]: RallyHub Admin
        - paragraph [ref=e105]: Super Admin
    - generic [ref=e106]:
      - banner [ref=e107]:
        - button [ref=e108] [cursor=pointer]
        - generic [ref=e110]:
          - button "Current appearance Auto. Change appearance." [ref=e111] [cursor=pointer]
          - button "RA" [ref=e112] [cursor=pointer]
      - main [ref=e114]:
        - generic [ref=e115]:
          - generic [ref=e116]:
            - generic [ref=e117]:
              - heading "Admin Panel" [level=1] [ref=e118]
              - paragraph [ref=e119]: Site owner control panel
            - generic [ref=e120]: Admin Only
          - generic [ref=e124]:
            - button [ref=e125] [cursor=pointer]:
              - paragraph [ref=e126]: "0"
              - paragraph [ref=e127]: Current Club Members
              - paragraph [ref=e128]: 0 paid · 0 complimentary · 0 pending
            - button [ref=e129] [cursor=pointer]:
              - paragraph [ref=e130]: "0"
              - paragraph [ref=e131]: Linked RallyHub Accounts
              - paragraph [ref=e132]: Tap to manage account links
            - button [ref=e133] [cursor=pointer]:
              - paragraph [ref=e134]: "0"
              - paragraph [ref=e135]: Members Not Yet Linked
              - paragraph [ref=e136]: Tap to review linking
          - generic [ref=e137]:
            - tablist [ref=e138]:
              - tab "Club Access Approvals" [selected] [ref=e139] [cursor=pointer]
              - tab "Member Preview" [ref=e143] [cursor=pointer]
              - tab "Announcements" [ref=e147] [cursor=pointer]
              - tab "Directory Claims" [ref=e151] [cursor=pointer]
              - tab "Directory Contacts" [ref=e156] [cursor=pointer]
              - tab "Player Network" [ref=e162] [cursor=pointer]
              - tab "Directory Analytics" [ref=e168] [cursor=pointer]
              - tab "Feedback" [ref=e172] [cursor=pointer]
              - tab "Asset Uploader" [ref=e175] [cursor=pointer]
              - tab "Users & Roles" [ref=e179] [cursor=pointer]
              - tab "Players" [ref=e182] [cursor=pointer]
              - tab "Matches" [ref=e188] [cursor=pointer]
              - tab "Account Links" [ref=e198] [cursor=pointer]
              - tab "Invite Users" [ref=e202] [cursor=pointer]
            - tabpanel "Club Access Approvals" [ref=e206]:
              - generic [ref=e207]:
                - paragraph [ref=e212]:
                  - strong [ref=e213]: RallyHub Club access only.
                  - text: This tab does not approve Directory users. A user can enter the RallyHub Club application only when they have a separate active ClubUserAccess grant. Directory owners/editors are handled only under Directory Claims and cannot access tournaments, players, matches, leaderboards or other Club tools.
                - paragraph [ref=e214]: No RallyHub Club users to review. Directory-only accounts are managed under Directory Claims.
  - contentinfo "RallyHub copyright" [ref=e215]:
    - generic [ref=e216]: © 2026 RallyHub All rights reserved.
```