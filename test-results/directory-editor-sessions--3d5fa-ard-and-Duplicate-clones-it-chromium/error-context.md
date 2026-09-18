# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: directory-editor-sessions.spec.mjs >> directory editor: Add session is visible, adds a card, and Duplicate clones it
- Location: e2e/directory-editor-sessions.spec.mjs:30:1

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  locator('[data-testid="directory-session-card"].ring-primary')
Expected: 1
Received: 0
Timeout:  3000ms

Call log:
  - Expect "toHaveCount" locator('[data-testid="directory-session-card"].ring-primary') with timeout 3000ms
  - waiting for locator('[data-testid="directory-session-card"].ring-primary')
    10 × locator resolved to 0 elements
       - unexpected value "0"

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - generic [ref=e5]:
      - link "RallyHub RallyHub" [ref=e6] [cursor=pointer]:
        - /url: /
        - img "RallyHub" [ref=e7]
        - generic [ref=e8]: RallyHub
      - navigation [ref=e9]:
        - link "Club Directory" [ref=e10] [cursor=pointer]:
          - /url: /directory
        - link "Manage listing" [ref=e11] [cursor=pointer]:
          - /url: /directory?manage=1
        - link "Add club" [ref=e16] [cursor=pointer]:
          - /url: /directory/add
        - link "Help" [ref=e19] [cursor=pointer]:
          - /url: /directory/help
      - generic [ref=e23]:
        - button "Current appearance Dark. Change appearance." [ref=e24] [cursor=pointer]
        - generic [ref=e25]:
          - paragraph [ref=e26]: Signed in
          - paragraph [ref=e27]: Directory Editor
        - button "Sign out" [ref=e28] [cursor=pointer]
        - button "Directory Admin" [ref=e29] [cursor=pointer]
        - button "Switch to RallyHub Club" [ref=e30] [cursor=pointer]
  - main [ref=e31]:
    - generic [ref=e32]:
      - button "Back to public listing" [ref=e33] [cursor=pointer]
      - generic [ref=e36]: Unsaved changes
    - generic [ref=e37]:
      - generic [ref=e38]:
        - generic [ref=e40]:
          - generic [ref=e41]:
            - paragraph [ref=e42]: Super Admin · Unclaimed listing
            - heading "Clare Pickleball" [level=1] [ref=e43]
            - generic [ref=e44]:
              - generic [ref=e45]: County Clare
              - generic [ref=e46]: 3 venues
              - generic [ref=e47]: 8 weekly sessions
            - paragraph [ref=e48]: Keep the public listing accurate. Club name and county are locked to protect the directory identity.
          - generic [ref=e49]:
            - button "View public listing" [ref=e50] [cursor=pointer]
            - button "Save before email" [disabled]
            - button "Save before WhatsApp" [disabled]
            - button "Save changes" [ref=e51] [cursor=pointer]
        - navigation [ref=e52]:
          - link "Basics" [ref=e53] [cursor=pointer]:
            - /url: "#basics"
          - link "Contact" [ref=e54] [cursor=pointer]:
            - /url: "#contact"
          - link "Venues" [ref=e55] [cursor=pointer]:
            - /url: "#venues"
          - link "Sessions" [ref=e56] [cursor=pointer]:
            - /url: "#sessions"
          - button "Enhance listing" [ref=e57] [cursor=pointer]
          - link "Help" [ref=e58] [cursor=pointer]:
            - /url: /directory/help
      - generic [ref=e63]:
        - generic [ref=e64]:
          - heading "Start with four things" [level=2] [ref=e69]
          - paragraph [ref=e70]: 1. Check the club description · 2. Check the public contact · 3. Check the main venue · 4. Check the regular sessions. That is enough for a useful listing. Everything else is optional.
        - link [ref=e71] [cursor=pointer]:
          - /url: /directory/help
          - button "Open help guide" [ref=e72]
      - generic [ref=e73]:
        - heading "Public club information" [level=2] [ref=e77]
        - generic [ref=e78]:
          - generic [ref=e79]:
            - text: Club description
            - textbox "Tell players what your club is about, where you play and who you welcome." [ref=e80]: A welcoming, members-only pickleball club with indoor sessions across County Clare.
            - paragraph [ref=e81]: This is the main introduction players see in search and on your club page. Claim/unclaimed status is controlled automatically by RallyHub and does not need to be typed here.
          - generic [ref=e82]:
            - generic [ref=e83]:
              - paragraph [ref=e84]: Optional club details
              - paragraph [ref=e85]: Website, social links, joining information and attendance policy can all be added later.
            - button "Enhance listing" [ref=e86] [cursor=pointer]
          - generic [ref=e87]:
            - text: Club logo
            - generic [ref=e88]:
              - img "Club logo preview" [ref=e89]
              - generic [ref=e90]:
                - generic [ref=e91]:
                  - generic [ref=e92] [cursor=pointer]: Replace logo
                  - button "Remove logo" [ref=e96] [cursor=pointer]
                - paragraph [ref=e97]: JPG, PNG or WebP up to 5 MB. RallyHub automatically removes common transparent/white padding, centres the crest, then lets you resize and reposition it before upload.
      - generic [ref=e98]:
        - heading "Public club contact" [level=2] [ref=e103]
        - paragraph [ref=e104]: These details are shown publicly. For an unclaimed admin-curated listing, the contact email is also the trusted email used to verify the representative when you send the claim invitation.
        - generic [ref=e105]:
          - generic [ref=e106]:
            - text: Contact name
            - textbox [ref=e107]: Brian Moore
          - generic [ref=e108]:
            - text: Contact email
            - textbox [ref=e109]: info@clarepickleball.ie
          - generic [ref=e110]:
            - text: Contact phone
            - textbox "e.g. 087 123 4567" [ref=e111]: 087 810 0333
          - generic [ref=e112]:
            - text: WhatsApp
            - generic [ref=e113] [cursor=pointer]:
              - checkbox "Use this mobile for WhatsApp RallyHub will create the WhatsApp link automatically from the contact number." [checked] [ref=e114]
              - generic [ref=e115]:
                - strong [ref=e116]: Use this mobile for WhatsApp
                - generic [ref=e117]: RallyHub will create the WhatsApp link automatically from the contact number.
            - textbox "Generated WhatsApp link" [ref=e118]: https://wa.me/353878100333
      - generic [ref=e119]:
        - generic [ref=e120]:
          - generic [ref=e121]:
            - heading "Venues" [level=2] [ref=e127]
            - paragraph [ref=e128]: Add every regular place where the club plays.
          - button "Add venue" [ref=e129] [cursor=pointer]
        - generic [ref=e130]:
          - generic [ref=e131]:
            - generic [ref=e132]:
              - paragraph [ref=e133]: St Joseph's Doora Barefield GAA Sports Hall
              - paragraph [ref=e134]: Venue 1
            - button "Remove" [ref=e135] [cursor=pointer]
          - generic [ref=e136]:
            - generic [ref=e137]:
              - text: Name
              - textbox "Venue name" [ref=e138]: St Joseph's Doora Barefield GAA Sports Hall
            - generic [ref=e139]:
              - text: Short name
              - textbox "Used on session cards" [ref=e140]: Doora Barefield
            - generic [ref=e141]:
              - text: Address
              - textbox [ref=e142]: Gurteen, Quin Road, Co. Clare
            - generic [ref=e143]:
              - text: Eircode / postcode
              - textbox [ref=e144]: V95 PD36
              - paragraph [ref=e145]: Address and Eircode/postcode are used to position this venue automatically on the all-Ireland club map when you save.
            - generic [ref=e146]:
              - text: Courts
              - spinbutton [ref=e147]: "4"
            - generic [ref=e148]:
              - text: Venue type
              - combobox [ref=e149]:
                - option "Not specified"
                - option "Indoor" [selected]
                - option "Outdoor"
            - generic [ref=e150]:
              - text: Who can play here?
              - combobox [ref=e151]:
                - option "Not specified" [selected]
                - option "Members only"
                - option "Members and invited guests"
                - option "Guests welcome"
                - option "Public / open play"
                - option "Pay to play"
                - option "Contact club"
              - paragraph [ref=e152]: This is public and helps players know whether they may attend.
            - generic [ref=e153]:
              - text: Venue website
              - textbox "https://…" [ref=e154]
            - generic [ref=e155]:
              - generic [ref=e156]: Google Maps link (optional)
              - textbox "Paste a full Google Maps link if you have one" [ref=e157]: https://maps.google.com/?q=V95+PD36
              - paragraph [ref=e158]: You do not need this link. RallyHub can use the address/Eircode, or you can set the pin directly on the map below.
          - generic [ref=e159]:
            - generic [ref=e160]:
              - paragraph [ref=e161]: Map position
              - paragraph [ref=e162]: This venue has a map pin.
            - button "Set / adjust pin" [ref=e163] [cursor=pointer]
        - generic [ref=e164]:
          - generic [ref=e165]:
            - generic [ref=e166]:
              - paragraph [ref=e167]: Corofin GAA Sports Hall
              - paragraph [ref=e168]: Venue 2
            - button "Remove" [ref=e169] [cursor=pointer]
          - generic [ref=e170]:
            - generic [ref=e171]:
              - text: Name
              - textbox "Venue name" [ref=e172]: Corofin GAA Sports Hall
            - generic [ref=e173]:
              - text: Short name
              - textbox "Used on session cards" [ref=e174]: Corofin
            - generic [ref=e175]:
              - text: Address
              - textbox [ref=e176]: Corofin, Co. Clare
            - generic [ref=e177]:
              - text: Eircode / postcode
              - textbox [ref=e178]: V95 XD56
              - paragraph [ref=e179]: Address and Eircode/postcode are used to position this venue automatically on the all-Ireland club map when you save.
            - generic [ref=e180]:
              - text: Courts
              - spinbutton [ref=e181]: "3"
            - generic [ref=e182]:
              - text: Venue type
              - combobox [ref=e183]:
                - option "Not specified"
                - option "Indoor" [selected]
                - option "Outdoor"
            - generic [ref=e184]:
              - text: Who can play here?
              - combobox [ref=e185]:
                - option "Not specified" [selected]
                - option "Members only"
                - option "Members and invited guests"
                - option "Guests welcome"
                - option "Public / open play"
                - option "Pay to play"
                - option "Contact club"
              - paragraph [ref=e186]: This is public and helps players know whether they may attend.
            - generic [ref=e187]:
              - text: Venue website
              - textbox "https://…" [ref=e188]
            - generic [ref=e189]:
              - generic [ref=e190]: Google Maps link (optional)
              - textbox "Paste a full Google Maps link if you have one" [ref=e191]: https://maps.google.com/?q=V95+XD56
              - paragraph [ref=e192]: You do not need this link. RallyHub can use the address/Eircode, or you can set the pin directly on the map below.
          - generic [ref=e193]:
            - generic [ref=e194]:
              - paragraph [ref=e195]: Map position
              - paragraph [ref=e196]: This venue has a map pin.
            - button "Set / adjust pin" [ref=e197] [cursor=pointer]
        - generic [ref=e198]:
          - generic [ref=e199]:
            - generic [ref=e200]:
              - paragraph [ref=e201]: Ennistymon Community Centre
              - paragraph [ref=e202]: Venue 3
            - button "Remove" [ref=e203] [cursor=pointer]
          - generic [ref=e204]:
            - generic [ref=e205]:
              - text: Name
              - textbox "Venue name" [ref=e206]: Ennistymon Community Centre
            - generic [ref=e207]:
              - text: Short name
              - textbox "Used on session cards" [ref=e208]: Ennistymon
            - generic [ref=e209]:
              - text: Address
              - textbox [ref=e210]: Parliament Street, Ennistymon, Co. Clare
            - generic [ref=e211]:
              - text: Eircode / postcode
              - textbox [ref=e212]: V95 X8XC
              - paragraph [ref=e213]: Address and Eircode/postcode are used to position this venue automatically on the all-Ireland club map when you save.
            - generic [ref=e214]:
              - text: Courts
              - spinbutton [ref=e215]: "3"
            - generic [ref=e216]:
              - text: Venue type
              - combobox [ref=e217]:
                - option "Not specified"
                - option "Indoor" [selected]
                - option "Outdoor"
            - generic [ref=e218]:
              - text: Who can play here?
              - combobox [ref=e219]:
                - option "Not specified" [selected]
                - option "Members only"
                - option "Members and invited guests"
                - option "Guests welcome"
                - option "Public / open play"
                - option "Pay to play"
                - option "Contact club"
              - paragraph [ref=e220]: This is public and helps players know whether they may attend.
            - generic [ref=e221]:
              - text: Venue website
              - textbox "https://…" [ref=e222]
            - generic [ref=e223]:
              - generic [ref=e224]: Google Maps link (optional)
              - textbox "Paste a full Google Maps link if you have one" [ref=e225]: https://maps.app.goo.gl/xgPBCUfrBp35vu116
              - paragraph [ref=e226]: You do not need this link. RallyHub can use the address/Eircode, or you can set the pin directly on the map below.
          - generic [ref=e227]:
            - generic [ref=e228]:
              - paragraph [ref=e229]: Map position
              - paragraph [ref=e230]: This venue has a map pin.
            - button "Set / adjust pin" [ref=e231] [cursor=pointer]
      - generic [ref=e232]:
        - generic [ref=e233]:
          - generic [ref=e234]:
            - heading "Weekly sessions" [level=2] [ref=e238]
            - paragraph [ref=e239]: Duplicate a similar session to save retyping. RallyHub automatically orders sessions Monday to Sunday, then by start time.
          - button "Add blank session" [active] [ref=e240] [cursor=pointer]
        - generic [ref=e241]:
          - generic [ref=e242]:
            - generic [ref=e243]:
              - paragraph [ref=e244]: Monday · 19:00 · Club Session
              - paragraph [ref=e245]: Weekly session 1
            - generic [ref=e246]:
              - button "Duplicate" [ref=e247] [cursor=pointer]
              - button "Remove" [ref=e248] [cursor=pointer]
          - generic [ref=e249]:
            - generic [ref=e250]:
              - text: Day
              - combobox [ref=e251]:
                - option "Monday" [selected]
                - option "Tuesday"
                - option "Wednesday"
                - option "Thursday"
                - option "Friday"
                - option "Saturday"
                - option "Sunday"
            - generic [ref=e252]:
              - text: Venue
              - combobox [ref=e253]:
                - option "Doora Barefield" [selected]
                - option "Corofin"
                - option "Ennistymon"
            - generic [ref=e254]:
              - generic [ref=e255]: Meet time (optional)
              - textbox [ref=e256]
            - generic [ref=e257]:
              - text: Start
              - textbox [ref=e258]: 19:00
            - generic [ref=e259]:
              - generic [ref=e260]: End (optional)
              - textbox [ref=e261]
            - generic [ref=e262]:
              - text: Session / level
              - textbox "e.g. Social, Improver, Match Play" [ref=e263]: Club Session
            - generic [ref=e264]:
              - text: Price (€)
              - spinbutton [ref=e265]
            - generic [ref=e266]:
              - text: Payment
              - combobox [ref=e267]:
                - option "Not specified" [selected]
                - option "Cash"
                - option "Online"
                - option "Pay at venue"
                - option "Included in membership"
                - option "Contact club"
            - generic [ref=e268]:
              - text: Capacity
              - spinbutton [ref=e269]
            - generic [ref=e270]:
              - generic [ref=e271]: Host / organiser (optional)
              - textbox [ref=e272]
            - generic [ref=e274] [cursor=pointer]:
              - checkbox "Show a public booking / join link Use this only if anyone viewing the directory is allowed to open the booking page." [ref=e275]
              - generic [ref=e276]:
                - strong [ref=e277]: Show a public booking / join link
                - generic [ref=e278]: Use this only if anyone viewing the directory is allowed to open the booking page.
        - generic [ref=e279]:
          - generic [ref=e280]:
            - generic [ref=e281]:
              - paragraph [ref=e282]: Monday · 19:00 · Social & Recreational
              - paragraph [ref=e283]: Weekly session 2
            - generic [ref=e284]:
              - button "Duplicate" [ref=e285] [cursor=pointer]
              - button "Remove" [ref=e286] [cursor=pointer]
          - generic [ref=e287]:
            - generic [ref=e288]:
              - text: Day
              - combobox [ref=e289]:
                - option "Monday" [selected]
                - option "Tuesday"
                - option "Wednesday"
                - option "Thursday"
                - option "Friday"
                - option "Saturday"
                - option "Sunday"
            - generic [ref=e290]:
              - text: Venue
              - combobox [ref=e291]:
                - option "Doora Barefield" [selected]
                - option "Corofin"
                - option "Ennistymon"
            - generic [ref=e292]:
              - generic [ref=e293]: Meet time (optional)
              - textbox [ref=e294]
            - generic [ref=e295]:
              - text: Start
              - textbox [ref=e296]: 19:00
            - generic [ref=e297]:
              - generic [ref=e298]: End (optional)
              - textbox [ref=e299]: 20:30
            - generic [ref=e300]:
              - text: Session / level
              - textbox "e.g. Social, Improver, Match Play" [ref=e301]: Social & Recreational
            - generic [ref=e302]:
              - text: Price (€)
              - spinbutton [ref=e303]: "5.5"
            - generic [ref=e304]:
              - text: Payment
              - combobox [ref=e305]:
                - option "Not specified" [selected]
                - option "Cash"
                - option "Online"
                - option "Pay at venue"
                - option "Included in membership"
                - option "Contact club"
            - generic [ref=e306]:
              - text: Capacity
              - spinbutton [ref=e307]
            - generic [ref=e308]:
              - generic [ref=e309]: Host / organiser (optional)
              - textbox [ref=e310]
            - generic [ref=e312] [cursor=pointer]:
              - checkbox "Show a public booking / join link Use this only if anyone viewing the directory is allowed to open the booking page." [ref=e313]
              - generic [ref=e314]:
                - strong [ref=e315]: Show a public booking / join link
                - generic [ref=e316]: Use this only if anyone viewing the directory is allowed to open the booking page.
        - generic [ref=e317]:
          - generic [ref=e318]:
            - generic [ref=e319]:
              - paragraph [ref=e320]: Monday · 20:30 · Improver & Advanced
              - paragraph [ref=e321]: Weekly session 3
            - generic [ref=e322]:
              - button "Duplicate" [ref=e323] [cursor=pointer]
              - button "Remove" [ref=e324] [cursor=pointer]
          - generic [ref=e325]:
            - generic [ref=e326]:
              - text: Day
              - combobox [ref=e327]:
                - option "Monday" [selected]
                - option "Tuesday"
                - option "Wednesday"
                - option "Thursday"
                - option "Friday"
                - option "Saturday"
                - option "Sunday"
            - generic [ref=e328]:
              - text: Venue
              - combobox [ref=e329]:
                - option "Doora Barefield" [selected]
                - option "Corofin"
                - option "Ennistymon"
            - generic [ref=e330]:
              - generic [ref=e331]: Meet time (optional)
              - textbox [ref=e332]
            - generic [ref=e333]:
              - text: Start
              - textbox [ref=e334]: 20:30
            - generic [ref=e335]:
              - generic [ref=e336]: End (optional)
              - textbox [ref=e337]: 22:00
            - generic [ref=e338]:
              - text: Session / level
              - textbox "e.g. Social, Improver, Match Play" [ref=e339]: Improver & Advanced
            - generic [ref=e340]:
              - text: Price (€)
              - spinbutton [ref=e341]: "5.5"
            - generic [ref=e342]:
              - text: Payment
              - combobox [ref=e343]:
                - option "Not specified" [selected]
                - option "Cash"
                - option "Online"
                - option "Pay at venue"
                - option "Included in membership"
                - option "Contact club"
            - generic [ref=e344]:
              - text: Capacity
              - spinbutton [ref=e345]
            - generic [ref=e346]:
              - generic [ref=e347]: Host / organiser (optional)
              - textbox [ref=e348]
            - generic [ref=e350] [cursor=pointer]:
              - checkbox "Show a public booking / join link Use this only if anyone viewing the directory is allowed to open the booking page." [ref=e351]
              - generic [ref=e352]:
                - strong [ref=e353]: Show a public booking / join link
                - generic [ref=e354]: Use this only if anyone viewing the directory is allowed to open the booking page.
        - generic [ref=e355]:
          - generic [ref=e356]:
            - generic [ref=e357]:
              - paragraph [ref=e358]: Wednesday · 11:30 · Club Session
              - paragraph [ref=e359]: Weekly session 4
            - generic [ref=e360]:
              - button "Duplicate" [ref=e361] [cursor=pointer]
              - button "Remove" [ref=e362] [cursor=pointer]
          - generic [ref=e363]:
            - generic [ref=e364]:
              - text: Day
              - combobox [ref=e365]:
                - option "Monday"
                - option "Tuesday"
                - option "Wednesday" [selected]
                - option "Thursday"
                - option "Friday"
                - option "Saturday"
                - option "Sunday"
            - generic [ref=e366]:
              - text: Venue
              - combobox [ref=e367]:
                - option "Doora Barefield"
                - option "Corofin" [selected]
                - option "Ennistymon"
            - generic [ref=e368]:
              - generic [ref=e369]: Meet time (optional)
              - textbox [ref=e370]
            - generic [ref=e371]:
              - text: Start
              - textbox [ref=e372]: 11:30
            - generic [ref=e373]:
              - generic [ref=e374]: End (optional)
              - textbox [ref=e375]: 13:30
            - generic [ref=e376]:
              - text: Session / level
              - textbox "e.g. Social, Improver, Match Play" [ref=e377]: Club Session
            - generic [ref=e378]:
              - text: Price (€)
              - spinbutton [ref=e379]: "5"
            - generic [ref=e380]:
              - text: Payment
              - combobox [ref=e381]:
                - option "Not specified"
                - option "Cash" [selected]
                - option "Online"
                - option "Pay at venue"
                - option "Included in membership"
                - option "Contact club"
            - generic [ref=e382]:
              - text: Capacity
              - spinbutton [ref=e383]
            - generic [ref=e384]:
              - generic [ref=e385]: Host / organiser (optional)
              - textbox [ref=e386]
            - generic [ref=e388] [cursor=pointer]:
              - checkbox "Show a public booking / join link Use this only if anyone viewing the directory is allowed to open the booking page." [ref=e389]
              - generic [ref=e390]:
                - strong [ref=e391]: Show a public booking / join link
                - generic [ref=e392]: Use this only if anyone viewing the directory is allowed to open the booking page.
        - generic [ref=e393]:
          - generic [ref=e394]:
            - generic [ref=e395]:
              - paragraph [ref=e396]: Wednesday · 19:00 · Club Session
              - paragraph [ref=e397]: Weekly session 5
            - generic [ref=e398]:
              - button "Duplicate" [ref=e399] [cursor=pointer]
              - button "Remove" [ref=e400] [cursor=pointer]
          - generic [ref=e401]:
            - generic [ref=e402]:
              - text: Day
              - combobox [ref=e403]:
                - option "Monday"
                - option "Tuesday"
                - option "Wednesday" [selected]
                - option "Thursday"
                - option "Friday"
                - option "Saturday"
                - option "Sunday"
            - generic [ref=e404]:
              - text: Venue
              - combobox [ref=e405]:
                - option "Doora Barefield"
                - option "Corofin"
                - option "Ennistymon" [selected]
            - generic [ref=e406]:
              - generic [ref=e407]: Meet time (optional)
              - textbox [ref=e408]
            - generic [ref=e409]:
              - text: Start
              - textbox [ref=e410]: 19:00
            - generic [ref=e411]:
              - generic [ref=e412]: End (optional)
              - textbox [ref=e413]: 20:00
            - generic [ref=e414]:
              - text: Session / level
              - textbox "e.g. Social, Improver, Match Play" [ref=e415]: Club Session
            - generic [ref=e416]:
              - text: Price (€)
              - spinbutton [ref=e417]
            - generic [ref=e418]:
              - text: Payment
              - combobox [ref=e419]:
                - option "Not specified" [selected]
                - option "Cash"
                - option "Online"
                - option "Pay at venue"
                - option "Included in membership"
                - option "Contact club"
            - generic [ref=e420]:
              - text: Capacity
              - spinbutton [ref=e421]
            - generic [ref=e422]:
              - generic [ref=e423]: Host / organiser (optional)
              - textbox [ref=e424]
            - generic [ref=e426] [cursor=pointer]:
              - checkbox "Show a public booking / join link Use this only if anyone viewing the directory is allowed to open the booking page." [ref=e427]
              - generic [ref=e428]:
                - strong [ref=e429]: Show a public booking / join link
                - generic [ref=e430]: Use this only if anyone viewing the directory is allowed to open the booking page.
        - generic [ref=e431]:
          - generic [ref=e432]:
            - generic [ref=e433]:
              - paragraph [ref=e434]: Wednesday · 20:00 · Club Session
              - paragraph [ref=e435]: Weekly session 6
            - generic [ref=e436]:
              - button "Duplicate" [ref=e437] [cursor=pointer]
              - button "Remove" [ref=e438] [cursor=pointer]
          - generic [ref=e439]:
            - generic [ref=e440]:
              - text: Day
              - combobox [ref=e441]:
                - option "Monday"
                - option "Tuesday"
                - option "Wednesday" [selected]
                - option "Thursday"
                - option "Friday"
                - option "Saturday"
                - option "Sunday"
            - generic [ref=e442]:
              - text: Venue
              - combobox [ref=e443]:
                - option "Doora Barefield"
                - option "Corofin"
                - option "Ennistymon" [selected]
            - generic [ref=e444]:
              - generic [ref=e445]: Meet time (optional)
              - textbox [ref=e446]
            - generic [ref=e447]:
              - text: Start
              - textbox [ref=e448]: 20:00
            - generic [ref=e449]:
              - generic [ref=e450]: End (optional)
              - textbox [ref=e451]: 21:00
            - generic [ref=e452]:
              - text: Session / level
              - textbox "e.g. Social, Improver, Match Play" [ref=e453]: Club Session
            - generic [ref=e454]:
              - text: Price (€)
              - spinbutton [ref=e455]
            - generic [ref=e456]:
              - text: Payment
              - combobox [ref=e457]:
                - option "Not specified" [selected]
                - option "Cash"
                - option "Online"
                - option "Pay at venue"
                - option "Included in membership"
                - option "Contact club"
            - generic [ref=e458]:
              - text: Capacity
              - spinbutton [ref=e459]
            - generic [ref=e460]:
              - generic [ref=e461]: Host / organiser (optional)
              - textbox [ref=e462]
            - generic [ref=e464] [cursor=pointer]:
              - checkbox "Show a public booking / join link Use this only if anyone viewing the directory is allowed to open the booking page." [ref=e465]
              - generic [ref=e466]:
                - strong [ref=e467]: Show a public booking / join link
                - generic [ref=e468]: Use this only if anyone viewing the directory is allowed to open the booking page.
        - generic [ref=e469]:
          - generic [ref=e470]:
            - generic [ref=e471]:
              - paragraph [ref=e472]: Thursday · 19:00 · Social & Recreational
              - paragraph [ref=e473]: Weekly session 7
            - generic [ref=e474]:
              - button "Duplicate" [ref=e475] [cursor=pointer]
              - button "Remove" [ref=e476] [cursor=pointer]
          - generic [ref=e477]:
            - generic [ref=e478]:
              - text: Day
              - combobox [ref=e479]:
                - option "Monday"
                - option "Tuesday"
                - option "Wednesday"
                - option "Thursday" [selected]
                - option "Friday"
                - option "Saturday"
                - option "Sunday"
            - generic [ref=e480]:
              - text: Venue
              - combobox [ref=e481]:
                - option "Doora Barefield" [selected]
                - option "Corofin"
                - option "Ennistymon"
            - generic [ref=e482]:
              - generic [ref=e483]: Meet time (optional)
              - textbox [ref=e484]
            - generic [ref=e485]:
              - text: Start
              - textbox [ref=e486]: 19:00
            - generic [ref=e487]:
              - generic [ref=e488]: End (optional)
              - textbox [ref=e489]: 20:30
            - generic [ref=e490]:
              - text: Session / level
              - textbox "e.g. Social, Improver, Match Play" [ref=e491]: Social & Recreational
            - generic [ref=e492]:
              - text: Price (€)
              - spinbutton [ref=e493]: "5.5"
            - generic [ref=e494]:
              - text: Payment
              - combobox [ref=e495]:
                - option "Not specified" [selected]
                - option "Cash"
                - option "Online"
                - option "Pay at venue"
                - option "Included in membership"
                - option "Contact club"
            - generic [ref=e496]:
              - text: Capacity
              - spinbutton [ref=e497]
            - generic [ref=e498]:
              - generic [ref=e499]: Host / organiser (optional)
              - textbox [ref=e500]
            - generic [ref=e502] [cursor=pointer]:
              - checkbox "Show a public booking / join link Use this only if anyone viewing the directory is allowed to open the booking page." [ref=e503]
              - generic [ref=e504]:
                - strong [ref=e505]: Show a public booking / join link
                - generic [ref=e506]: Use this only if anyone viewing the directory is allowed to open the booking page.
        - generic [ref=e507]:
          - generic [ref=e508]:
            - generic [ref=e509]:
              - paragraph [ref=e510]: Thursday · 20:30 · Improver & Advanced
              - paragraph [ref=e511]: Weekly session 8
            - generic [ref=e512]:
              - button "Duplicate" [ref=e513] [cursor=pointer]
              - button "Remove" [ref=e514] [cursor=pointer]
          - generic [ref=e515]:
            - generic [ref=e516]:
              - text: Day
              - combobox [ref=e517]:
                - option "Monday"
                - option "Tuesday"
                - option "Wednesday"
                - option "Thursday" [selected]
                - option "Friday"
                - option "Saturday"
                - option "Sunday"
            - generic [ref=e518]:
              - text: Venue
              - combobox [ref=e519]:
                - option "Doora Barefield" [selected]
                - option "Corofin"
                - option "Ennistymon"
            - generic [ref=e520]:
              - generic [ref=e521]: Meet time (optional)
              - textbox [ref=e522]
            - generic [ref=e523]:
              - text: Start
              - textbox [ref=e524]: 20:30
            - generic [ref=e525]:
              - generic [ref=e526]: End (optional)
              - textbox [ref=e527]: 22:00
            - generic [ref=e528]:
              - text: Session / level
              - textbox "e.g. Social, Improver, Match Play" [ref=e529]: Improver & Advanced
            - generic [ref=e530]:
              - text: Price (€)
              - spinbutton [ref=e531]: "5.5"
            - generic [ref=e532]:
              - text: Payment
              - combobox [ref=e533]:
                - option "Not specified" [selected]
                - option "Cash"
                - option "Online"
                - option "Pay at venue"
                - option "Included in membership"
                - option "Contact club"
            - generic [ref=e534]:
              - text: Capacity
              - spinbutton [ref=e535]
            - generic [ref=e536]:
              - generic [ref=e537]: Host / organiser (optional)
              - textbox [ref=e538]
            - generic [ref=e540] [cursor=pointer]:
              - checkbox "Show a public booking / join link Use this only if anyone viewing the directory is allowed to open the booking page." [ref=e541]
              - generic [ref=e542]:
                - strong [ref=e543]: Show a public booking / join link
                - generic [ref=e544]: Use this only if anyone viewing the directory is allowed to open the booking page.
      - generic [ref=e545]:
        - generic [ref=e546]:
          - paragraph [ref=e547]: You have unsaved changes
          - paragraph [ref=e548]: Changes become public as soon as the save completes.
        - generic [ref=e549]:
          - button "View listing" [ref=e550] [cursor=pointer]
          - button "Save changes" [ref=e551] [cursor=pointer]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | const APP_ID='6a01dc00702b7dd2a2978c28';
  4  | const user={id:'directory-editor-e2e',email:'editor@example.test',full_name:'Directory Editor',role:'admin',approval_status:'approved'};
  5  | const json=(route,body,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(body)});
  6  | 
  7  | async function installDirectoryBackend(page){
  8  |   await page.route('**/api/apps/**',async route=>{
  9  |     const req=route.request(),url=new URL(req.url()),path=url.pathname;
  10 |     if(path.includes('/public-settings/')) return json(route,{id:APP_ID,public_settings:{}});
  11 |     if(path.endsWith('/entities/User/me')) return json(route,user);
  12 |     if(path.includes('/analytics/')) return json(route,{});
  13 |     const marker=`/api/apps/${APP_ID}/functions/`;
  14 |     const i=path.indexOf(marker);
  15 |     if(i>=0){
  16 |       const name=decodeURIComponent(path.slice(i+marker.length).split('/')[0]);
  17 |       let body={};try{body=req.postDataJSON()||{};}catch{}
  18 |       if(name==='securityContext') return json(route,{success:true,context:null});
  19 |       if(name==='directoryListingProfile'){
  20 |         if(body.action==='public_get') return json(route,{success:true,listingSlug:'clare-pickleball',verificationStatus:'verified',profile:null,base:null});
  21 |         if(body.action==='save') return json(route,{success:true,profile:body.profile,updatedAt:new Date().toISOString(),id:'profile-e2e'});
  22 |       }
  23 |       if(name==='directoryClaim'&&body.action==='status') return json(route,{success:true,hasAccess:true,status:'verified'});
  24 |       return json(route,{success:true});
  25 |     }
  26 |     return json(route,{});
  27 |   });
  28 | }
  29 | 
  30 | test('directory editor: Add session is visible, adds a card, and Duplicate clones it',async({page})=>{
  31 |   await installDirectoryBackend(page);
  32 |   const errors=[];page.on('pageerror',e=>errors.push(e.message));
  33 |   await page.goto('/directory/clare-pickleball/edit?access_token=e2e');
  34 |   await expect(page.getByRole('heading',{name:'Clare Pickleball'})).toBeVisible();
  35 |   await page.getByRole('heading',{name:'Weekly sessions'}).scrollIntoViewIfNeeded();
  36 | 
  37 |   const cards=page.getByTestId('directory-session-card');
  38 |   await expect(cards).toHaveCount(7);
  39 |   await expect(page.getByText('Wednesday · 11:30 · Club Session')).toBeVisible();
  40 | 
  41 |   await page.getByTestId('directory-add-session').click();
  42 |   await expect(cards).toHaveCount(8);
  43 |   await expect(page.getByTestId('directory-session-notice')).toContainText('New blank session added');
  44 | 
  45 |   const newCard=page.locator('[data-testid="directory-session-card"].ring-primary');
> 46 |   await expect(newCard).toHaveCount(1);
     |                         ^ Error: expect(locator).toHaveCount(expected) failed
  47 |   await expect(newCard).toBeVisible();
  48 | 
  49 |   const beforeCloneCount=await cards.count();
  50 |   await cards.first().getByTestId('directory-clone-session').click();
  51 |   await expect(cards).toHaveCount(beforeCloneCount+1);
  52 |   await expect(page.getByTestId('directory-session-notice')).toContainText('Session duplicated');
  53 | 
  54 |   const original=cards.nth(0);
  55 |   const duplicate=cards.nth(1);
  56 |   const originalSelects=original.locator('select');
  57 |   const duplicateSelects=duplicate.locator('select');
  58 |   expect(await originalSelects.nth(0).inputValue()).toBe(await duplicateSelects.nth(0).inputValue());
  59 |   expect(await originalSelects.nth(1).inputValue()).toBe(await duplicateSelects.nth(1).inputValue());
  60 |   const originalTimes=original.locator('input[type="time"]');
  61 |   const duplicateTimes=duplicate.locator('input[type="time"]');
  62 |   expect(await originalTimes.nth(1).inputValue()).toBe(await duplicateTimes.nth(1).inputValue());
  63 |   expect(await originalTimes.nth(2).inputValue()).toBe(await duplicateTimes.nth(2).inputValue());
  64 |   expect(errors).toEqual([]);
  65 | });
  66 | 
  67 | test('Clare public listing shows Corofin Wednesday session with €5 cash',async({page})=>{
  68 |   await installDirectoryBackend(page);
  69 |   await page.goto('/directory/clare-pickleball');
  70 |   await expect(page.getByRole('heading',{name:'Clare Pickleball'})).toBeVisible();
  71 |   const session=page.getByText('11:30–13:30').locator('..').locator('..');
  72 |   await expect(session).toContainText('Corofin GAA Sports Hall');
  73 |   await expect(session).toContainText('€5');
  74 |   await expect(session).toContainText('Cash');
  75 | });
  76 | 
```