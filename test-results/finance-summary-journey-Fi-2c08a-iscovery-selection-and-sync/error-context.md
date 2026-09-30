# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: finance-summary-journey.spec.mjs >> Finance admin journey: month popover, session discovery, selection and sync
- Location: e2e/finance-summary-journey.spec.mjs:93:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('1 paid then declined')
Expected: visible
Error: strict mode violation: getByText('1 paid then declined') resolved to 2 elements:
    1) <p class="mt-2 text-xs" data-dynamic-content="true" data-source-location="src/pages/FinanceSummary.jsx:328:1165">…</p> aka getByText('Paid places 12 (1 paid then')
    2) <p data-dynamic-content="true" class="text-[11px] text-muted-foreground" data-source-location="src/pages/FinanceSummary.jsx:352:981">Spond · 1 paid then declined</p> aka getByText('Spond · 1 paid then declined')

Call log:
  - Expect "toBeVisible" getByText('1 paid then declined') with timeout 3000ms
  - waiting for getByText('1 paid then declined')

```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e3]:
    - complementary [ref=e4]:
      - link "RallyHub RallyHub SUPER ADMIN" [ref=e6] [cursor=pointer]:
        - /url: /app
        - img "RallyHub" [ref=e7]
        - generic [ref=e8]:
          - generic [ref=e9]: RallyHub
          - generic [ref=e10]: SUPER ADMIN
      - navigation [ref=e11]:
        - generic [ref=e12]: SUPER ADMIN
        - link "Dashboard" [ref=e13] [cursor=pointer]:
          - /url: /app
        - link "Admin Panel" [ref=e20] [cursor=pointer]:
          - /url: /app/admin
        - link "Directory Admin" [ref=e24] [cursor=pointer]:
          - /url: /app/admin?tab=directory
        - link "Public Directory" [ref=e28] [cursor=pointer]:
          - /url: /directory
        - generic [ref=e33]: CLUB OPERATIONS
        - link "Member Messages" [ref=e34] [cursor=pointer]:
          - /url: /app/messages
        - link "Membership" [ref=e38] [cursor=pointer]:
          - /url: /app/membership
        - link "Finance Summary" [ref=e44] [cursor=pointer]:
          - /url: /app/finance
        - link "Waiting List" [ref=e52] [cursor=pointer]:
          - /url: /app/waiting-list
        - link "Players" [ref=e57] [cursor=pointer]:
          - /url: /app/players
        - link "Session Bookings" [ref=e64] [cursor=pointer]:
          - /url: /app/guest-bookings
        - link "Events" [ref=e69] [cursor=pointer]:
          - /url: /app/events
        - link "Tournaments" [ref=e73] [cursor=pointer]:
          - /url: /app/tournaments
        - link "Club Trials" [ref=e81] [cursor=pointer]:
          - /url: /app/trials
        - link "Club Leaderboard" [ref=e86] [cursor=pointer]:
          - /url: /app/leaderboard
        - link "Learn" [ref=e90] [cursor=pointer]:
          - /url: /app/learn/manage
        - link "Analytics" [ref=e94] [cursor=pointer]:
          - /url: /app/analytics
        - generic [ref=e98]: ACCOUNT
        - link "My Profile" [ref=e99] [cursor=pointer]:
          - /url: /app/my-profile
      - generic [ref=e107]:
        - paragraph [ref=e108]: RallyHub Admin
        - paragraph [ref=e109]: Super Admin
    - generic [ref=e110]:
      - banner [ref=e111]:
        - generic [ref=e112]:
          - button "Current appearance Auto. Change appearance." [ref=e113] [cursor=pointer]:
            - generic [ref=e114]: Auto
          - button "RA RallyHub Admin admin" [ref=e115] [cursor=pointer]:
            - generic [ref=e116]: RA
            - generic [ref=e117]:
              - paragraph [ref=e118]: RallyHub Admin
              - paragraph [ref=e119]: admin
      - main [ref=e120]:
        - generic [ref=e121]:
          - generic [ref=e122]:
            - generic [ref=e123]:
              - heading "Finance Summary" [level=1] [ref=e124]
              - paragraph [ref=e125]: See whether each session, event, venue and month is making money or costing the club money.
            - generic [ref=e126]: Finance Lite
          - generic [ref=e132]:
            - generic [ref=e133]:
              - heading "How to use this page" [level=2] [ref=e134]
              - paragraph [ref=e135]: You should not have to rebuild your regular sessions each time. Choose the period and venues, let RallyHub show you exactly what it found in Spond, then sync only the sessions you want.
            - generic [ref=e136]:
              - generic [ref=e137]:
                - paragraph [ref=e138]: 1 · Choose the period
                - paragraph [ref=e139]: Set From and To, then optionally tick one or more months.
              - generic [ref=e140]:
                - paragraph [ref=e141]: 2 · Tick venues
                - paragraph [ref=e142]: Select one, several, or all venues. These choices control both the report and Spond search.
              - generic [ref=e143]:
                - paragraph [ref=e144]: 3 · Find & choose sessions
                - paragraph [ref=e145]: Press Find Spond sessions. RallyHub shows the actual 7pm/8pm occurrences it found before writing anything.
              - generic [ref=e146]:
                - paragraph [ref=e147]: 4 · Sync selected
                - paragraph [ref=e148]: Tick the sessions you want, sync them, then read the green surplus/red subsidy result.
            - generic [ref=e149]:
              - generic [ref=e150]: Spond connected · Clare Pickleball Members
              - generic [ref=e154]: 6 recurring finance sessions configured
              - generic [ref=e155]: 2 venues with finance tracking enabled
            - paragraph [ref=e156]:
              - strong [ref=e157]: Recurring session setup is not a weekly task.
              - text: Use it only when a new regular session starts or an existing schedule changes.
          - generic [ref=e158]:
            - generic [ref=e159]:
              - paragraph [ref=e160]: Income
              - paragraph [ref=e161]: €407.00
            - generic [ref=e162]:
              - paragraph [ref=e163]: Venue cost
              - paragraph [ref=e164]: €315.00
            - generic [ref=e165]:
              - paragraph [ref=e166]: Other costs
              - paragraph [ref=e167]: €0.00
            - generic [ref=e168]:
              - paragraph [ref=e169]: Overall result
              - paragraph [ref=e170]: +€92.00
              - paragraph [ref=e171]: Club surplus
          - generic [ref=e172]:
            - generic [ref=e173]:
              - generic [ref=e174]:
                - text: From
                - textbox [ref=e175]: 2026-09-01
              - generic [ref=e176]:
                - text: To
                - textbox [ref=e177]: 2026-09-30
              - generic [ref=e178]:
                - text: Months
                - button "2 months selected" [ref=e179] [cursor=pointer]
              - button "Find Spond sessions" [ref=e181] [cursor=pointer]
            - generic [ref=e182]:
              - generic [ref=e183]:
                - generic [ref=e184]: Venues to include
                - generic [ref=e185]: Choose one, several or all
              - generic [ref=e186]:
                - generic [ref=e187] [cursor=pointer]:
                  - checkbox "All venues" [ref=e188]
                  - generic [ref=e189]: All venues
                - generic [ref=e190] [cursor=pointer]:
                  - checkbox "St Joseph’s, Doora Barefield" [ref=e191]
                  - generic [ref=e192]: St Joseph’s, Doora Barefield
                - generic [ref=e193] [cursor=pointer]:
                  - checkbox "Ennistymon" [checked] [ref=e194]
                  - generic [ref=e195]: Ennistymon
                - generic [ref=e196] [cursor=pointer]:
                  - checkbox "Corofin" [ref=e197]
                  - generic [ref=e198]: Corofin
                - generic [ref=e199] [cursor=pointer]:
                  - checkbox "Clarecastle" [ref=e200]
                  - generic [ref=e201]: Clarecastle
                - generic [ref=e202] [cursor=pointer]:
                  - checkbox "Shannon" [ref=e203]
                  - generic [ref=e204]: Shannon
            - generic [ref=e205]:
              - generic [ref=e206]:
                - generic [ref=e207]:
                  - heading "Spond sessions found" [level=3] [ref=e208]
                  - paragraph [ref=e209]: Nothing has been written to Finance yet. Tick only the sessions you want to import.
                - generic [ref=e210]:
                  - generic [ref=e211]: 8 found
                  - generic [ref=e212]: 8 ready
              - generic [ref=e213] [cursor=pointer]:
                - checkbox "Select all ready sessions" [ref=e214]
                - generic [ref=e215]: Select all ready sessions
              - generic [ref=e216]:
                - generic [ref=e217] [cursor=pointer]:
                  - 'checkbox "2026-09-09 · 19:00 · 7pm Ennistymon Pickleball Session Ennistymon · Spond: Ennistymon Community Centre Surplus €10.00 Paid places 10 · Fee €5.50 · Income €55.00 · Hall €45.00" [ref=e218]'
                  - generic [ref=e219]:
                    - generic [ref=e220]:
                      - generic [ref=e221]:
                        - paragraph [ref=e222]: 2026-09-09 · 19:00 · 7pm Ennistymon Pickleball Session
                        - paragraph [ref=e223]: "Ennistymon · Spond: Ennistymon Community Centre"
                      - generic [ref=e224]: Surplus €10.00
                    - paragraph [ref=e228]:
                      - text: Paid places
                      - strong [ref=e229]: "10"
                      - text: · Fee
                      - strong [ref=e230]: €5.50
                      - text: · Income
                      - strong [ref=e231]: €55.00
                      - text: · Hall
                      - strong [ref=e232]: €45.00
                - generic [ref=e233] [cursor=pointer]:
                  - 'checkbox "2026-09-09 · 20:00 · 8pm Ennistymon Pickleball Session Ennistymon · Spond: Ennistymon Community Centre Loss €1.00 Paid places 8 · Fee €5.50 · Income €44.00 · Hall €45.00" [checked] [ref=e234]'
                  - generic [ref=e235]:
                    - generic [ref=e236]:
                      - generic [ref=e237]:
                        - paragraph [ref=e238]: 2026-09-09 · 20:00 · 8pm Ennistymon Pickleball Session
                        - paragraph [ref=e239]: "Ennistymon · Spond: Ennistymon Community Centre"
                      - generic [ref=e240]: Loss €1.00
                    - paragraph [ref=e244]:
                      - text: Paid places
                      - strong [ref=e245]: "8"
                      - text: · Fee
                      - strong [ref=e246]: €5.50
                      - text: · Income
                      - strong [ref=e247]: €44.00
                      - text: · Hall
                      - strong [ref=e248]: €45.00
                - generic [ref=e249] [cursor=pointer]:
                  - 'checkbox "2026-09-16 · 19:00 · 7pm Ennistymon Pickleball Session Ennistymon · Spond: Ennistymon Community Centre Surplus €15.50 Paid places 11 · Fee €5.50 · Income €60.50 · Hall €45.00" [checked] [ref=e250]'
                  - generic [ref=e251]:
                    - generic [ref=e252]:
                      - generic [ref=e253]:
                        - paragraph [ref=e254]: 2026-09-16 · 19:00 · 7pm Ennistymon Pickleball Session
                        - paragraph [ref=e255]: "Ennistymon · Spond: Ennistymon Community Centre"
                      - generic [ref=e256]: Surplus €15.50
                    - paragraph [ref=e260]:
                      - text: Paid places
                      - strong [ref=e261]: "11"
                      - text: · Fee
                      - strong [ref=e262]: €5.50
                      - text: · Income
                      - strong [ref=e263]: €60.50
                      - text: · Hall
                      - strong [ref=e264]: €45.00
                - generic [ref=e265] [cursor=pointer]:
                  - 'checkbox "2026-09-16 · 20:00 · 8pm Ennistymon Pickleball Session Ennistymon · Spond: Ennistymon Community Centre Surplus €4.50 Paid places 9 · Fee €5.50 · Income €49.50 · Hall €45.00" [checked] [ref=e266]'
                  - generic [ref=e267]:
                    - generic [ref=e268]:
                      - generic [ref=e269]:
                        - paragraph [ref=e270]: 2026-09-16 · 20:00 · 8pm Ennistymon Pickleball Session
                        - paragraph [ref=e271]: "Ennistymon · Spond: Ennistymon Community Centre"
                      - generic [ref=e272]: Surplus €4.50
                    - paragraph [ref=e276]:
                      - text: Paid places
                      - strong [ref=e277]: "9"
                      - text: · Fee
                      - strong [ref=e278]: €5.50
                      - text: · Income
                      - strong [ref=e279]: €49.50
                      - text: · Hall
                      - strong [ref=e280]: €45.00
                - generic [ref=e281] [cursor=pointer]:
                  - 'checkbox "2026-09-23 · 19:00 · 7pm Ennistymon Pickleball Session Ennistymon · Spond: Ennistymon Community Centre Surplus €21.00 Paid places 12 (1 paid then declined) · Fee €5.50 · Income €66.00 · Hall €45.00" [checked] [ref=e282]'
                  - generic [ref=e283]:
                    - generic [ref=e284]:
                      - generic [ref=e285]:
                        - paragraph [ref=e286]: 2026-09-23 · 19:00 · 7pm Ennistymon Pickleball Session
                        - paragraph [ref=e287]: "Ennistymon · Spond: Ennistymon Community Centre"
                      - generic [ref=e288]: Surplus €21.00
                    - paragraph [ref=e292]:
                      - text: Paid places
                      - strong [ref=e293]: "12"
                      - text: (1 paid then declined) · Fee
                      - strong [ref=e294]: €5.50
                      - text: · Income
                      - strong [ref=e295]: €66.00
                      - text: · Hall
                      - strong [ref=e296]: €45.00
                - generic [ref=e297] [cursor=pointer]:
                  - 'checkbox "2026-09-23 · 20:00 · 8pm Ennistymon Pickleball Session Ennistymon · Spond: Ennistymon Community Centre Surplus €10.00 Paid places 10 · Fee €5.50 · Income €55.00 · Hall €45.00" [checked] [ref=e298]'
                  - generic [ref=e299]:
                    - generic [ref=e300]:
                      - generic [ref=e301]:
                        - paragraph [ref=e302]: 2026-09-23 · 20:00 · 8pm Ennistymon Pickleball Session
                        - paragraph [ref=e303]: "Ennistymon · Spond: Ennistymon Community Centre"
                      - generic [ref=e304]: Surplus €10.00
                    - paragraph [ref=e308]:
                      - text: Paid places
                      - strong [ref=e309]: "10"
                      - text: · Fee
                      - strong [ref=e310]: €5.50
                      - text: · Income
                      - strong [ref=e311]: €55.00
                      - text: · Hall
                      - strong [ref=e312]: €45.00
                - generic [ref=e313] [cursor=pointer]:
                  - 'checkbox "2026-09-30 · 19:00 · 7pm Ennistymon Pickleball Session Ennistymon · Spond: Ennistymon Community Centre Surplus €26.50 Paid places 13 · Fee €5.50 · Income €71.50 · Hall €45.00" [checked] [ref=e314]'
                  - generic [ref=e315]:
                    - generic [ref=e316]:
                      - generic [ref=e317]:
                        - paragraph [ref=e318]: 2026-09-30 · 19:00 · 7pm Ennistymon Pickleball Session
                        - paragraph [ref=e319]: "Ennistymon · Spond: Ennistymon Community Centre"
                      - generic [ref=e320]: Surplus €26.50
                    - paragraph [ref=e324]:
                      - text: Paid places
                      - strong [ref=e325]: "13"
                      - text: · Fee
                      - strong [ref=e326]: €5.50
                      - text: · Income
                      - strong [ref=e327]: €71.50
                      - text: · Hall
                      - strong [ref=e328]: €45.00
                - generic [ref=e329] [cursor=pointer]:
                  - 'checkbox "2026-09-30 · 20:00 · 8pm Ennistymon Pickleball Session Ennistymon · Spond: Ennistymon Community Centre Surplus €15.50 Paid places 11 · Fee €5.50 · Income €60.50 · Hall €45.00" [checked] [ref=e330]'
                  - generic [ref=e331]:
                    - generic [ref=e332]:
                      - generic [ref=e333]:
                        - paragraph [ref=e334]: 2026-09-30 · 20:00 · 8pm Ennistymon Pickleball Session
                        - paragraph [ref=e335]: "Ennistymon · Spond: Ennistymon Community Centre"
                      - generic [ref=e336]: Surplus €15.50
                    - paragraph [ref=e340]:
                      - text: Paid places
                      - strong [ref=e341]: "11"
                      - text: · Fee
                      - strong [ref=e342]: €5.50
                      - text: · Income
                      - strong [ref=e343]: €60.50
                      - text: · Hall
                      - strong [ref=e344]: €45.00
              - generic [ref=e345]:
                - button "Sync selected (7)" [ref=e346] [cursor=pointer]
                - generic [ref=e347]: Only ticked sessions will be written to Finance.
            - generic [ref=e348]:
              - paragraph [ref=e349]: "Spond connection: Clare Pickleball Members ✓"
              - paragraph [ref=e350]: Financial year starts September 1. Tracking begins 2026-09-01.
              - paragraph [ref=e351]: Synced 7 selected Spond sessions to Finance · added 7 · refreshed 0.
              - generic [ref=e352]:
                - generic [ref=e353]:
                  - paragraph [ref=e354]: Spond events in range
                  - paragraph [ref=e355]: "11"
                - generic [ref=e356]:
                  - paragraph [ref=e357]: In selected venues
                  - paragraph [ref=e358]: "8"
                - generic [ref=e359]:
                  - paragraph [ref=e360]: Matched to finance
                  - paragraph [ref=e361]: "7"
                - generic [ref=e362]:
                  - paragraph [ref=e363]: Added / refreshed
                  - paragraph [ref=e364]: 7 / 0
                - generic [ref=e365]:
                  - paragraph [ref=e366]: Skipped
                  - paragraph [ref=e367]: "0"
              - paragraph [ref=e368]: "Sync explanation: 3 belonged to venues you did not select; 0 had no matching configured session; 0 matched a selected session but has no player fee set; 0 fell outside the session’s active dates."
          - generic [ref=e371]:
            - generic [ref=e372]:
              - paragraph [ref=e373]: Ennistymon
              - paragraph [ref=e374]: 7 sessions/events · Income €407.00 · Cost €315.00
            - generic [ref=e375]: Surplus €92.00
          - generic [ref=e379]:
            - generic [ref=e380]:
              - generic [ref=e381]:
                - heading "By month" [level=2] [ref=e382]
                - paragraph [ref=e383]: Monthly income, total cost and surplus/loss.
              - table [ref=e386]:
                - rowgroup [ref=e387]:
                  - row [ref=e388]:
                    - columnheader "Month" [ref=e389]
                    - columnheader "Income" [ref=e390]
                    - columnheader "Cost" [ref=e391]
                    - columnheader "Result" [ref=e392]
                - rowgroup [ref=e393]:
                  - row [ref=e394]:
                    - cell "2026-09" [ref=e395]
                    - cell "€407.00" [ref=e396]
                    - cell "€315.00" [ref=e397]
                    - cell "Surplus €92.00" [ref=e398]
            - generic [ref=e403]:
              - generic [ref=e404]:
                - heading "By day" [level=2] [ref=e405]
                - paragraph [ref=e406]: Combines multiple sessions at the same venue on the same date.
              - table [ref=e409]:
                - rowgroup [ref=e410]:
                  - row [ref=e411]:
                    - columnheader "Date / venue" [ref=e412]
                    - columnheader "Income" [ref=e413]
                    - columnheader "Cost" [ref=e414]
                    - columnheader "Result" [ref=e415]
                - rowgroup [ref=e416]:
                  - row [ref=e417]:
                    - cell [ref=e418]:
                      - paragraph [ref=e419]: 2026-09-30
                      - paragraph [ref=e420]: Ennistymon · 2 rows
                    - cell "€132.00" [ref=e421]
                    - cell "€90.00" [ref=e422]
                    - cell "Surplus €42.00" [ref=e423]
                  - row [ref=e428]:
                    - cell [ref=e429]:
                      - paragraph [ref=e430]: 2026-09-23
                      - paragraph [ref=e431]: Ennistymon · 2 rows
                    - cell "€121.00" [ref=e432]
                    - cell "€90.00" [ref=e433]
                    - cell "Surplus €31.00" [ref=e434]
                  - row [ref=e439]:
                    - cell [ref=e440]:
                      - paragraph [ref=e441]: 2026-09-16
                      - paragraph [ref=e442]: Ennistymon · 2 rows
                    - cell "€110.00" [ref=e443]
                    - cell "€90.00" [ref=e444]
                    - cell "Surplus €20.00" [ref=e445]
                  - row [ref=e450]:
                    - cell [ref=e451]:
                      - paragraph [ref=e452]: 2026-09-09
                      - paragraph [ref=e453]: Ennistymon · 1 rows
                    - cell "€44.00" [ref=e454]
                    - cell "€45.00" [ref=e455]
                    - cell "Loss €1.00" [ref=e456]
          - generic [ref=e461]:
            - generic [ref=e462]:
              - generic [ref=e463]:
                - heading "Session & event results" [level=2] [ref=e464]
                - paragraph [ref=e465]: Green means the activity covered its costs. Red means the club subsidised it.
              - generic [ref=e466]: 7 rows
            - table [ref=e469]:
              - rowgroup [ref=e470]:
                - row [ref=e471]:
                  - columnheader "Date" [ref=e472]
                  - columnheader "Venue" [ref=e473]
                  - columnheader "Session/event" [ref=e474]
                  - columnheader "Paid places" [ref=e475]
                  - columnheader "Income" [ref=e476]
                  - columnheader "Cost" [ref=e477]
                  - columnheader "Result" [ref=e478]
              - rowgroup [ref=e479]:
                - row [ref=e480]:
                  - cell "2026-09-09 · 20:00" [ref=e481]
                  - cell "Ennistymon" [ref=e482]
                  - cell [ref=e483]:
                    - paragraph [ref=e484]: 8:00–9:00 pm
                    - paragraph [ref=e485]: Spond
                  - cell "8" [ref=e486]
                  - cell "€44.00" [ref=e487]
                  - cell "€45.00" [ref=e488]
                  - cell "Loss €1.00" [ref=e489]
                - row [ref=e494]:
                  - cell "2026-09-16 · 19:00" [ref=e495]
                  - cell "Ennistymon" [ref=e496]
                  - cell [ref=e497]:
                    - paragraph [ref=e498]: 7:00–8:00 pm
                    - paragraph [ref=e499]: Spond
                  - cell "11" [ref=e500]
                  - cell "€60.50" [ref=e501]
                  - cell "€45.00" [ref=e502]
                  - cell "Surplus €15.50" [ref=e503]
                - row [ref=e508]:
                  - cell "2026-09-16 · 20:00" [ref=e509]
                  - cell "Ennistymon" [ref=e510]
                  - cell [ref=e511]:
                    - paragraph [ref=e512]: 8:00–9:00 pm
                    - paragraph [ref=e513]: Spond
                  - cell "9" [ref=e514]
                  - cell "€49.50" [ref=e515]
                  - cell "€45.00" [ref=e516]
                  - cell "Surplus €4.50" [ref=e517]
                - row [ref=e522]:
                  - cell "2026-09-23 · 19:00" [ref=e523]
                  - cell "Ennistymon" [ref=e524]
                  - cell [ref=e525]:
                    - paragraph [ref=e526]: 7:00–8:00 pm
                    - paragraph [ref=e527]: Spond · 1 paid then declined
                  - cell "12" [ref=e528]
                  - cell "€66.00" [ref=e529]
                  - cell "€45.00" [ref=e530]
                  - cell "Surplus €21.00" [ref=e531]
                - row [ref=e536]:
                  - cell "2026-09-23 · 20:00" [ref=e537]
                  - cell "Ennistymon" [ref=e538]
                  - cell [ref=e539]:
                    - paragraph [ref=e540]: 8:00–9:00 pm
                    - paragraph [ref=e541]: Spond
                  - cell "10" [ref=e542]
                  - cell "€55.00" [ref=e543]
                  - cell "€45.00" [ref=e544]
                  - cell "Surplus €10.00" [ref=e545]
                - row [ref=e550]:
                  - cell "2026-09-30 · 19:00" [ref=e551]
                  - cell "Ennistymon" [ref=e552]
                  - cell [ref=e553]:
                    - paragraph [ref=e554]: 7:00–8:00 pm
                    - paragraph [ref=e555]: Spond
                  - cell "13" [ref=e556]
                  - cell "€71.50" [ref=e557]
                  - cell "€45.00" [ref=e558]
                  - cell "Surplus €26.50" [ref=e559]
                - row [ref=e564]:
                  - cell "2026-09-30 · 20:00" [ref=e565]
                  - cell "Ennistymon" [ref=e566]
                  - cell [ref=e567]:
                    - paragraph [ref=e568]: 8:00–9:00 pm
                    - paragraph [ref=e569]: Spond
                  - cell "11" [ref=e570]
                  - cell "€60.50" [ref=e571]
                  - cell "€45.00" [ref=e572]
                  - cell "Surplus €15.50" [ref=e573]
          - generic [ref=e578]:
            - generic [ref=e579]:
              - heading "Club finance settings" [level=2] [ref=e580]
              - paragraph [ref=e581]: Tenant-specific reporting period. Each club can choose its own financial year and tracking start date.
            - generic [ref=e582]:
              - generic [ref=e583]:
                - text: Financial year starts
                - combobox [ref=e584] [cursor=pointer]:
                  - generic: September
              - generic [ref=e587]:
                - text: Day
                - spinbutton [ref=e588]: "1"
              - generic [ref=e589]:
                - text: Track from
                - textbox [ref=e590]: 2026-09-01
              - button "Save settings" [ref=e591] [cursor=pointer]
          - generic [ref=e592]:
            - generic [ref=e593]:
              - generic [ref=e598]:
                - heading "Venue costs" [level=2] [ref=e599]
                - paragraph [ref=e600]: "Set each hall once: address + hourly hire rate. All session costs are calculated from it."
              - generic [ref=e601]:
                - generic [ref=e603]:
                  - generic [ref=e604]:
                    - paragraph [ref=e605]: St Joseph’s, Doora Barefield
                    - paragraph [ref=e606]: Gurteen, Quin Road, Co. Clare
                    - paragraph [ref=e607]: €30.00 / hour
                  - button "Edit" [ref=e608] [cursor=pointer]
                - generic [ref=e610]:
                  - generic [ref=e611]:
                    - paragraph [ref=e612]: Ennistymon
                    - paragraph [ref=e613]: Parliament Street, Ennistymon
                    - paragraph [ref=e614]: €45.00 / hour
                  - button "Edit" [ref=e615] [cursor=pointer]
                - generic [ref=e617]:
                  - generic [ref=e618]:
                    - paragraph [ref=e619]: Corofin
                    - paragraph [ref=e620]: Corofin GAA Sports Hall
                    - paragraph [ref=e621]: Rate not set
                  - button "Edit" [ref=e622] [cursor=pointer]
                - generic [ref=e624]:
                  - generic [ref=e625]:
                    - paragraph [ref=e626]: Clarecastle
                    - paragraph [ref=e627]: No address set
                    - paragraph [ref=e628]: Rate not set
                  - button "Edit" [ref=e629] [cursor=pointer]
                - generic [ref=e631]:
                  - generic [ref=e632]:
                    - paragraph [ref=e633]: Shannon
                    - paragraph [ref=e634]: No address set
                    - paragraph [ref=e635]: Rate not set
                  - button "Edit" [ref=e636] [cursor=pointer]
            - generic [ref=e637]:
              - generic [ref=e638]:
                - generic [ref=e641]:
                  - heading "Recurring sessions" [level=2] [ref=e642]
                  - paragraph [ref=e643]: These are saved once and reused. You do not need to enter them again before each sync.
                - button "Add / change session" [ref=e644] [cursor=pointer]
              - generic [ref=e645]:
                - generic [ref=e646]:
                  - generic [ref=e647]:
                    - generic [ref=e648]:
                      - strong [ref=e649]: St Joseph’s, Doora Barefield
                      - text: · Monday 19:00 · 90 min
                    - generic [ref=e650]: Expected hall cost €45.00
                  - paragraph [ref=e651]: "Income: Spond · player fee not set"
                - generic [ref=e652]:
                  - generic [ref=e653]:
                    - generic [ref=e654]:
                      - strong [ref=e655]: St Joseph’s, Doora Barefield
                      - text: · Monday 20:30 · 90 min
                    - generic [ref=e656]: Expected hall cost €45.00
                  - paragraph [ref=e657]: "Income: Spond · player fee not set"
                - generic [ref=e658]:
                  - generic [ref=e659]:
                    - generic [ref=e660]:
                      - strong [ref=e661]: St Joseph’s, Doora Barefield
                      - text: · Thursday 19:00 · 90 min
                    - generic [ref=e662]: Expected hall cost €45.00
                  - paragraph [ref=e663]: "Income: Spond · player fee not set"
                - generic [ref=e664]:
                  - generic [ref=e665]:
                    - generic [ref=e666]:
                      - strong [ref=e667]: St Joseph’s, Doora Barefield
                      - text: · Thursday 20:30 · 90 min
                    - generic [ref=e668]: Expected hall cost €45.00
                  - paragraph [ref=e669]: "Income: Spond · player fee not set"
                - generic [ref=e670]:
                  - generic [ref=e671]:
                    - generic [ref=e672]:
                      - strong [ref=e673]: Ennistymon
                      - text: · Wednesday 19:00 · 60 min
                    - generic [ref=e674]: Expected hall cost €45.00
                  - paragraph [ref=e675]: "Income: Spond · €5.50 per player"
                - generic [ref=e676]:
                  - generic [ref=e677]:
                    - generic [ref=e678]:
                      - strong [ref=e679]: Ennistymon
                      - text: · Wednesday 20:00 · 60 min
                    - generic [ref=e680]: Expected hall cost €45.00
                  - paragraph [ref=e681]: "Income: Spond · €5.50 per player"
          - generic [ref=e682]:
            - generic [ref=e686]:
              - heading "Record one-off event or adjustment" [level=2] [ref=e687]
              - paragraph [ref=e688]: For interclub days, special events, invoices or anything not covered by a recurring session.
            - generic [ref=e689]:
              - generic [ref=e690]:
                - text: Date
                - textbox [ref=e691]: 2026-09-30
              - generic [ref=e692]:
                - text: Venue
                - combobox [ref=e693] [cursor=pointer]:
                  - generic: Choose venue
              - generic [ref=e696]:
                - text: Event/session label
                - textbox "e.g. Clare v Galway" [ref=e697]
              - generic [ref=e698]:
                - text: Duration (minutes)
                - spinbutton [ref=e699]: "180"
              - generic [ref=e700]:
                - text: Paid places
                - spinbutton [ref=e701]
              - generic [ref=e702]:
                - text: Fee / person (€)
                - spinbutton [ref=e703]
              - generic [ref=e704]:
                - text: Other costs (€)
                - spinbutton [ref=e705]: "0"
            - button "Record event/session" [ref=e706] [cursor=pointer]
  - contentinfo "RallyHub copyright" [ref=e707]:
    - generic [ref=e708]: © 2026 RallyHub All rights reserved.
```

