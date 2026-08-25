You are implementing a production-ready application called STACK.

Work directly in this repository.

Do not create a second project or nested application unless the repository is empty.

First inspect the existing repository and understand:

- package manager
- Next.js version
- App Router structure
- TypeScript configuration
- Tailwind configuration
- existing components
- existing database setup
- existing Neon configuration
- existing environment variables
- existing authentication, if any
- current Vercel configuration

Preserve existing working infrastructure whenever reasonable.

Do not replace working Neon/Vercel configuration unnecessarily.

==================================================
0. CRITICAL PRODUCT AND DESIGN INSTRUCTION
==================================================

STACK is a consistency application based on one idea:

YOU ARE NOT TRACKING HABITS.
YOU ARE STACKING PROOF.

Every completion is one unit of proof.

A user's consecutive successful periods form a current stack.

If the cadence is missed, current stack resets.

Lifetime proof never disappears.

The approved UI reference images are located at:

/design/reference/01-auth.png
/design/reference/02-onboarding.png
/design/reference/03-start-using.png
/design/reference/04-daily-use.png
/design/reference/05-system.png

THESE IMAGES ARE THE VISUAL SOURCE OF TRUTH.

Before implementing UI:

1. inspect every image
2. understand each visible screen
3. identify recurring visual patterns
4. identify layout spacing
5. identify typography hierarchy
6. identify surface hierarchy
7. identify navigation patterns
8. identify card geometry
9. identify button geometry
10. identify metric presentation
11. identify form presentation
12. identify success/danger treatment
13. identify mobile safe-area behavior

Do NOT merely create a generic dark habit tracker.

Do NOT reinterpret the design as shadcn defaults.

Do NOT create a typical SaaS dashboard.

Do NOT make every element a rounded card.

The reference images override stylistic assumptions in this prompt.

If exact typography cannot be reproduced from the image, use Geist as the primary web font while preserving the same hierarchy, weight, scale, density and character of the references.

The design direction is:

APPLE PRODUCT UX DISCIPLINE
+
BOLDER TYPOGRAPHY
+
STRONGER VISUAL HIERARCHY
+
DARK MONOCHROME STACK IDENTITY

The UI should feel native, calm and extremely easy to operate.

But STACK should feel stronger than a normal Apple application.

Boldness should come primarily from:

- large numbers
- typography
- contrast
- deliberate whitespace
- strong composition

NOT from:

- excessive borders
- bright colors
- huge shadows
- noisy decoration
- cyberpunk effects
- gaming UI
- unnecessary brutalism

==================================================
1. TARGET
==================================================

Build STACK as:

Next.js App Router
TypeScript
Tailwind CSS
PostgreSQL via Neon
Drizzle ORM
Zod
Vercel
PWA

Primary target:

mobile web installed as a standalone PWA on iPhone/Android.

Secondary target:

normal mobile browser.

Tertiary target:

desktop browser.

Design mobile-first around approximately:

390px viewport width.

Desktop should preserve the mobile application's focused composition rather than becoming a huge desktop dashboard.

==================================================
2. ARCHITECTURE
==================================================

Keep this as a modular monolith.

DO NOT introduce:

- microservices
- Kafka
- Redis
- queues
- event buses
- Kubernetes
- scheduled midnight jobs
- unnecessary repositories/services/interfaces
- premature caching

Use roughly:

app/
components/
components/app/
components/stack/
components/history/
components/forms/
lib/
lib/auth/
lib/db/
lib/stack/
lib/date/
db/
db/schema/
actions/
tests/

Adapt this to the repository if it already has conventions.

Business-domain functions must not be buried inside React components.

==================================================
3. DOMAIN MODEL
==================================================

Implement:

USER

Fields:

id
email
name nullable
timezone
createdAt
updatedAt

Authentication fields may be stored according to the selected auth implementation.

STACK

Fields:

id
userId
name
description nullable
frequency
createdAt
updatedAt
archivedAt nullable

