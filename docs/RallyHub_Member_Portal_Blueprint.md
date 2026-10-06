# RallyHub Member Portal Blueprint

Status: Phase 1 build started 26 September 2026
Backlog sync: Phase 2 scope copied into RallyHub Master Backlog & Decisions v4 on 26 September 2026.

## Non-negotiable architecture rules

1. RallyHub is multi-tenant and multi-sport. Clare Pickleball is the first live test tenant, never a hard-coded product definition.
2. The member experience is mobile-first. Desktop is a fully supported responsive companion, not the design starting point.
3. Core platform concepts stay generic: Tenant, Club, Person, Membership, Group, Event, Message, Resource, Payment, Competition and Integration.
4. Sport-specific capabilities plug in as modules. Examples include KOTC, Interclub, Tournament, DUPR, future ladders, leagues and team formats.
5. Tenant-specific content and branding are data/configuration: logo, colours, terminology, shop link, resources, groups and integrations.
6. Spond remains the source of truth for Clare Pickleball sessions in Phase 1. RallyHub displays only Spond sessions the authenticated member is actually invited to or included in. Filtering must happen on the backend, never by sending all sessions to the client and hiding them.
7. The member portal must not expose private member data to other members. Member-visible profiles are a deliberately small projection controlled by privacy settings.
8. Competition history is generic. The portal asks competition modules for summaries instead of hard-coding Interclub, KOTC or Tournament into the shell.
9. Shared platform capabilities must be implemented as central engines, not repeated inside individual modules. Communications, Finance, Payments/Entitlements, Analytics/Attribution, People/Identity, Notifications, Files/Assets and Audit/Change Control are shared services consumed by Directory, Membership, Events, KOTC, Interclub and future modules. Module-specific screens and journeys may differ, but they must not create separate islands of overlapping business logic. Finance in particular must use one tenant-aware, product-aware ledger and entitlement engine so club transactions, directory listings, subscriptions, affiliate commissions, refunds, credits and future commercial products share the same underlying financial architecture while preserving tenant isolation and RallyHub-global accounting.

## Product shell

Default mobile navigation:

- Home
- Play
- Clubhouse
- Learn
- Me

Desktop expands the same information architecture into the existing RallyHub layout.

## Phase 1 - Make RallyHub worth logging into now

### Home

Purpose: answer "what do I need today?" in seconds.

- Member greeting, photo and active club context
- Next relevant activity
- Important club update
- This week summary
- Quick actions for Calendar, Messages, Results and Shop
- Latest official posts/news
- Profile completion prompts, especially profile photo, only when action is required

### Play

- Personal calendar combining multiple authorised sources
- Personalised Spond sessions via existing connector
- RallyHub competitions the member is entered in/selected for
- Future Directory events the member saves or applies for
- List, calendar and map views
- Venue details and directions
- Add individual event to device calendar
- Later full calendar subscription
- Spond event remains managed in Spond during Phase 1, with a clear Open in Spond action where available

### Spond visibility rule

A Spond session is visible only where the current authenticated member is a recipient/participant through Spond invitation/response data or the authorised group/subgroup relationship exposed by the connector. A member must not see unrelated club sessions, attendance or participant activity.

Example: a Monday 19:00 Social & Recreational member does not see the 20:30 Improver & Advanced session unless specifically invited or otherwise made eligible in Spond.

### Clubhouse

Three communication layers:

1. Official Updates
   - text
   - poster/image
   - link
   - file
   - poll
   - event notice
   - audience targeting by club/group/member
   - optional comments
   - read status for important notices

2. Community boards
   - tenant-created channels
   - membership/access controlled
   - names are never hard-coded to Clare groups

3. Messaging
   - message the club/organiser
   - privacy-controlled member-to-member messaging
   - group threads
   - event comments later reuse the same messaging primitives

### Learn

Tenant-managed resource categories such as:

- Getting Started
- Coaching
- Rules
- Videos
- Club Guides
- Documents

Content is club/sport configurable.

### Me / My Sport

Universal:

- profile photo
- personal details
- membership status
- payment status/history
- privacy and communication preferences
- emergency contacts kept private
- digital membership card
- competition history
- results and leaderboard summary

Sport modules may add fields. For pickleball this can include DUPR ID/rating and pickleball-specific performance. Other sports can supply different rating systems and statistics.

### Profile photo/onboarding

Newly activated members should be guided through:

1. confirm name
2. add profile photo
3. confirm email/mobile
4. confirm emergency contact
5. sport/playing information
6. privacy and communication preferences

Photo should be strongly required for a complete active member profile, with an administrative fallback where necessary.

### Shop

- configurable per tenant/club
- external shop link is sufficient in Phase 1
- no hard-coded Boru Sports dependency

### Notifications

- official announcement
- new message
- invitation/event update
- competition result
- membership/renewal action
- new resource

Badges should signal meaningful attention, not noise.

### Phase 1 admin/content controls

- create official posts
- upload posters/images/files
- create polls
- choose audience
- manage member-visible resources
- configure shop and useful links
- preview member portal without impersonation
- identify incomplete profiles/missing photos

## Phase 2 - RallyHub progressively runs the club

### Native session management

- generic playing/training groups
- recurring session templates
- subgroup eligibility
- invitations
- capacity
- waitlist
- payment-required booking
- atomic place confirmation
- temporary checkout holds
- automatic waitlist promotion
- payment windows
- cancellations/refunds/credits
- attendance
- reminders
- host/admin overrides
- guests/manual invitees
- tasks/volunteers
- event comments and targeted messaging
- attendance and payment reporting

Core rule for paid sessions: payment confirms the place.

### Competition framework

One generic framework supporting modules such as:

- KOTC
- Interclub
- Tournament
- Ladder
- League
- individual formats
- team formats
- future multi-sport competition types

Shared concepts: Competition, Season/Event, Participant/Team, Fixture/Round, Result, Standing and Member History.

### Player intelligence

- progress over time
- recent form
- points trends
- highest finish
- head-to-head
- last meetings
- improvement against a specific opponent
- partner performance
- opponent difficulty
- performance by format/venue
- achievements/milestones

### Rating providers

Use a generic provider integration layer. DUPR is a pickleball provider, not a RallyHub core dependency. Phase 1 can display stored/user-linked data. Phase 2 should use official provider APIs where available.

### Additional Phase 2 backlog

- Looking for a game
- household/family accounts
- richer polls/surveys
- push/multi-channel notification delivery
- club-to-club messaging
- sponsor inventory
- integrated product feeds
- complete calendar subscriptions
- event/session demand analytics
- venue utilisation
- photos/media galleries
- volunteer/task management

## Initial build order

1. Mobile-first member shell and role-aware navigation
2. Member Home redesign
3. Personal Play calendar foundation
4. Secure personalised Spond feed
5. Profile photo/onboarding emphasis
6. My Competitions/results/leaderboard
7. Clubhouse foundation
8. Learn/resources foundation
9. Configurable shop/link area
10. Notifications foundation
11. Real-member testing and iteration before expanding Phase 1

## Success test for Phase 1

A member should be able to open RallyHub on a phone and within five seconds answer:

- What am I doing next?
- Where is it?
- What club update matters to me?
- What competitions/results are mine?
- How do I contact the club or another permitted member?
- Where are my membership/profile details?

The portal should be useful even while Spond continues to run weekly session booking and payments.
