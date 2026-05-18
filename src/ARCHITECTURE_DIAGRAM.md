# RallyHub Authentication Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        RALLYHUB PLATFORM                         │
│                         rallyhub.ie                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌────────────────────────────────────────┐
        │         Custom Domain Layer            │
        │  (rallyhub.ie / app.rallyhub.ie)      │
        │         SSL/TLS Enabled                │
        └────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND APPLICATION                          │
│                     (React + Vite)                              │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Landing Page │  │  Auth Pages  │  │  App Routes  │         │
│  │   (Public)   │  │  /auth       │  │  (Protected) │         │
│  │              │  │  /first-login│  │  /           │         │
│  │              │  │              │  │  /dashboard  │         │
│  │              │  │              │  │  /admin      │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  ┌──────────────────────────────────────────────────┐           │
│  │          AuthContext Provider                    │           │
│  │  - Manages authentication state                  │           │
│  │  - Handles login/logout                          │           │
│  │  - Token management                              │           │
│  │  - User session persistence                      │           │
│  └──────────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌────────────────────────────────────────┐
        │      Base44 Authentication Service     │
        │      (Platform-Managed Auth)           │
        │                                        │
        │  - User account creation               │
        │  - Password hashing (bcrypt)           │
        │  - Session token generation            │
        │  - OAuth flows                         │
        │  - Email verification                  │
        │  - Password reset                      │
        └────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                             │
│                                                                  │
│  ┌──────────────────────────────────────────────────┐           │
│  │           Access Code Validation                 │           │
│  │           (Backend Function)                     │           │
│  │                                                  │           │
│  │  - Validates access codes                        │           │
│  │  - Grants/denies app access                      │           │
│  │  - Session-based validation                      │           │
│  └──────────────────────────────────────────────────┘           │
│                                                                  │
│  ┌──────────────────────────────────────────────────┐           │
│  │           User Entity Management                 │           │
│  │           (Database Layer)                       │           │
│  │                                                  │           │
│  │  - User profiles stored in app DB                │           │
│  │  - Exportable data (JSON/CSV)                    │           │
│  │  - Custom fields support                         │           │
│  │  - Role-based permissions                        │           │
│  └──────────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌────────────────────────────────────────┐
        │         Admin Panel                    │
        │         /admin                         │
        │                                        │
        │  ┌──────────────────────────────────┐  │
        │  │ Users & Roles Tab                │  │
        │  │ - View all users                 │  │
        │  │ - Promote/demote admins          │  │
        │  │ - Set passwords                  │  │
        │  │ - Generate temp passwords        │  │
        │  │ - Invite users via email         │  │
        │  └──────────────────────────────────┘  │
        │                                        │
        │  ┌──────────────────────────────────┐  │
        │  │ Access Codes Tab                 │  │
        │  │ - Generate access codes          │  │
        │  │ - Validate codes                 │  │
        │  │ - Manage code lifecycle          │  │
        │  └──────────────────────────────────┘  │
        └────────────────────────────────────────┘
```

---

## Authentication Flow Diagrams

### 1. New User Registration Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │
     │ 1. Visits rallyhub.ie/auth
     ▼
┌─────────────────────────────────┐
│     Auth Page (/auth)           │
│  ┌─────────────────────────┐    │
│  │  Create Account Tab     │    │
│  │  - Name                 │    │
│  │  - Email                │    │
│  │  - Password             │    │
│  │  - Phone (optional)     │    │
│  └─────────────────────────┘    │
└────┬────────────────────────────┘
     │
     │ 2. Submits registration
     ▼
┌─────────────────────────────────┐
│  Base44 Auth Service            │
│  - Creates user account         │
│  - Hashes password              │
│  - Generates session token      │
└────┬────────────────────────────┘
     │
     │ 3. Returns auth token
     ▼
┌─────────────────────────────────┐
│     Access Code Gate            │
│  (First-time user redirect)     │
│  - Prompts for access code      │
└────┬────────────────────────────┘
     │
     │ 4. Enters access code
     ▼
┌─────────────────────────────────┐
│  validateAccessCode Function    │
│  - Validates code               │
│  - Marks session as validated   │
└────┬────────────────────────────┘
     │
     │ 5. Code valid → Grant access
     ▼
┌─────────────────────────────────┐
│     Dashboard (/)               │
│  - Full app access              │
│  - User session active          │
└─────────────────────────────────┘
```