frequency initially supports:

DAILY
WEEKLY

STACK_ENTRY

Fields:

id
stackId
entryDate
completedAt
value
createdAt

Requirements:

value defaults to 1.

entryDate represents the user's LOCAL calendar date.

completedAt is a UTC timestamp.

Create a unique constraint:

UNIQUE(stackId, entryDate)

This database constraint is important.

Repeated taps or concurrent requests must never create duplicate completion entries.

STACK_ENTRY is the authoritative history.

Do NOT make a mutable current_streak database field the source of truth.

==================================================
4. TIMEZONE
==================================================

Timezone is a domain requirement, not an afterthought.

User has an IANA timezone, for example:

Asia/Jakarta

Store timestamps in UTC.

Derive entryDate using the user's timezone.

Do not derive daily completion solely from the Vercel server timezone.

Create reusable date helpers.

Avoid date logic scattered through components.

==================================================
5. DAILY STACK RULE
==================================================

Example:

17 Aug ✓
18 Aug ✓
19 Aug ✓
20 Aug not completed yet

During 20 Aug:

current streak = 3

Today does NOT count as a failed day while the day is still active.

If 20 Aug ends with no completion, then on 21 Aug:

current streak = 0

No cron reset is required.

Determine the state lazily from entries + user's local date.

==================================================
6. WEEKLY STACK RULE
==================================================

A WEEKLY stack requires at least one completion during the user's local calendar week.

One entry in a successful week counts toward the weekly streak.

The currently active week is not failed until it finishes.

If a whole eligible week passes without a completion:

current weekly streak = 0

Keep the weekly implementation isolated enough that additional cadence strategies can be introduced later.

==================================================
7. METRICS
==================================================

For every stack calculate:

currentStreak
bestStreak
lifetimeProof
stackRate

currentStreak:

consecutive successful periods.

bestStreak:

longest streak historically.

lifetimeProof:

total valid completion entries.

stackRate:

successful eligible periods /
eligible periods since stack creation

Return an appropriate percentage.

GLOBAL METRICS:

lifetimeProof =
sum of completion entries for all active and historical stacks

currentProof =
sum of current streaks across active stacks

The dashboard primarily emphasizes LIFETIME PROOF.

==================================================
8. AUTHENTICATION
==================================================

Inspect the repository first.

If authentication already exists and is reasonable:

reuse it.

Otherwise implement a secure credentials-based authentication solution appropriate for Next.js.

Prefer Better Auth if no auth infrastructure exists and it integrates cleanly.

Required flows:

Welcome
Create Account
Sign In
Forgot Password
Reset Password
Verify Email

Security requirements:

- secure password hashing
- secure cookies
- server-side authorization
- ownership checks
- no user IDs trusted from the client
- no secret sent to browser
- appropriate CSRF/session protection according to auth library

If email delivery is not configured in the repository:

abstract email sending behind a small adapter.

Development mode may log verification/reset URLs clearly to the server console.

Do not fake successful verification in production.

Document the email provider integration point in README.

==================================================
9. ROUTES
==================================================

Create or adapt routes approximately as follows:

/

/login
/register
/forgot-password
/reset-password
/verify-email

/onboarding
/onboarding/timezone

/stack/new
/stack/[id]

/history

/settings
/settings/account

/install

Root route behavior:

Unauthenticated
→ welcome/auth

Authenticated but onboarding incomplete
→ onboarding

Authenticated and onboarding complete
→ Today dashboard

Avoid unnecessary screens or deep navigation.

==================================================
10. COMPLETE SCREEN INVENTORY
==================================================

Implement the complete product journey represented by the reference boards.

AUTH:

01 Welcome
02 Create account
03 Welcome back / Sign in
04 Reset password

AUTH STATES:

05 Check your inbox
06 Verify your email

ONBOARDING:

07 Stack Proof
08 Set Your Day / timezone

FIRST USE:

