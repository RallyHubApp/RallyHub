# RallyHub Authentication - Quick Reference Card

## 📍 Key URLs & Locations

| Purpose | URL/Location | Access |
|---------|-------------|--------|
| **Login/Signup** | `/auth` | Public |
| **First-Time Login** | `/first-login` | Public (temp password) |
| **Admin Panel** | `/admin` | Admin only |
| **Dashboard** | `/` | Authenticated + access code |
| **Landing Page** | `/landing` | Public |

---

## 🔑 Key Files

| File | Purpose | Last Updated |
|------|---------|--------------|
| `pages/AuthPage` | Login/signup UI | May 18, 2026 |
| `lib/AuthContext.jsx` | Auth state management | (unchanged) |
| `public/manifest.json` | Web app metadata | May 18, 2026 |
| `index.html` | HTML document | (unchanged) |
| `AUTH_SETUP.md` | Technical guide | May 18, 2026 |
| `DOMAIN_SETUP_GUIDE.md` | Domain config | May 18, 2026 |
| `ARCHITECTURE_DIAGRAM.md` | System diagrams | May 18, 2026 |
| `IMPLEMENTATION_SUMMARY.md` | Action items | May 18, 2026 |
| `README_AUTHENTICATION.md` | Executive summary | May 18, 2026 |

---

## 🚀 Quick Start (5 Steps)

### Step 1: Add Custom Domain
```
Base44 Dashboard → Settings → Custom Domains → Add Domain
Get DNS target (e.g., app-12345.base44.app)
```

### Step 2: Configure DNS
```
Log into domain registrar
Add CNAME record:
  Host: @ or app
  Value: app-12345.base44.app
  TTL: Auto
```

### Step 3: Test Auth
```
Visit https://rallyhub.ie/auth
Create test account
Enter access code
Verify dashboard loads
```

### Step 4: Generate Access Code
```
Login as admin → /admin
Access Codes tab
Generate code
Test with new user
```

### Step 5: Invite Users
```
Admin panel → Invite Users tab
Enter name, email, role
Send invitations
Users can now join
```

---

## 👥 User Management Commands

### View All Users
```
Admin panel → Users & Roles tab
Search by name or email
Click user to view details
```

### Promote to Admin
```
Find user in Users & Roles
Click "Make Admin" button
Confirm action
User now has admin access
```

### Set Password
```
Find user in Users & Roles
Click "Set Password" icon
Enter new password
User can login with new password
```

### Generate Temp Password
```
Find user in Users & Roles
Click temp password icon
Copy temp password
Share with user + access code
```

### Invite New User
```
Admin panel → Invite Users tab
Enter: Name, Email, Role
Select: Admin or User role
Send invitation
User receives email instructions
```

---

## 🔐 Security Checklist

- [ ] HTTPS enabled (padlock icon visible)
- [ ] SSL certificate active
- [ ] Access codes are strong (16+ characters)
- [ ] Admin passwords are unique
- [ ] Temp passwords expire after use
- [ ] User data backed up monthly
- [ ] Admin user list reviewed quarterly

---

## 🐛 Troubleshooting Guide

| Issue | Solution | Ref |
|-------|----------|-----|
| Domain not resolving | Wait 24-48 hours, check DNS records | DOMAIN_SETUP_GUIDE.md |
| SSL certificate not working | Auto-provisioned, may take 5-10 min | DOMAIN_SETUP_GUIDE.md |
| Access code not validating | Check code is active, backend function deployed | AUTH_SETUP.md |
| User can't login | Check account is "Active", try temp password flow | IMPLEMENTATION_SUMMARY.md |
| Base44 branding visible | Verify you're on custom domain, clear cache | README_AUTHENTICATION.md |

---

## 📊 Architecture at a Glance

```
Browser (User)
    ↓
Custom Domain (rallyhub.ie)
    ↓
Auth Pages (/auth, /first-login)
    ↓
Base44 Auth Service (password validation)
    ↓
Access Code Validation (app layer)
    ↓
User Entity (app database)
    ↓
Dashboard (/)
```