# Test source

```ts
  24  | const settings=[{id:'settings',tenant_id:tenantId,club_id:clubId,currency:'EUR',financial_year_start_month:9,financial_year_start_day:1,tracking_start_date:'2026-09-01'}];
  25  | const bindings=[{id:'binding1',tenant_id:tenantId,club_id:clubId,listing_slug:'clare-pickleball',directory_session_key:'ennistymon-1',spond_group_id:'245CFD5D9CF044B7B203A3182BD02721',spond_event_id:'4FA65CB24B154F4AADCDC1EE376BEBF2',active:true}];
  26  | const connections=[{id:'connection1',listing_slug:'clare-pickleball',spond_group_id:'245CFD5D9CF044B7B203A3182BD02721',spond_group_name:'Clare Pickleball Members',status:'active',last_synced_at:'2026-09-28T12:15:46.487Z'}];
  27  | const dates=['2026-09-09','2026-09-16','2026-09-23','2026-09-30'];
  28  | const syncedEntries=dates.flatMap((date,index)=>[
  29  |   {id:`e19-${index}`,tenant_id:tenantId,club_id:clubId,activity_date:date,activity_start_time:'19:00',venue_id:'enn',venue_name:'Ennistymon',session_label:'7:00–8:00 pm',source_type:'spond_session',paid_places:10+index,going_count:10+index,declined_paid_count:index===2?1:0,fee_per_person:5.5,income_amount:(10+index)*5.5,expected_cost_amount:45,other_cost_amount:0},
  30  |   {id:`e20-${index}`,tenant_id:tenantId,club_id:clubId,activity_date:date,activity_start_time:'20:00',venue_id:'enn',venue_name:'Ennistymon',session_label:'8:00–9:00 pm',source_type:'spond_session',paid_places:8+index,going_count:8+index,declined_paid_count:0,fee_per_person:5.5,income_amount:(8+index)*5.5,expected_cost_amount:45,other_cost_amount:0},
  31  | ]);
  32  | const previewCandidates=syncedEntries.map((row,index)=>({
  33  |   occurrenceKey:`occ-${index}`,
  34  |   activityDate:row.activity_date,
  35  |   startTime:row.activity_start_time,
  36  |   heading:row.activity_start_time==='19:00'?'7pm Ennistymon Pickleball Session':'8pm Ennistymon Pickleball Session',
  37  |   spondVenueName:'Ennistymon Community Centre',
  38  |   venueId:'enn',venueName:'Ennistymon',sessionLabel:row.session_label,
  39  |   goingCount:row.going_count,declinedPaidCount:row.declined_paid_count,paidPlaces:row.paid_places,
  40  |   feePerPerson:5.5,incomeAmount:row.income_amount,expectedCostAmount:45,netAmount:row.income_amount-45,ready:true,reason:'',matchMode:index>=6?'exact_event_id':'venue_day_time'
  41  | }));
  42  | 
  43  | async function installFinanceBackend(page,{zeroMatch=false}={}){
  44  |   let syncedRows=[];
  45  |   await page.addInitScript(()=>localStorage.setItem('base44_access_token','finance-e2e-token'));
  46  |   await page.route('**/api/apps/**',async route=>{
  47  |     const req=route.request(); const url=new URL(req.url()); const path=url.pathname;
  48  |     if(path.includes('/analytics/')) return json(route,{});
  49  |     if(path.includes('/public-settings/')) return json(route,{id:APP_ID,public_settings:{}});
  50  |     if(path.endsWith('/entities/User/me')||path.endsWith('/users/me')||path.endsWith('/auth/me')) return json(route,user);
  51  |     const fnMarker=`/api/apps/${APP_ID}/functions/`; const fi=path.indexOf(fnMarker);
  52  |     if(fi>=0){
  53  |       const name=decodeURIComponent(path.slice(fi+fnMarker.length).split('/')[0]);
  54  |       let body={};try{body=req.postDataJSON()||{};}catch{}
  55  |       if(name==='securityContext') return json(route,{success:true,context:null});
  56  |       if(name==='spondIntegrationWorking'&&body.action==='directory_finance_preview'){
  57  |         if(!Array.isArray(body.selectedVenueIds) || body.selectedVenueIds.length!==1 || body.selectedVenueIds[0]!=='enn') return json(route,{error:'Finance journey test expected Ennistymon-only preview'},400);
  58  |         if(zeroMatch) return json(route,{success:true,preview:true,fromDate:body.fromDate,toDate:body.toDate,candidates:[],fetchedCount:0,totalSpondEventsInRange:11,readyCount:0,diagnostics:{exactMatches:0,scheduleMatches:0,unmatchedRule:8,missingFee:0,outsideEffectiveRange:0,ignoredNotSelected:3},connection:{groupId:connections[0].spond_group_id,groupName:connections[0].spond_group_name}});
  59  |         return json(route,{success:true,preview:true,fromDate:body.fromDate,toDate:body.toDate,candidates:previewCandidates,fetchedCount:8,totalSpondEventsInRange:11,readyCount:8,diagnostics:{exactMatches:2,scheduleMatches:6,unmatchedRule:0,missingFee:0,outsideEffectiveRange:0,ignoredNotSelected:3},connection:{groupId:connections[0].spond_group_id,groupName:connections[0].spond_group_name}});
  60  |       }
  61  |       if(name==='spondIntegrationWorking'&&body.action==='directory_finance_sync'){
  62  |         if(!Array.isArray(body.selectedOccurrenceKeys)||!body.selectedOccurrenceKeys.length) return json(route,{error:'Finance journey test expected selected Spond occurrences'},400);
  63  |         syncedRows=body.selectedOccurrenceKeys.map(key=>syncedEntries[previewCandidates.findIndex(row=>row.occurrenceKey===key)]).filter(Boolean);
  64  |         return json(route,{success:true,fromDate:body.fromDate,toDate:body.toDate,created:syncedRows.length,updated:0,skipped:0,fetchedCount:8,totalSpondEventsInRange:11,matchedCount:syncedRows.length,diagnostics:{exactMatches:2,scheduleMatches:6,unmatchedRule:0,missingFee:0,outsideEffectiveRange:0,ignoredNotSelected:3,ignoredNotChosen:8-syncedRows.length},connection:{groupId:connections[0].spond_group_id,groupName:connections[0].spond_group_name},synced:syncedRows});
  65  |       }
  66  |       return json(route,{success:true,items:[],records:[],events:[],data:[]});
  67  |     }
  68  |     const entityMarker=`/api/apps/${APP_ID}/entities/`; const ei=path.indexOf(entityMarker);
  69  |     if(ei>=0){
  70  |       const entity=decodeURIComponent(path.slice(ei+entityMarker.length).split('/')[0]);
  71  |       if(entity==='ClubFinanceSettings') return json(route,settings);
  72  |       if(entity==='Venue') return json(route,venues);
  73  |       if(entity==='ClubFinanceVenueRule') return json(route,rules);
  74  |       if(entity==='ClubFinanceEntry') return json(route,syncedRows);
  75  |       if(entity==='SpondSessionBinding') return json(route,bindings);
  76  |       if(entity==='DirectorySpondConnection') return json(route,connections);
  77  |       return json(route,[]);
  78  |     }
  79  |     return json(route,{});
  80  |   });
  81  | }
  82  | 
  83  | async function openFinance(page){
  84  |   await page.goto('/app/finance',{waitUntil:'domcontentloaded'});
  85  |   await page.locator('main').waitFor({state:'attached',timeout:15000});
  86  |   await expect(page.getByRole('heading',{name:'Finance Summary'})).toBeVisible({timeout:15000});
  87  |   await expect(page.getByText('How to use this page')).toBeVisible();
  88  |   await expect(page.getByTestId('finance-spond-status')).toContainText('Spond connected · Clare Pickleball Members');
  89  |   await expect(page.getByText('6 recurring finance sessions configured')).toBeVisible();
  90  |   await expect(page.getByText('2 venues with finance tracking enabled')).toBeVisible();
  91  | }
  92  | 
  93  | test('Finance admin journey: month popover, session discovery, selection and sync',async({page})=>{
  94  |   await installFinanceBackend(page);
  95  |   const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  96  |   await openFinance(page);
  97  | 
  98  |   await page.getByTestId('finance-venue-all').click();
  99  |   await page.getByTestId('finance-venue-enn').click();
  100 |   await expect(page.getByTestId('finance-venue-enn').locator('[role="checkbox"]')).toHaveAttribute('data-state','checked');
  101 | 
  102 |   await page.getByTestId('finance-month-filter').click();
  103 |   await expect(page.getByTestId('finance-month-1')).toBeVisible();
  104 |   await expect(page.getByTestId('finance-month-12')).toBeVisible();
  105 |   await page.getByTestId('finance-month-9').click();
  106 |   await page.getByTestId('finance-month-10').click();
  107 |   await page.keyboard.press('Escape');
  108 |   await expect(page.getByTestId('finance-month-filter')).toContainText('2 months selected');
  109 | 
  110 |   await page.getByRole('button',{name:'Find Spond sessions'}).click();
  111 |   await expect(page.getByTestId('finance-sync-message')).toContainText('Found 8 matching sessions');
  112 |   await expect(page.getByTestId('finance-spond-preview')).toContainText('8 found');
  113 |   await expect(page.getByText('2026-09-30 · 19:00 · 7pm Ennistymon Pickleball Session')).toBeVisible();
  114 |   await expect(page.getByText('2026-09-30 · 20:00 · 8pm Ennistymon Pickleball Session')).toBeVisible();
  115 |   await expect(page.getByTestId('finance-spond-preview')).toContainText('€5.50');
  116 |   await expect(page.getByTestId('finance-sync-selected')).toContainText('Sync selected (8)');
  117 | 
  118 |   const firstOccurrence=page.locator('[data-testid^="finance-spond-occurrence-"]').first();
  119 |   await firstOccurrence.locator('[role="checkbox"]').click();
  120 |   await expect(page.getByTestId('finance-sync-selected')).toContainText('Sync selected (7)');
  121 |   await page.getByTestId('finance-sync-selected').click();
  122 |   await expect(page.getByTestId('finance-sync-message')).toContainText('Synced 7 selected Spond sessions to Finance');
  123 |   await expect(page.getByRole('cell',{name:'2026-09-30 · 19:00'})).toBeVisible();
> 124 |   await expect(page.getByText('1 paid then declined')).toBeVisible();
      |                                                        ^ Error: expect(locator).toBeVisible() failed
  125 | 
  126 |   await expect(page.getByTestId('finance-recurring-section')).toContainText('You do not need to enter them again before each sync');
  127 |   expect(errors).toEqual([]);
  128 | });
  129 | 
  130 | test('Finance discovery explains a zero-match result before any write',async({page})=>{
  131 |   await installFinanceBackend(page,{zeroMatch:true});
  132 |   await openFinance(page);
  133 |   await page.getByTestId('finance-venue-all').click();
  134 |   await page.getByTestId('finance-venue-enn').click();
  135 |   await page.getByRole('button',{name:'Find Spond sessions'}).click();
  136 |   await expect(page.getByTestId('finance-sync-message')).toContainText('returned 11 events in the date/month range, but none matched');
  137 |   await expect(page.getByTestId('finance-spond-preview')).toContainText('0 found');
  138 |   await expect(page.getByTestId('finance-sync-selected')).toHaveCount(0);
  139 | });
  140 | 
  141 | test.describe('Finance mobile journey',()=>{
  142 |   test.use({viewport:{width:390,height:844}});
  143 |   test('Finance discovery and selected sync stay phone-width',async({page})=>{
  144 |     await installFinanceBackend(page);
  145 |     await openFinance(page);
  146 |     await page.getByTestId('finance-venue-all').click();
  147 |     await page.getByTestId('finance-venue-enn').click();
  148 |     await page.getByRole('button',{name:'Find Spond sessions'}).click();
  149 |     await expect(page.getByText('2026-09-30 · 19:00 · 7pm Ennistymon Pickleball Session')).toBeVisible();
  150 |     let widths=await page.evaluate(()=>({innerWidth,scrollWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth}));
  151 |     expect(widths.scrollWidth).toBeLessThanOrEqual(widths.innerWidth+2);
  152 |     expect(widths.bodyWidth).toBeLessThanOrEqual(widths.innerWidth+2);
  153 |     await page.getByTestId('finance-sync-selected').click();
  154 |     await expect(page.getByTestId('finance-sync-message')).toContainText('Synced 8 selected Spond sessions');
  155 |     widths=await page.evaluate(()=>({innerWidth,scrollWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth}));
  156 |     expect(widths.scrollWidth).toBeLessThanOrEqual(widths.innerWidth+2);
  157 |     expect(widths.bodyWidth).toBeLessThanOrEqual(widths.innerWidth+2);
  158 |   });
  159 | });
  160 | 
```