09 Empty dashboard
10 New Stack

DAILY PRODUCT:

11 Active dashboard
12 Stack detail
13 Completion state
14 Broken stack
15 History

SYSTEM:

16 Install STACK
17 Settings
18 Account & Security

Also create:

- loading states
- validation errors
- empty history state
- unavailable/offline state where useful
- stack archived state
- no active stacks state

Do not create a separate page just because a state can elegantly live within an existing screen.

==================================================
11. GLOBAL VISUAL SYSTEM
==================================================

Follow the images.

Base visual tokens should approximately be:

--background: #050505
--surface-1: #0A0A0A
--surface-2: #101010
--surface-3: #161616
--border: rgba(255,255,255,0.10)
--text-primary: #F5F5F5
--text-secondary: #9A9A9A
--text-tertiary: #656565
--success: restrained Apple-like green
--danger: restrained system red

Do not blindly use these if visual inspection of the reference image suggests a better value.

Use CSS variables/design tokens.

Do not scatter raw hex codes throughout components.

==================================================
12. TYPOGRAPHY
==================================================

Typography carries the product.

Use:

Geist Sans
Geist Mono only where clearly useful for numeric/data treatment

Headings are bold and decisive.

Numbers are extremely prominent.

Examples:

STACK

428
LIFETIME PROOF

21
DAYS

84
PROOF STACKED

Typography should have a premium system feel.

Avoid:

- excessive letter spacing everywhere
- sci-fi typography
- monospace body text
- generic Bootstrap sizing

==================================================
13. SHAPE LANGUAGE
==================================================

Reference Apple interface geometry but stronger.

Use:

moderate rounded corners
subtle borders
clean rectangular surfaces
comfortable touch targets

Avoid:

- excessive pills
- bubbly UI
- rounded rectangle around every piece of text
- enormous 30px radius cards everywhere

Typical ranges:

small control radius: ~10px
card radius: ~14–18px
major sheets: ~20px

Use visual inspection of the reference images over these values.

==================================================
14. TOP APP STRUCTURE
==================================================

Primary dashboard header:

STACK

settings/action icon on right where shown.

Then:

428
LIFETIME PROOF

Then:

TODAY                  3 / 4

or equivalent according to reference.

The proof number should command attention.

Do not put LIFETIME PROOF in a generic analytics card.

It is part of the main page hierarchy.

==================================================
15. BOTTOM NAVIGATION
==================================================

Mobile bottom navigation:

TODAY

center circular +

HISTORY

Follow reference image proportions.

Center action creates a new stack.

Use safe area support:

env(safe-area-inset-bottom)

When installed as a PWA on iPhone, navigation must never collide with the home indicator.

Navigation should remain minimal.

Do not add five tabs.

Settings is accessed from the dashboard header.

==================================================
16. ACTIVE DASHBOARD
==================================================

Reference:

/design/reference/03-start-using.png

Dashboard must include:

STACK header
settings icon
large lifetime proof
TODAY completion ratio

Then stack cards.

Examples:

GYM      43 DAYS
MUSIC    21 DAYS
BUILD    17 DAYS
READ     38 DAYS

Each card includes:

- semantic icon
- name
- streak
- DAYS/WEEKS
- segmented streak visualization
- completion action/status

Completed:

green check state

Incomplete:

+ completion control

The layout must remain quickly scannable.

Do not make stack cards huge.

Four stacks should be reasonably visible on a modern phone as in the approved design.

==================================================
17. STACK PROGRESS VISUAL
==================================================

Implement reusable:

StackProgress

Visual:

segmented horizontal bar.

Do NOT render hundreds of DOM nodes for long streaks.

Use a bounded number of visible segments.

The visualization represents momentum, not a literal one-node-per-day historical record.

Accessibility must not depend on color alone.

==================================================
18. COMPLETING A STACK
==================================================

User taps the + action.

Flow:

client interaction
→ authenticated server action/API
→ verify stack ownership
→ derive local entryDate
→ insert StackEntry
→ unique constraint protects duplicate
→ calculate updated metrics
→ return result
→ UI updates

The interaction should feel immediate.

Use subtle animation.

No confetti.

No fireworks.

No motivational modal.

Optional:

subtle vibration using navigator.vibrate when supported, but do not rely on it.

Completion state should resemble:

MUSIC

22
DAYS

+1 proof added today

BEST
34

LIFETIME
148

DONE

==================================================
19. STACK DETAIL
==================================================

Reference:

/design/reference/04-daily-use.png

Structure:

top navigation
stack name

CURRENT STACK

21
DAYS

segmented progress

stats grid:

BEST
34 DAYS

LIFETIME
147 PROOF

STACK RATE
82%

FREQUENCY
DAILY

Below:

month calendar/history visualization

Bottom CTA:

+ STACK TODAY

Use an actual usable calendar representation.

Do not make it decorative-only.

Clearly indicate completion dates.

==================================================
20. BROKEN STACK
==================================================

Required design:

STACK BROKEN

The data changed.
Nothing else.

MUSIC

19 → 0

147 lifetime proof remains.

Missed:
Wednesday, 19 Aug

Primary:
START AGAIN

Secondary:
VIEW HISTORY

Critical product tone:

Never shame the user.

Never write:

"You failed."
"Don't give up!"
"Try harder!"
"You lost everything!"

Only present reality.

Lifetime proof remains.

==================================================
21. HISTORY
==================================================

Reference:

/design/reference/04-daily-use.png

Header:

HISTORY

Top monthly summary:

THIS MONTH

84
PROOF STACKED

simple bar visualization

Then date-grouped history.

Example:

20 AUG

Gym ✓
Music ✓
Read ✓

19 AUG

Gym ✓
Music ✓
Build ✓
Read ✓

Keep it clear.

Do not implement a giant analytics suite.

==================================================
22. CREATE STACK
==================================================

Reference:

/design/reference/03-start-using.png

Screen:

NEW STACK

Define what counts.
Keep it simple.

Fields:

Name

Description

Frequency:

Daily
Weekly

Primary CTA:

CREATE STACK

Use controls visually close to Apple segmented controls, but stronger and consistent with STACK branding.

Do not overbuild scheduling.

NO:

custom weekdays
monthly goals
rest-day logic
grace days
quantities
timer
notifications

in V1.

==================================================
23. EMPTY HOME
==================================================

Reference:

/design/reference/03-start-using.png

Header:

STACK

0
LIFETIME PROOF

TODAY
0 / 0

Central state:

NO STACKS YET

Create the first thing you want
to prove you can keep doing.

CTA:

+ CREATE FIRST STACK

Maintain the normal bottom navigation.

==================================================
24. AUTH UI
==================================================

Reference:

/design/reference/01-auth.png

WELCOME:

STACK

Proof compounds.

STACK
WHAT
MATTERS.

Build visible evidence of your progress.
One day, one action, one stack at a time.

CREATE ACCOUNT

I ALREADY HAVE AN ACCOUNT

Create Account:

simple vertical form.

Email
Password
Confirm password

Strong white primary CTA.

Minimal support copy.

Sign In:

Welcome back

Email
Password

Forgot password

SIGN IN

No account? Create one

Reset:

Reset password

We'll send a reset link.

Email

SEND RESET LINK

Back to sign in

==================================================
25. ONBOARDING UI
==================================================

Reference:

/design/reference/02-onboarding.png

Do not create a five-minute onboarding wizard.

Screen one:

STACK PROOF.

Not motivation.
Evidence.

large:

01

Every completion adds one proof.

Miss the required cadence and
the current stack breaks.

Lifetime proof stays.

CONTINUE

Next:

SET YOUR DAY

Explain briefly that STACK uses local time to determine day boundaries.

Timezone selector.

Detected offset.

USE ASIA/JAKARTA

