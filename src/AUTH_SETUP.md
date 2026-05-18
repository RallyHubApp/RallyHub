# RallyHub Authentication Architecture

## Overview

This document outlines the authentication architecture for RallyHub, designed to provide a fully branded, professional authentication experience while maintaining migration flexibility for future platform transitions.

---

## Current Implementation

### ✅ What's Implemented

1. **Fully Branded Auth Pages**
   - Custom login/signup pages with RallyHub branding
   - No Base44 branding visible to end users
   - Professional UI matching RallyHub's design system
   - Located at: `/auth` route

2. **User Data Ownership**
   - All user profiles stored in app's `User` entity
   - Admin panel provides full user management
   - User data is portable and exportable
   - Custom fields can be added as needed

3. **Access Control**
   - Access code validation system for gated entry
   - Role-based permissions (Admin/User)
   - Admin panel for user management
   - Temp password flow for first-time login

4. **Custom Domain Ready**
   - App configured for `rallyhub.ie` domain
   - Subdomain routing supported
   - SSL/TLS handled by platform

---

## Domain Configuration

### Primary Domain: `rallyhub.ie`

**Marketing/Landing Page:**
- Root domain serves landing page
- Public-facing content
- No authentication required

**App Access:**
- `/auth` - Login/signup page
- `/` - Dashboard (requires auth + access code)
- All app routes protected by authentication

### Subdomain: `app.rallyhub.ie` (Recommended Setup)

To configure `app.rallyhub.ie` as a dedicated app subdomain:

#### Option A: DNS + Platform Configuration (If Supported)

1. **Add Custom Domain in Base44 Dashboard:**
   - Go to Settings → Domains
   - Add `app.rallyhub.ie` as a custom domain
   - Follow DNS configuration instructions

2. **DNS Configuration:**
   ```
   app.rallyhub.ie.  CNAME  <base44-provided-domain>
   ```

3. **Update App Routing:**
   - The app will automatically serve the same application
   - Users visiting `app.rallyhub.ie` will see the auth page first

#### Option B: Manual Subdomain Routing (Current Limitation)

If Base44 doesn't support multiple custom domains per app:

1. **Use Root Domain for App:**
   - Configure `rallyhub.ie` to point to the app
   - Use a separate marketing site (e.g., `www.rallyhub.ie`) for landing page

2. **Alternative: Path-Based Routing:**
   - Landing page: `rallyhub.ie/` (public)
   - App: `rallyhub.ie/app/` (requires routing logic)

**Note:** Base44's architecture ties one app to one custom domain. For true subdomain separation, you may need to:
- Keep marketing site on `www.rallyhub.ie` (external hosting)
- Point `rallyhub.ie` or `app.rallyhub.ie` to the Base44 app

---

## Authentication Flow

### 1. New User Registration

```
User visits rallyhub.ie/auth
→ Clicks "Create Account" tab
→ Enters name, email, password
→ Account created via Base44 auth
→ User redirected to access code gate
→ Enters access code (provided by admin)
→ Gains access to dashboard
```

### 2. Existing User Login

```
User visits rallyhub.ie/auth
→ Enters email and password
→ Authenticates via Base44 auth
→ If access code validated before → Dashboard
→ If not validated → Access code gate
```

### 3. First-Time Login (Temp Password)

```
Admin invites user → User receives temp password
→ User visits rallyhub.ie/first-login
→ Enters email + temp password
→ System validates credentials
→ Password reset email sent
→ User sets permanent password
→ Can now login via /auth
```

### 4. Access Code Validation

```
New/returning user without validated access code
→ Redirected to access code gate
→ Enters access code
→ Code validated via backend function
→ Access granted → Dashboard
→ Validation persists in user session
```

---

## Admin User Management

### Location: `/admin` → "Users & Roles" Tab

**Capabilities:**
- View all registered users
- Search by name/email
- Promote/demote user roles (Admin ↔ User)
- Set permanent passwords for users
- Generate temp passwords for new users
- Edit user display names
- Invite new users via email

**Access Control:**
- Only users with `role: 'admin'` can access admin panel
- Admin verification in place for sensitive operations

---

## User Entity Structure

```json
{
  "id": "user_id",
  "email": "user@email.com",
  "full_name": "John Smith",
  "display_name": "John",  // Customizable
  "role": "admin | user",
  "created_date": "ISO date",
  "updated_date": "ISO date"
}
```

**Notes:**
- User entity is managed by Base44 platform
- Custom fields can be added via `User.json` schema
- All user data is exportable via admin panel or API

---

## Migration Readiness

### Data Portability

✅ **User Data:**
- Stored in app's database entities
- Exportable via admin panel or API calls
- Standard JSON/CSV formats
- No vendor lock-in for data

✅ **Authentication Logic:**
- Abstracted via `AuthContext` provider
- Modular architecture
- Can be replaced with external auth provider

### Future Migration Paths

#### Option 1: Supabase Auth
1. Create Supabase project
2. Migrate user emails (passwords cannot be exported)
3. Implement password reset flow for users
4. Replace `base44.auth.*` calls with Supabase client
5. Update `AuthContext` to use Supabase

#### Option 2: Clerk/Auth0
1. Set up Clerk/Auth0 application
2. Configure custom domain
3. Implement Clerk/Auth0 SDK
4. Migrate user data (again, passwords require reset)
5. Update auth context