### 2. Existing User Login Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │
     │ 1. Visits rallyhub.ie/auth
     ▼
┌─────────────────────────────────┐
│     Auth Page (/auth)           │
│  ┌─────────────────────────┐    │
│  │     Login Tab           │    │
│  │  - Email                │    │
│  │  - Password             │    │
│  └─────────────────────────┘    │
└────┬────────────────────────────┘
     │
     │ 2. Submits credentials
     ▼
┌─────────────────────────────────┐
│  Base44 Auth Service            │
│  - Validates credentials        │
│  - Generates session token      │
└────┬────────────────────────────┘
     │
     │ 3. Auth successful
     ▼
┌─────────────────────────────────┐
│  Check Access Code Status       │
│  (validateAccessCode function)  │
└────┬────────────────────────────┘
     │
     ├──────────────┬──────────────┐
     │              │              │
     ▼              ▼              ▼
┌─────────┐   ┌──────────┐   ┌──────────┐
│ Validated│   │ Not      │   │ Error    │
│ Before   │   │ Validated│   │          │
└────┬────┘   └────┬─────┘   └────┬─────┘
     │            │               │
     │            │               │ Redirect to
     │            │               │ access code gate
     │            │ Enter code
     ▼            ▼               ▼
┌─────────────────────────────────┐
│     Dashboard (/)               │
│  - User gains full access       │
└─────────────────────────────────┘
```

### 3. First-Time Login (Temp Password) Flow

```
┌─────────┐
│  Admin  │
└────┬────┘
     │
     │ 1. Generates temp password
     │    (Admin Panel → Users)
     ▼
┌─────────────────────────────────┐
│  tempPasswordLogin Function     │
│  - Creates one-time token       │
│  - Associates with user email   │
└────┬────────────────────────────┘
     │
     │ 2. Shares credentials
     │    (Email + Temp Password)
     ▼
┌─────────┐
│  User   │
└────┬────┘
     │
     │ 3. Visits rallyhub.ie/first-login
     ▼
┌─────────────────────────────────┐
│   FirstLogin Component          │
│  Step 1: Verify Temp Password   │
│  - Enter email                  │
│  - Enter temp password          │
└────┬────────────────────────────┘
     │
     │ 4. Validates temp credentials
     ▼
┌─────────────────────────────────┐
│  tempPasswordLogin Function     │
│  - Validates temp token         │
│  - Returns user info            │
└────┬────────────────────────────┘
     │
     │ 5. Verification successful
     ▼
┌─────────────────────────────────┐
│   FirstLogin Component          │
│  Step 2: Request Password Reset │
│  - Triggers platform reset flow │
│  - Sends email with reset link  │
└────┬────────────────────────────┘
     │
     │ 6. User receives email
     ▼
┌─────────┐
│  User   │
└────┬────┘
     │
     │ 7. Clicks reset link
     ▼
┌─────────────────────────────────┐
│  Base44 Password Reset Page     │
│  (Platform-hosted, secure)      │
│  - User sets permanent password │
└────┬────────────────────────────┘
     │
     │ 8. Password set successfully
     ▼
┌─────────────────────────────────┐
│     Auth Page (/auth)           │
│  - User logs in with new        │
│    permanent password           │
└─────────────────────────────────┘
```

### 4. Admin User Management Flow

```
┌─────────┐
│  Admin  │
└────┬────┘
     │
     │ 1. Logs in → Navigates to /admin
     ▼