Use real detected timezone where possible.

==================================================
26. SETTINGS
==================================================

Reference:

/design/reference/05-system.png

SETTINGS

PREFERENCES

Timezone             Asia/Jakarta >
Install STACK                      >
Archived stacks                   >

ACCOUNT

Email         user@example.com
Account & security                >

STACK v0.1

Do not create dozens of toggles.

==================================================
27. ACCOUNT & SECURITY
==================================================

Reference:

/design/reference/05-system.png

ACCOUNT & SECURITY

email
verified state

Change password >
Sign out >

DANGER ZONE

Delete account

Deletion needs a confirmation step.

Do not allow a one-tap destructive delete.

==================================================
28. INSTALL STACK / PWA
==================================================

STACK must be installable.

Implement:

app/manifest.ts or equivalent
name
short_name
icons
start_url
display: standalone
theme_color
background_color

Create install detection.

If browser supports beforeinstallprompt:

show INSTALL STACK CTA.

If iOS Safari:

show manual instructions:

1 Tap Share
2 Add to Home Screen
3 Tap Add

When already running in standalone mode:

do not show install promotion.

Account for:

window.matchMedia('(display-mode: standalone)')

and iOS navigator.standalone where appropriate.

Follow reference:

/design/reference/05-system.png

==================================================
29. PWA ICON
==================================================

Create a simple STACK icon.

Do not use a copyrighted Apple icon.

Concept:

black rounded square
strong white S / STACK mark

It needs to remain recognizable at home-screen icon size.

Include required icon sizes or generate them from one source asset during build/setup.

==================================================
30. RESPONSIVE DESIGN
==================================================

Primary:

mobile portrait around 390px.

Desktop:

center a mobile-width application area or appropriately expand content.

Do NOT turn desktop into a completely different admin dashboard.

Maximum readable application width should remain restrained.

==================================================
31. ACCESSIBILITY
==================================================

Implement:

semantic HTML
labels
keyboard focus
screen reader text for icon-only buttons
minimum reasonable contrast
44px-ish touch targets
aria states when needed
button disabled states
accessible form errors

Do not communicate completion only via green.

Use icon + state.

Respect:

prefers-reduced-motion.

==================================================
32. ANIMATION
==================================================

Animations should be extremely restrained.

Use CSS transitions or lightweight animation already available in repository.

Examples:

completion:
150-300ms

metric:
subtle scale/opacity

stack progress:
small fill transition

Avoid installing a large animation library only for this.

No confetti.

==================================================
33. SERVER ACTIONS / API
==================================================

Use Server Actions where they cleanly fit the existing application.

Potential actions:

createStack()
completeStack()
archiveStack()
updateTimezone()
deleteAccount()

All mutations:

authenticate user
authorize resource ownership
validate with Zod
perform transaction when appropriate
return typed result

Do not trust client input.

==================================================
34. QUERY DESIGN
==================================================

Avoid N+1 queries.

Dashboard should efficiently retrieve:

user
active stacks
relevant completion history
metrics inputs

For V1 volumes, metric calculation can be performed server-side in TypeScript.

Do not prematurely build materialized views.

Keep algorithms correct and testable first.

==================================================
35. STREAK DOMAIN FUNCTIONS
==================================================

Create pure functions roughly like:

calculateDailyCurrentStreak()
calculateDailyBestStreak()

calculateWeeklyCurrentStreak()
calculateWeeklyBestStreak()

calculateStackRate()

calculateStackMetrics()

Keep them pure where possible.

Inputs should be normalized dates/periods.

Do not couple them to React.

==================================================
36. TESTS
==================================================

Write tests for at least:

DAILY

- no entries
- completed today only
- yesterday + today
- incomplete today but yesterday completed
- missed yesterday
- multiple consecutive days
- historical gap
- best streak greater than current
- duplicate dates normalized safely
- timezone boundary

WEEKLY

