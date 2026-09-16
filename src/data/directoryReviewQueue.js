// Directory records intentionally NOT imported on 16 September 2026.
// These require a human check because the sources conflict, appear to be aliases/renames,
// share venues, or do not clearly represent a standalone pickleball club/group.

export const directoryReviewQueue = [
  {
    issue: 'Newbridge / Ryston shared-venue ambiguity',
    pickleBookNames: ['Newbridge Pickleball Club', 'RYSTON PICKLEBALL NEWBRIDGE', 'Maria McQuillan'],
    mapNames: ['Ryston Pickleball Club - Newbridge'],
    reason: 'Different organisers/emails are attached to records at the same venue; do not merge or duplicate until checked.'
  },
  {
    issue: 'Dundalk / Oriel naming conflict',
    pickleBookNames: ['Dundalk Pickleball', 'Oriel Pickleball Dundalk', 'Oriel Pickleball'],
    mapNames: [],
    reason: 'Same venue/social footprint but different current names; likely rename or consolidation.'
  },
  {
    issue: 'Killiney / Dalkey structure',
    pickleBookNames: ['Killiney Pickleball', 'Dalkey Pickleball', 'Dalkey Pickleball Club', 'Killiney and Dalkey Pickleball Club'],
    mapNames: ['Killiney Pickleball Club', 'Dalkey Pickleball Club'],
    reason: 'Sources contain both separate clubs and a combined club identity.'
  },
  {
    issue: 'Coillte naming/location conflict',
    pickleBookNames: ['Coillte Pickleballers', 'Coillte Pickleball Club'],
    mapNames: [],
    reason: 'Shared organiser connection but different locations; needs confirmation before deciding whether these are one or two clubs.'
  },
  {
    issue: 'Portmarnock / North Star transition',
    pickleBookNames: ['Portmarnock Pickleball', 'Debbie Brown', 'North Star Pickleball Club'],
    mapNames: ['Portmarnock Pickleball Club'],
    reason: 'PickleBook states North Star replaced Velvet Strand and also contains a separate Portmarnock record; current structure needs checking.'
  },
  {
    issue: 'New Ross conflicting contacts',
    pickleBookNames: ['New Ross Pickleball'],
    mapNames: ['New Ross Pickleball'],
    reason: 'Multiple current rows use the same venue but different primary organisers and email addresses.'
  },
  {
    issue: 'Possible venue-only or non-club records',
    pickleBookNames: ['Aughrim Street Pickleball', 'Luttrellstown Community Centre', 'David LLoyd Riverview', 'Foyle GP REFERRALS', 'F & U n.g.o.- EPAGE', 'Streete sports club', 'Cairdeas Camp', 'Ciorcal na mBan Aughnasheelin', 'Clogh Sliders', 'Green Pickleheads Club', 'Coolmine Pickleheads Club'],
    mapNames: [],
    reason: 'These entries are not clean enough to treat as standalone club identities without a quick manual check.'
  },
  {
    issue: 'Map-only clubs/groups not found as clean current PickleBook records',
    pickleBookNames: [],
    mapNames: ['Cabinteely Pickleball Club', 'Cill Dara Pickleball Club', 'Clew Bay Pickleball Club', 'Darver Pickleball Club', 'Dunlavin Pickleball Club', 'Nenagh Pickleball Club', 'Roslare Pickleball Club'],
    reason: 'Retained for later verification because PickleBook is the primary source of truth for the first import.'
  }
];