#### Option 3: Custom Backend
1. Deploy independent auth service (e.g., NextAuth, Passport.js)
2. Migrate user database
3. Implement OAuth/social login if needed
4. Replace auth provider in app

### Migration Checklist

- [ ] Export all user data from current system
- [ ] Set up new auth provider
- [ ] Implement password reset flow for all users
- [ ] Update `AuthContext` to use new provider
- [ ] Test all auth flows (login, signup, reset, etc.)
- [ ] Update DNS/domain configuration
- [ ] Deploy new auth system
- [ ] Communicate changes to users

---

## Environment Variables

Currently used:
```
VITE_BASE44_APP_BASE_URL  // Provided by platform
```

For future migration, you would add:
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_CLERK_PUBLISHABLE_KEY
VITE_AUTH0_DOMAIN
VITE_AUTH0_CLIENT_ID
```

---

## Security Considerations

### Current Implementation

- **Password Storage:** Handled by Base44 (bcrypt hashing)
- **Session Management:** Platform-managed tokens
- **HTTPS:** Enforced by platform on custom domains
- **Access Codes:** Additional app-layer security
- **Role-Based Access:** Admin/user permissions

### Recommendations

1. **Strong Password Policy:**
   - Minimum 8 characters (currently enforced)
   - Consider requiring special characters, numbers

2. **Access Code Management:**
   - Rotate access codes periodically
   - Use strong, random codes
   - Limit code sharing

3. **Admin Access:**
   - Limit number of admin users
   - Monitor admin actions via logs
   - Regular access reviews

4. **Session Security:**
   - Implement session timeout (if needed)
   - Clear tokens on logout
   - Prevent concurrent sessions (optional)

---

## Custom Domain Setup Instructions

### Step 1: Base44 Dashboard Configuration

1. Log into Base44 dashboard
2. Navigate to **Settings → Custom Domains**
3. Click **Add Domain**
4. Enter `rallyhub.ie` or `app.rallyhub.ie`
5. Follow DNS configuration instructions

### Step 2: DNS Configuration

Your domain registrar (e.g., GoDaddy, Namecheap) requires:

**For Root Domain (`rallyhub.ie`):**
```
Type: CNAME or ALIAS
Name: @
Value: <base44-provided-domain>
TTL: Automatic
```

**For Subdomain (`app.rallyhub.ie`):**
```
Type: CNAME
Name: app
Value: <base44-provided-domain>
TTL: Automatic
```

### Step 3: SSL Certificate

- Base44 automatically provisions SSL via Let's Encrypt
- No manual configuration needed
- Certificate renews automatically

### Step 4: Testing

1. Update hosts file to test before DNS propagation:
   ```
   # /etc/hosts (Mac/Linux) or C:\Windows\System32\drivers\etc\hosts (Windows)
   <base44-ip>  rallyhub.ie
   <base44-ip>  app.rallyhub.ie
   ```

2. Verify SSL certificate is active
3. Test all auth flows on custom domain

---

## API Reference

### Authentication SDK Methods

```javascript
import { base44 } from '@/api/base44Client';

// Check authentication status
const isAuthenticated = await base44.auth.isAuthenticated();

// Get current user
const user = await base44.auth.me();

// Login
await base44.auth.login(email, password);

// Signup
await base44.auth.signup(email, password, { full_name, phone });

// Logout
base44.auth.logout(redirectUrl);

// Update user profile
await base44.auth.updateMe({ full_name, phone });

// Redirect to login
base44.auth.redirectToLogin(nextUrl);
```

### User Management

```javascript
// List all users (admin only)
const users = await base44.entities.User.list();

// Update user (admin only)
await base44.entities.User.update(userId, { role: 'admin' });

// Invite user
await base44.users.inviteUser(email, role);
```

---

## Troubleshooting

### Common Issues

**1. "Authentication Required" Error**
- User not logged in
- Token expired
- Solution: Redirect to `/auth`

**2. "User Not Registered" Error**
- User exists in Base44 but not in app's allowed users
- Solution: Admin must invite user or add to allowed list

**3. Access Code Not Validating**
- Check backend function `validateAccessCode` is deployed
- Verify access code matches configured value
- Check user session is active

**4. Custom Domain Not Working**
- DNS propagation can take 24-48 hours
- Verify DNS records are correct
- Check Base44 dashboard for domain status
- Ensure SSL certificate is active

---

## Support & Resources

### Base44 Documentation
- Authentication: https://docs.base44.com/auth
- Custom Domains: https://docs.base44.com/domains
- User Management: https://docs.base44.com/users

### RallyHub Admin Contacts
- Technical Lead: [Your contact]
- Admin Panel Access: `/admin`
- Support: [Your support email]

---

## Version History

- **v1.0** (May 2026): Initial implementation
  - Fully branded auth pages
  - Access code validation
  - Admin user management
  - Custom domain configuration

---

## Next Steps

1. **Configure Custom Domain:**
   - Follow DNS setup instructions above
   - Test on `rallyhub.ie` or `app.rallyhub.ie`

2. **Set Up Access Codes:**
   - Use admin panel to generate/validate codes
   - Distribute to initial users

3. **Invite Founding Users:**
   - Use admin panel → "Invite Users" tab
   - Send temp passwords or access codes

4. **Monitor & Iterate:**
   - Watch for auth issues
   - Gather user feedback
   - Refine flows as needed

---

**Last Updated:** May 18, 2026
**Maintained By:** RallyHub Development Team