- no entries
- active week completion
- previous completed weeks
- current unfinished week
- missed prior week
- best weekly streak

METRICS

- lifetime proof
- stack rate
- global lifetime proof

OWNERSHIP

where reasonable test unauthorized mutation behavior.

==================================================
37. DEVELOPMENT SEED
==================================================

Provide a dev seed with:

Gym
Music
Build
Read

Generate historical entries that naturally calculate approximately:

Gym 43
Music 21
Build 17
Read 38

Lifetime proof around:

428

Do NOT hardcode those metrics into UI.

The UI must obtain them from actual seeded entries.

==================================================
38. LOADING / ERROR UX
==================================================

Create tasteful:

loading states
button pending states
form validation
network/server error states

Avoid big spinning loaders everywhere.

Use subtle skeletons if appropriate.

If completion fails:

restore previous client state and display a concise error.

==================================================
39. OFFLINE
==================================================

PWA installation does not require V1 to support full offline mutation sync.

Do NOT build offline synchronization.

The shell may cache appropriately if PWA configuration provides it.

Mutations require connectivity.

If offline, clearly disable or fail completion gracefully.

==================================================
40. SHADCN POLICY
==================================================

If shadcn is already present:

reuse primitives where helpful.

If adding it:

use it only for behavior/accessibility primitives where useful.

DO NOT allow stock shadcn visual styling to dictate the app.

Restyle every component according to the approved reference images.

Do not make STACK look like a shadcn demo.

==================================================
41. ICONS
==================================================

Prefer:

lucide-react

or an icon library already installed.

Use simple, consistent line icons.

Possible stack semantic icons:

Gym → Dumbbell
Music → Music
Build → Hammer / Wrench
Read → BookOpen

Do not make icon selection mandatory for users in V1.

Default neutral icon is acceptable for user-created names.

==================================================
42. PERFORMANCE
==================================================

Prefer Server Components.

Use Client Components only for actual interaction:

completion button
install prompt
interactive form controls
navigation interaction if necessary

Avoid turning the entire application into "use client".

Avoid unnecessary effects.

==================================================
43. SECURITY
==================================================

Never expose:

DATABASE_URL
auth secrets
email provider secrets

to browser bundles.

Verify authorization server-side for every stack-specific action.

Protect against IDOR.

Use parameterized queries through Drizzle.

Validate user inputs.

==================================================
44. ENVIRONMENT VARIABLES
==================================================

Inspect existing environment configuration.

Provide/update:

.env.example

Document variables such as:

DATABASE_URL
AUTH_SECRET
APP_URL
email provider variables if enabled

Never commit actual secrets.

==================================================
45. NEON
==================================================

The project already has Neon available.

Use the existing Neon database if configured.

Do not create another database provider.

Create Drizzle migrations safely.

Do not delete existing database schema without understanding it.

If tables conflict with existing tables:

inspect first and adapt.

==================================================
46. VERCEL
==================================================

Project is intended to deploy to Vercel.

Ensure:

npm/pnpm build succeeds
no local-only dependencies
no filesystem persistence assumption
server runtime compatibility with DB driver
environment configuration documented

Do not require a custom server.

==================================================
47. README
==================================================

Update README with:

STACK concept

technology

local development

environment variables

database setup

Drizzle migration commands

seed commands

test commands

build

Vercel deployment

PWA installation

email verification integration

architecture overview

streak rules

==================================================
48. IMPLEMENTATION PROCESS
==================================================

Do NOT blindly code everything before checking the repository.

Follow this sequence.

STEP 1
Inspect repository.

STEP 2
Report internally what exists and establish implementation plan.

Do not stop for user confirmation unless a genuinely blocking decision exists.

STEP 3
Set up / adapt schema and dependencies.

STEP 4
Implement domain logic + tests first.

STEP 5
Implement authentication.

STEP 6
Implement application queries/actions.

STEP 7
Implement UI shell.

STEP 8
Implement screens according to reference images.