---

## 🎯 Admin Responsibilities

**Daily:**
- Monitor new user signups
- Respond to invitations
- Check for login issues

**Weekly:**
- Review user activity
- Update user roles if needed
- Monitor access code usage

**Monthly:**
- Export user data backup
- Review admin account list
- Rotate access codes (optional)

**Quarterly:**
- Full security audit
- Password policy review
- User data retention review

---

## 💡 Common Tasks & Steps

### Add New Admin
```
1. Invite user via email
2. User creates account
3. Admin panel → find user
4. Click "Make Admin"
5. User now has admin access
```

### Reset User Password
```
1. Admin panel → Users & Roles
2. Find user
3. Click "Set Password"
4. Enter new password
5. User can login with new password
```

### Remove Admin Access
```
1. Admin panel → Users & Roles
2. Find admin user
3. Click "Remove Admin"
4. Confirm action
5. User loses admin access
```

### Invite Group of Users
```
1. Create CSV: name, email
2. Admin panel → Invite Users
3. Enter first user details
4. Send invitation
5. Repeat for each user (or implement bulk)
```

---

## 📈 Growth Milestones

| Users | Status | Action |
|-------|--------|--------|
| 0-10 | Setup phase | Configure domain, generate codes |
| 10-50 | Early adopters | Monitor feedback, refine flows |
| 50-100 | Scaling | Optimize DB, consider enhancements |
| 100-500 | Growth | Plan migration if needed |
| 500-1000 | Enterprise | Consider Auth0/Clerk/Supabase |
| 1000+ | Scale | Plan dedicated auth infrastructure |

---

## 🔗 Important Links

**RallyHub:**
- App Auth: `https://rallyhub.ie/auth`
- Admin Panel: `https://rallyhub.ie/admin`
- Dashboard: `https://rallyhub.ie/`

**Base44:**
- Dashboard: https://base44.com/dashboard
- Docs: https://docs.base44.com
- Support: support@base44.com

**Domain Registrar:**
- GoDaddy: https://godaddy.com
- Namecheap: https://namecheap.com
- Cloudflare: https://cloudflare.com

---

## 📋 Monthly Checklist

- [ ] User data exported and backed up
- [ ] No failed logins > 5/day
- [ ] All admin accounts still needed
- [ ] Access codes rotated (if 90+ days old)
- [ ] No security incidents
- [ ] Performance metrics reviewed
- [ ] User feedback collected
- [ ] Documentation updated

---

## 🆘 Emergency Procedures

**User Locked Out:**
1. Admin panel → find user
2. Click "Set Password"
3. Send temporary password
4. User logs in and changes password

**Admin Account Compromised:**
1. Change password immediately
2. Review recent actions
3. Notify Base44 support
4. Consider demoting account

**Access Code Leaked:**
1. Generate new access code
2. Update documentation
3. Notify affected users
4. Invalidate old code (if possible)

---

## 🎓 Knowledge Base

**Need help with:**
- **Domain setup?** → See DOMAIN_SETUP_GUIDE.md
- **Architecture?** → See ARCHITECTURE_DIAGRAM.md
- **Implementation?** → See IMPLEMENTATION_SUMMARY.md
- **Technical details?** → See AUTH_SETUP.md
- **Executive summary?** → See README_AUTHENTICATION.md

---

## ✨ Tips & Tricks

1. **Bulk invites:** Copy-paste multiple emails (one per line)
2. **Strong codes:** Use 20+ character random strings
3. **Password reset:** Direct user to /first-login for fresh start
4. **Backups:** Export user data monthly to external storage
5. **Monitoring:** Check admin panel weekly for anomalies

---

## 🚀 Optimization Ideas

- Add reCAPTCHA to signup form (prevent bots)
- Implement email confirmation for signups
- Add password strength indicator
- Create user onboarding flow
- Add "forgot password" link
- Implement session timeout
- Add login attempt limiting

---

**Last Updated:** May 18, 2026  
**Version:** 1.0  
**Status:** ✅ Production Ready

Keep this handy for quick reference!