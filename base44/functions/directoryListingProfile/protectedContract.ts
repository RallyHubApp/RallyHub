const BLOCKED_CONTACT_KEYS = new Set([
  'phone','phonehref','telephone','mobile','mobilenumber','email','emailaddress','whatsapp','whatsappurl','whatsapp_url',
  'contactphone','contact_phone','contactemail','contact_email','publiccontactemail','public_contact_email'
]);

function cloneAndStrip(value:any):any {
  if (Array.isArray(value)) return value.map(cloneAndStrip);
  if (!value || typeof value !== 'object') return value;
  const out:any = {};
  for (const [key, child] of Object.entries(value)) {
    const normalised = String(key).replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
    if (BLOCKED_CONTACT_KEYS.has(normalised)) continue;
    out[key] = cloneAndStrip(child);
  }
  return out;
}

export function protectedDirectoryValue(value:any) {
  if (!value || typeof value !== 'object') return value ?? null;
  const out = cloneAndStrip(value);
  if (out.contact && typeof out.contact === 'object') {
    out.contact = {
      ...(out.contact.name ? { name:String(out.contact.name).slice(0,180) } : {}),
      ...(out.contact.role ? { role:String(out.contact.role).slice(0,120) } : {}),
      protected:true,
    };
  }
  return out;
}

export function protectedDirectoryState(state:any) {
  if (!state || typeof state !== 'object') return state ?? null;
  return {
    ...state,
    base:protectedDirectoryValue(state.base),
    profile:protectedDirectoryValue(state.profile),
  };
}

export function protectedDirectoryList(listings:any) {
  const out:any = {};
  for (const [slug,state] of Object.entries(listings || {})) out[slug] = protectedDirectoryState(state);
  return out;
}