STEP 9
Implement PWA.

STEP 10
Seed representative data.

STEP 11
Run quality checks.

==================================================
49. DESIGN VALIDATION PROCESS
==================================================

This is mandatory.

After implementing each important screen, compare it against the corresponding image in:

/design/reference/

Check:

- layout
- spacing
- hierarchy
- card height
- number size
- border intensity
- navigation positioning
- form density
- button size
- copy
- visual balance

Do NOT consider "same general dark style" acceptable.

Aim for high visual fidelity.

However:

the UI must remain responsive and accessible rather than being a rigid screenshot recreation.

Reference image roles:

01-auth.png
→ welcome, create account, login, reset

02-onboarding.png
→ inbox, verification, philosophy, timezone

03-start-using.png
→ empty dashboard, create stack, active dashboard

04-daily-use.png
→ stack detail, completion, broken, history

05-system.png
→ install, settings, account/security, installed PWA

==================================================
50. COPY
==================================================

Use concise product language.

Key phrases:

STACK

Proof compounds.

STACK WHAT MATTERS.

Build visible evidence of your progress.
One day, one action, one stack at a time.

STACK PROOF.

Not motivation.
Evidence.

Every completion adds one proof.

Lifetime proof stays.

NO STACKS YET

CREATE FIRST STACK

NEW STACK

Define what counts.
Keep it simple.

CURRENT STACK

LIFETIME PROOF

STACK RATE

STACK TODAY

STACK BROKEN

The data changed.
Nothing else.

START AGAIN

VIEW HISTORY

HISTORY

PROOF STACKED

INSTALL STACK

Avoid generic motivational language.

==================================================
51. DO NOT BUILD YET
==================================================

Do not build these V1 features:

AI coach
social feed
friends
leaderboards
XP
RPG system
levels
badges
achievements
Apple Health integration
Google Fit integration
Garmin
Whoop
Spotify
push-notification infrastructure
complex reminders
rest days
grace days
streak freezes
quantitative goals
timers
multi-user shared stacks
teams
paid plans
subscriptions

Do not leave stub navigation for these.

==================================================
52. ACCEPTANCE CRITERIA
==================================================

V1 is complete when:

1. user can create account
2. user can authenticate
3. user sets timezone
4. user can create Daily stack
5. user can create Weekly stack
6. user sees dashboard
7. user can complete today's stack once
8. duplicate completion is impossible
9. current streak calculates correctly
10. best streak calculates correctly
11. lifetime proof calculates correctly
12. stack rate calculates correctly
13. missing cadence correctly resets current streak
14. lifetime proof survives a broken streak
15. history is visible
16. settings works
17. account security actions work
18. user can archive stack
19. PWA manifest works
20. install UX works
21. mobile layout closely matches reference images
22. desktop remains usable
23. Neon database works
24. Vercel build works
25. lint succeeds
26. TypeScript succeeds
27. tests succeed
28. production build succeeds

==================================================
53. QUALITY GATE
==================================================

Before you finish, run the repository's equivalent of:

install
database migration validation
lint
typecheck
tests
production build

Fix errors.

Do not simply report errors unless they genuinely cannot be fixed without external credentials.

Inspect all important routes.

Check browser console for obvious errors where possible.

==================================================
54. FINAL RESPONSE
==================================================

When finished, respond with:

1. short implementation summary
2. architecture
3. database schema
4. auth approach
5. streak algorithm explanation
6. routes
7. important reusable components
8. PWA setup
9. environment variables required
10. tests executed
11. lint/typecheck/build results
12. migration/seed commands
13. any known limitations
14. exact Vercel deployment steps

Do not provide a long tutorial unless necessary.

Most importantly:

BUILD THE WORKING PRODUCT.

Do not only create specifications.

Do not stop after scaffolding.

Do not replace functionality with TODO comments.

Do not overengineer.

Small.
Beautiful.
Reliable.
Installable.

STACK PROOF.