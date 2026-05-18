# RallyHub Domain & Authentication Setup Guide

## Quick Start Checklist

### Phase 1: Custom Domain Configuration

#### Step 1.1: Choose Your Domain Strategy

**Option A: Single Domain (Recommended for Simplicity)**
- `rallyhub.ie` → App (login + dashboard)
- Use external service (Carrd, Webflow) for marketing site at `www.rallyhub.ie`
- **Pros:** Simple setup, one domain to manage
- **Cons:** Marketing site separate

**Option B: Subdomain Setup (If Base44 Supports It)**
- `app.rallyhub.ie` → App (login + dashboard)
- `rallyhub.ie` or `www.rallyhub.ie` → Marketing/landing page
- **Pros:** Clean separation, professional
- **Cons:** Requires Base44 multi-domain support

#### Step 1.2: Add Domain in Base44 Dashboard

1. **Navigate to Settings:**
   ```
   Base44 Dashboard → Your App → Settings → Custom Domains
   ```

2. **Add Your Domain:**
   - Click "Add Custom Domain"
   - Enter: `rallyhub.ie` OR `app.rallyhub.ie`
   - Base44 will provide DNS target (e.g., `app-123.base44.app`)

3. **Note the DNS Target:**
   ```
   Your domain should point to: app-xxxx.base44.app
   (Save this for next step)
   ```

#### Step 1.3: Configure DNS Records

**Login to your domain registrar** (GoDaddy, Namecheap, Cloudflare, etc.)

**For Root Domain (`rallyhub.ie`):**

| Type | Name/Host | Value/Target | TTL |
|------|-----------|--------------|-----|
| CNAME or ALIAS | @ | `app-xxxx.base44.app` | Auto |

**For Subdomain (`app.rallyhub.ie`):**

| Type | Name/Host | Value/Target | TTL |
|------|-----------|--------------|-----|
| CNAME | app | `app-xxxx.base44.app` | Auto |

**Example (Cloudflare):**
```
Type: CNAME
Name: app
Target: app-12345.base44.app
Proxy status: Proxied (orange cloud)
TTL: Auto
```

**Example (GoDaddy):**
```
Type: CNAME
Host: app
Points to: app-12345.base44.app
TTL: 1 Hour
```

#### Step 1.4: Wait for DNS Propagation

- **Time:** 5 minutes to 48 hours (typically 15-30 mins)
- **Check Status:** Use https://dnschecker.org
- **Base44 Dashboard:** Shows domain status (Pending → Active)

#### Step 1.5: SSL Certificate (Automatic)

- Base44 auto-provisions SSL via Let's Encrypt
- No action required
- Certificate renews automatically
- Verify: Visit `https://rallyhub.ie` - should show padlock icon

---

### Phase 2: Testing Authentication Flow

#### Step 2.1: Test on Custom Domain

1. **Visit your domain:**
   ```
   https://rallyhub.ie/auth
   OR
   https://app.rallyhub.ie/auth
   ```

2. **Verify Branding:**
   - ✅ RallyHub logo displays
   - ✅ No Base44 branding visible
   - ✅ Professional login/signup UI
   - ✅ Custom domain in browser URL bar

3. **Test Login Flow:**
   ```
   Enter email → Enter password → Click "Sign In"
   → Should redirect to access code gate
   → Enter access code → Dashboard loads
   ```

4. **Test Signup Flow:**
   ```
   Click "Create Account" tab
   → Enter name, email, password
   → Click "Create RallyHub Account"
   → Account created → Access code gate
   ```

#### Step 2.2: Configure Access Codes

1. **Access Admin Panel:**
   ```
   Login as admin → Navigate to /admin
   → Click "Access Codes" tab
   ```

2. **Generate Access Code:**
   - Click "Generate New Code"
   - Copy the code (e.g., `RALLY-2026-PRO`)
   - Share with users via secure channel

3. **Test Access Code:**
   ```
   Logout → Visit /auth → Login
   → Enter access code when prompted
   → Should gain access to dashboard
   ```

---

### Phase 3: User Management Setup

#### Step 3.1: Invite Founding Users

**Method 1: Email Invitation (Recommended)**

1. **Admin Panel → "Invite Users" Tab**
2. **Enter User Details:**
   ```
   Full Name: John Smith
   Email: john@example.com
   Role: User (or Admin for team members)
   ```
