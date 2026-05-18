# app.rallyhub.ie - Subdomain Setup Guide

## What Was Changed

The app now detects when you're accessing via `app.rallyhub.ie` and:
- ✅ **Bypasses the marketing landing page**
- ✅ **Redirects straight to `/auth`** if not logged in
- ✅ **Goes directly to dashboard** if authenticated
- ✅ **Skips access code gate** on localhost for development

---

## DNS Configuration Steps

### Step 1: Add Subdomain in Base44 Dashboard

1. Go to: **Base44 Dashboard → Your App → Settings → Custom Domains**
2. Click **"Add Custom Domain"**
3. Enter: `app.rallyhub.ie`
4. Base44 will provide DNS target (e.g., `app-xxxxx.base44.app`)
5. **Save the DNS target** - you'll need it next

---

### Step 2: Configure DNS Records

Login to your domain registrar (where you manage `rallyhub.ie`):

#### For Root Domain with Subdomain:

Add a CNAME record for the `app` subdomain:

| Type | Name/Host | Value/Target | TTL |
|------|-----------|--------------|-----|
| CNAME | app | `app-xxxxx.base44.app` | Auto |

**Replace `app-xxxxx.base44.app` with the actual target from Base44**

---

### Step 3: DNS Examples by Provider

#### **Cloudflare:**
```
Type: CNAME
Name: app
Target: app-12345.base44.app
Proxy status: Proxied (orange cloud)
TTL: Auto
```

#### **GoDaddy:**
```
Type: CNAME
Host: app
Points to: app-12345.base44.app
TTL: 1 Hour
```

#### **Namecheap:**
```
Type: CNAME Record
Host: app
Value: app-12345.base44.app
TTL: Automatic
```

#### **Google Domains:**
```
Type: CNAME
Name: app
Data: app-12345.base44.app
TTL: 1h
```

---

### Step 4: Wait for DNS Propagation

- **Time:** 5 minutes to 48 hours (typically 15-30 mins)
- **Check Status:** https://dnschecker.org
- **Verify:** `nslookup app.rallyhub.ie` should resolve to Base44 IP
- **Base44 Dashboard:** Shows domain status as "Active"

---

### Step 5: SSL Certificate (Automatic)

- Base44 auto-provisions SSL via Let's Encrypt
- No action required
- Wait 5-10 minutes after DNS propagation
- Verify: Visit `https://app.rallyhub.ie` - padlock icon should appear

---

## Testing

### Once DNS is configured:

1. **Visit:** `https://app.rallyhub.ie`
   - Should redirect to `/auth` immediately
   - No landing page visible

2. **If not authenticated:**
   - Redirects to `https://app.rallyhub.ie/auth`
   - Shows login/signup page

3. **If authenticated:**
   - Goes straight to dashboard
   - Access code gate if first time

4. **Compare with main domain:**
   - `https://rallyhub.ie` → Shows landing page (if not logged in)
   - `https://app.rallyhub.ie` → Goes straight to app

---

## How It Works

### Code Logic:

```javascript
// Detects app subdomain
const isAppSubdomain = window.location.hostname === 'app.rallyhub.ie';

// Bypasses landing page on app subdomain
if (!isAuthenticated && isAppSubdomain) {
  window.location.href = '/auth';
}

// Main domain still shows landing page
if (!isAuthenticated && !isAppSubdomain) {
  return <Landing />;
}
```

---

## Troubleshooting

### Issue: Still seeing landing page on app.rallyhub.ie

**Solutions:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Hard refresh (Ctrl+F5 or Cmd+Shift+R)
3. Check DNS propagation at dnschecker.org
4. Verify CNAME record is correct at registrar

### Issue: DNS not resolving

**Solutions:**
1. Wait 24-48 hours for full propagation
2. Verify CNAME record in DNS settings
3. Flush DNS cache:
   - Mac: `sudo dscacheutil -flushcache`
   - Windows: `ipconfig /flushdns`
4. Check Base44 dashboard shows domain as "Active"

### Issue: SSL certificate error

**Solutions:**
1. Wait 5-10 minutes after DNS propagation
2. Force HTTPS: Visit `https://app.rallyhub.ie` explicitly
3. Base44 auto-provisions SSL - no action needed
4. Contact Base44 support if persists >1 hour

---

## URL Structure Comparison

| Purpose | Main Domain | App Subdomain |
|---------|-------------|---------------|
| **Marketing/Landing** | `rallyhub.ie` | ❌ Not accessible |
| **Auth/Login** | `rallyhub.ie/auth` | `app.rallyhub.ie/auth` |
| **Dashboard** | `rallyhub.ie/` | `app.rallyhub.ie/` |
| **Admin Panel** | `rallyhub.ie/admin` | `app.rallyhub.ie/admin` |
| **Players** | `rallyhub.ie/players` | `app.rallyhub.ie/players` |

---

## Benefits of This Setup

✅ **Clean Separation:**
- Marketing site at `rallyhub.ie`
- App at `app.rallyhub.ie`

✅ **Professional Appearance:**
- Users see dedicated app subdomain
- No confusion between marketing and app

✅ **Better UX:**
- Direct access to app functionality
- No landing page redirect for app users

✅ **Future-Proof:**
- Can add marketing site later at main domain
- App subdomain remains unchanged

---

## Next Steps

1. ✅ Add `app.rallyhub.ie` in Base44 dashboard
2. ✅ Configure CNAME record at domain registrar
3. ✅ Wait for DNS propagation (15-30 mins)
4. ✅ Test at `https://app.rallyhub.ie`
5. ✅ Verify SSL certificate active
6. ✅ Share with users: "Use app.rallyhub.ie for direct app access"

---

## Optional: Redirect Main Domain to App

If you want `rallyhub.ie` to also go straight to app (bypass landing):

**Option 1: Update App.jsx**
- Remove the landing page check entirely
- All unauthenticated users go to `/auth`

**Option 2: DNS Redirect**
- Configure domain registrar to redirect `rallyhub.ie` → `app.rallyhub.ie`
- Keeps landing page accessible via `/landing` route if needed

**Option 3: Keep Current Setup**
- Main domain shows landing page (marketing)
- App subdomain goes straight to app
- **Recommended for now**

---

**Setup Date:** May 18, 2026  
**Status:** ✅ Code Ready - Awaiting DNS Configuration  
**Estimated Setup Time:** 30-60 minutes (including DNS propagation)