┌─────────────────────────────────┐
│     Admin Panel                 │
│  ┌───────────────────────────┐  │
│  │  Users & Roles Tab        │  │
│  │  - List all users         │  │
│  │  - Search by name/email   │  │
│  │  - View roles             │  │
│  └───────────────────────────┘  │
└────┬────────────────────────────┘
     │
     ├─────────────────┬──────────────────┬──────────────┐
     │                 │                  │              │
     ▼                 ▼                  ▼              ▼
┌─────────┐     ┌──────────┐      ┌───────────┐  ┌──────────┐
│ Promote │     │ Demote   │      │ Set       │  │ Generate │
│ to Admin│     │ to User  │      │ Password  │  │ Temp Pass│
└────┬────┘     └────┬─────┘      └─────┬─────┘  └────┬─────┘
     │               │                  │             │
     ▼               ▼                  ▼             ▼
┌─────────────────────────────────────────────────────────┐
│           adminUserTools Function                        │
│  - promote_to_admin: Updates user role                  │
│  - demote_to_user: Downgrades role                      │
│  - set_password: Sets permanent password                │
│  - set_temp_password: Creates one-time token            │
└────┬────────────────────────────────────────────────────┘
     │
     │ Updates applied
     ▼
┌─────────────────────────────────┐
│     User Entity (Database)      │
│  - Role updated                 │
│  - Password set/updated         │
│  - Audit trail maintained       │
└─────────────────────────────────┘
```

---

## Data Flow Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      DATA LAYERS                              │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐    │
│  │              Base44 Platform Layer                    │    │
│  │                                                       │    │
│  │  ┌─────────────────┐  ┌─────────────────┐            │    │
│  │  │ User Accounts   │  │ Auth Sessions   │            │    │
│  │  │ (Platform-managed│  │ (JWT tokens)   │            │    │
│  │  │  email, password│  │                 │            │    │
│  │  │  hash, roles)   │  │                 │            │    │
│  │  └─────────────────┘  └─────────────────┘            │    │
│  └──────────────────────────────────────────────────────┘    │
│                       │                                        │
│                       │ Sync (read-only)                      │
│                       ▼                                        │
│  ┌──────────────────────────────────────────────────────┐    │
│  │              Application Database Layer               │    │
│  │                                                       │    │
│  │  ┌─────────────────┐  ┌─────────────────┐            │    │
│  │  │ User Entity     │  │ Player Entity   │            │    │
│  │  │ (App-owned)     │  │ (Player profiles│            │    │
│  │  │ - email         │  │  linked to users│            │    │
│  │  │ - full_name     │  │                 │            │    │
│  │  │ - role          │  │  - user_id      │            │    │
│  │  │ - display_name  │  │  - linked_email │            │    │
│  │  │ (custom fields) │  │                 │            │    │
│  │  └─────────────────┘  └─────────────────┘            │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐    │
│  │              Export/Backup Layer                      │    │
│  │                                                       │    │
│  │  - JSON exports (all entities)                       │    │
│  │  - CSV exports (user lists)                          │    │
│  │  - API access to all data                            │    │
│  │  - Portable for migration                            │    │
│  └──────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

---

## Security Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                            │
│                                                               │
│  Layer 1: Transport Security                                 │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  HTTPS/TLS (Let's Encrypt)                           │    │
│  │  - All traffic encrypted                             │    │
│  │  - Auto-renewal                                      │    │
│  │  - HSTS enabled                                      │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                               │
│  Layer 2: Authentication Security                            │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  Base44 Auth Service                                 │    │
│  │  - bcrypt password hashing (salt + hash)             │    │
│  │  - JWT session tokens                                │    │
│  │  - Token expiration (configurable)                   │    │
│  │  - Secure cookie storage                             │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                               │
│  Layer 3: Application Security                               │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  Access Code Validation                              │    │
│  │  - Additional app-layer security                     │    │
│  │  - Session-based validation                          │    │
│  │  - Rate limiting (if needed)                         │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                               │
│  Layer 4: Authorization                                      │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  Role-Based Access Control (RBAC)                    │    │
│  │  - Admin role: Full access                           │    │
│  │  - User role: Standard access                        │    │
│  │  - Route protection via AuthContext                  │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                               │
│  Layer 5: Data Security                                      │
│  ┌──────────────────────────────────────────────────────┐    │
│  │  Database Security                                   │    │
│  │  - Row-Level Security (RLS) policies                 │    │
│  │  - User data isolation                               │    │
│  │  - Admin-only write access                           │    │
│  └──────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

---

## Migration Architecture (Future-Proofing)

```
┌──────────────────────────────────────────────────────────────┐
│              CURRENT: Base44 Auth                            │
│                                                               │
│  ┌──────────────┐                                           │
│  │  Frontend    │                                           │
│  │  (React App) │                                           │
│  └──────┬───────┘                                           │
│         │                                                    │
│         │ Uses: base44.auth.*                               │
│         ▼                                                    │
│  ┌──────────────┐                                           │
│  │ AuthContext  │ ← Abstraction layer (easy to replace)     │
│  └──────┬───────┘                                           │
│         │                                                    │
│         │ Calls: Base44 SDK                                 │
│         ▼                                                    │
│  ┌──────────────┐                                           │
│  │ Base44 Auth  │                                           │
│  │   Service    │                                           │
│  └──────────────┘                                           │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│              FUTURE: External Auth Provider                  │
│                                                               │
│  ┌──────────────┐                                           │
│  │  Frontend    │                                           │
│  │  (React App) │                                           │
│  └──────┬───────┘                                           │
│         │                                                    │
│         │ Uses: newAuth.signIn()                            │
│         ▼                                                    │
│  ┌──────────────┐                                           │
│  │ AuthContext  │ ← Updated to use new provider             │
│  └──────┬───────┘                                           │
│         │                                                    │
│         │ Calls: New Provider SDK                           │
│         ▼                                                    │
│  ┌──────────────┐                                           │
│  │ Supabase/Clerk│                                          │
│  │   Auth0      │                                           │
│  └──────────────┘                                           │
│                                                               │
│  Migration Steps:                                            │
│  1. Export user data from Base44                             │
│  2. Set up new auth provider                                 │
│  3. Update AuthContext implementation                        │
│  4. Migrate user emails (passwords require reset)            │
│  5. Deploy updated app                                       │
│  6. Notify users to reset passwords                          │
└──────────────────────────────────────────────────────────────┘
```

---

## Component Hierarchy

```
App.jsx
├── AuthProvider
│   └── AuthContext (manages auth state)
│       ├── user (current user object)
│       ├── isAuthenticated (boolean)
│       ├── isLoadingAuth (boolean)
│       ├── authError (error object)
│       ├── logout() (function)
│       └── navigateToLogin() (function)
│
├── Routes
│   ├── Public Routes
│   │   ├── / (Landing page)
│   │   ├── /auth (AuthPage component)
│   │   └── /first-login (FirstLogin component)
│   │
│   └── Protected Routes (require auth + access code)
│       ├── / (Dashboard)
│       ├── /players (Players list)
│       ├── /players/:id (Player profile)
│       ├── /tournaments (Tournaments list)
│       ├── /tournaments/:id (Tournament detail)
│       ├── /matches (Match center)
│       ├── /leaderboard (Leaderboard)
│       ├── /analytics (Analytics)
│       ├── /my-profile (User profile)
│       └── /admin (Admin panel - admin only)
│
└── AccessCodeGate (intercepts unvalidated users)
    └── validateAccessCode function call
```

---

**Last Updated:** May 18, 2026  
**Version:** 1.0