3. **Click "Send Invitation"**
4. **User Receives Email:**
   - Invitation link to `rallyhub.ie/auth`
   - Instructions to set password
   - Access code (if included)

**Method 2: Temp Password Flow**

1. **Admin Panel → "Users & Roles" Tab**
2. **Find User → Click "Temp Password" Icon**
3. **Generate Temp Password:**
   ```
   Temp password: ABC123XYZ
   Valid for: 24 hours
   ```
4. **Share Securely with User:**
   ```
   Email: john@example.com
   Temp Password: ABC123XYZ
   Login URL: https://rallyhub.ie/first-login
   Access Code: RALLY-2026-PRO
   ```

#### Step 3.2: User Role Management

**Promote User to Admin:**

1. **Admin Panel → "Users & Roles"**
2. **Find User → Click "Make Admin"**
3. **User Now Has:**
   - Access to `/admin` panel
   - Can invite other users
   - Can manage tournaments, players, etc.

**Demote Admin to User:**

1. **Admin Panel → "Users & Roles"**
2. **Find Admin → Click "Remove Admin"**
3. **User Loses:**
   - Admin panel access
   - Can only manage own profile

---

### Phase 4: Production Deployment

#### Step 4.1: Final Checks

**Security:**
- [ ] HTTPS enabled (padlock icon visible)
- [ ] Access codes distributed securely
- [ ] Admin passwords are strong (12+ characters)
- [ ] Temp passwords expire after use

**Branding:**
- [ ] RallyHub logo on all auth pages
- [ ] No Base44 references visible
- [ ] Custom domain in browser URL
- [ ] Favicon displays correctly

**Functionality:**
- [ ] Login works on custom domain
- [ ] Signup creates accounts successfully
- [ ] Access code validation works
- [ ] Admin panel accessible to admins only
- [ ] User management functional

#### Step 4.2: DNS Finalization

1. **Remove Hosts File Entries** (if used for testing):
   ```
   # Edit /etc/hosts or C:\Windows\System32\drivers\etc\hosts
   # Remove lines with base44 IP addresses
   ```

2. **Verify Public DNS:**
   ```bash
   nslookup rallyhub.ie
   nslookup app.rallyhub.ie
   ```

3. **Test from Multiple Devices:**
   - Desktop browser
   - Mobile browser
   - Different networks (WiFi, mobile data)

#### Step 4.3: Monitoring & Maintenance

**Weekly Tasks:**
- Review new user signups
- Monitor access code usage
- Check admin panel logs

**Monthly Tasks:**
- Rotate access codes (if needed)
- Review admin user list
- Update user roles as needed

**Quarterly Tasks:**
- Security audit
- Password policy review
- Backup user data export

---

## Troubleshooting Common Issues

### Issue 1: Domain Not Resolving

**Symptoms:**
- "Site can't be reached"
- DNS error in browser

**Solutions:**
1. Wait 24-48 hours for DNS propagation
2. Check DNS records at registrar - ensure CNAME is correct
3. Clear DNS cache: `sudo dscacheutil -flushcache` (Mac) or `ipconfig /flushdns` (Windows)
4. Verify in Base44 dashboard that domain is "Active"

### Issue 2: SSL Certificate Not Working

**Symptoms:**
- Browser shows "Not Secure" warning
- SSL error in browser

**Solutions:**
1. Wait 5-10 minutes after DNS propagation
2. Base44 auto-provisions SSL - no action needed
3. Force HTTPS: Visit `https://` explicitly
4. Contact Base44 support if issue persists >1 hour

### Issue 3: Login Redirects to Base44 Domain

**Symptoms:**
- After login, URL shows `base44.app` instead of custom domain

**Solutions:**
1. This is normal for OAuth flow - final redirect should return to custom domain
2. If stuck on Base44 domain, clear browser cache/cookies
3. Ensure custom domain is set as primary in Base44 dashboard

### Issue 4: Access Code Not Validating

**Symptoms:**
- "Invalid access code" error
- User can't proceed to dashboard

**Solutions:**
1. Verify code matches exactly (case-sensitive)
2. Check backend function `validateAccessCode` is deployed
3. Admin panel → "Access Codes" → Verify code is active
4. Try generating new access code

### Issue 5: User Can't Login After Signup

**Symptoms:**
- "Invalid credentials" error
- User exists in system but can't authenticate

**Solutions:**
1. User must complete access code validation first
2. Check if user account is in "Active" status
3. Admin can reset password via admin panel
4. Try temp password flow: `/first-login`

---

## Migration Path (Future)

### When Ready to Leave Base44

**Phase 1: Data Export**
```bash
# Export all user data
GET /api/entities/User/list
Save as: users-backup.json

# Export all players, tournaments, matches
GET /api/entities/Player/list
GET /api/entities/Tournament/list
GET /api/entities/Match/list
```

**Phase 2: Set Up New Auth Provider**

**Option A: Supabase**
1. Create Supabase project at https://supabase.com
2. Enable Email/Password authentication
3. Configure custom SMTP (optional, for branded emails)
4. Migrate user emails (passwords require reset)

**Option B: Clerk**
1. Create Clerk account at https://clerk.com
2. Configure authentication methods
3. Add custom domain for Clerk-hosted pages
4. Integrate Clerk SDK into app

**Phase 3: Code Migration**
```javascript
// Replace Base44 auth calls with new provider

// OLD (Base44):
await base44.auth.login(email, password);

// NEW (Supabase):
const { data, error } = await supabase.auth.signInWithPassword({
  email,
  password
});

// NEW (Clerk):
await clerk.client.sessions.create({ password });
```

**Phase 4: User Communication**
```
Subject: Important: RallyHub Authentication Update

Dear RallyHub User,

We're upgrading our authentication system to serve you better.

Action Required:
1. Visit rallyhub.ie before [DATE]
2. Click "Reset Password"
3. Set your new password

Your account data remains unchanged.

Questions? Reply to this email.

— RallyHub Team
```

---

## Cost Breakdown

### Current (Base44)
- **Platform Hosting:** Included in Base44 plan
- **Authentication:** Included
- **Custom Domain:** Included
- **SSL Certificate:** Included
- **Total:** $X/month (Base44 subscription)

### Future (Self-Hosted Alternative)
- **Hosting (Vercel/Netlify):** $20/month
- **Auth Provider (Clerk/Supabase):** $0-25/month (free tier available)
- **Domain (Namecheap):** $10/year
- **Database (Supabase/PlanetScale):** $0-29/month
- **Total:** $20-74/month

**Note:** Base44 provides excellent value for early-stage apps. Migration only necessary at scale.

---

## Support Resources

### Base44 Support
- **Documentation:** https://docs.base44.com
- **Discord Community:** https://discord.base44.com
- **Email Support:** support@base44.com

### RallyHub Internal
- **Admin Panel:** `/admin`
- **Auth Setup Guide:** `AUTH_SETUP.md` (this file)
- **Technical Contact:** [Your email]

### Domain Registrar Support
- **GoDaddy:** https://gd.com/help
- **Namecheap:** https://namecheap.com/support
- **Cloudflare:** https://cloudflare.com/support

---

## Security Best Practices

### Access Code Management
- ✅ Use long, random codes (16+ characters)
- ✅ Rotate codes every 90 days
- ✅ Distribute via secure channels (encrypted email, SMS)
- ❌ Don't share codes in public forums
- ❌ Don't use predictable patterns

### Admin Account Security
- ✅ Use strong, unique passwords (16+ characters)
- ✅ Enable 2FA if available
- ✅ Limit number of admin accounts (<5 recommended)
- ✅ Regular access reviews
- ❌ Don't share admin credentials

### User Data Protection
- ✅ Export user data backups monthly
- ✅ Review user list quarterly
- ✅ Remove inactive users annually
- ❌ Don't export user data to unsecured locations

---

## Appendix: DNS Record Examples

### Cloudflare Configuration
```
Type: CNAME
Name: app
Target: app-12345.base44.app
Proxy status: Proxied
TTL: Auto
```

### GoDaddy Configuration
```
Type: CNAME
Host: app
Points to: app-12345.base44.app
TTL: 1 Hour
```

### Namecheap Configuration
```
Type: CNAME Record
Host: app
Value: app-12345.base44.app
TTL: Automatic
```

### Google Domains Configuration
```
Type: CNAME
Name: app
Data: app-12345.base44.app
TTL: 1h
```

---

**Last Updated:** May 18, 2026  
**Version:** 1.0  
**Maintained By:** RallyHub Development Team