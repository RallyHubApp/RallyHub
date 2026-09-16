export const directoryClubs = [
  {
    id: 'clare-pickleball',
    slug: 'clare-pickleball',
    name: 'Clare Pickleball',
    sport: 'Pickleball',
    county: 'Clare',
    region: 'Munster',
    founded: 'May 2025',
    status: 'active',
    membershipStatus: 'Full – waiting list open',
    affiliation: 'Pickleball Ireland',
    logoUrl: 'https://clarepickleball.ie/wp-content/uploads/2025/06/491439977_17843980809473841_8409446969161026129_n-removebg-preview.png',
    website: 'https://clarepickleball.ie/',
    instagram: 'https://www.instagram.com/clarepickleball',
    facebook: 'https://www.facebook.com/profile.php?id=61576112630693',
    waitingListUrl: 'https://forms.gle/gWYZHHLBeUwyU3u17',
    joiningCtaLabel: 'Join waiting list',
    policyLabel: 'Guest policy',
    shopUrl: 'https://borusports.ie/product-category/club-shop/clare-pickleball/',
    description: 'A welcoming, members-only pickleball club with indoor sessions across County Clare.',
    guestPolicy: 'Experienced pickleball players from other clubs or visiting from abroad are most welcome. No beginner walk-in sessions.',
    contact: {
      name: 'Brian Moore',
      phone: '087 810 0333',
      phoneHref: 'tel:+353878100333',
      whatsapp: 'https://wa.me/353878100333',
      email: 'info@clarepickleball.ie'
    },
    venues: [
      {
        id: 'doora-barefield',
        name: "St Joseph's Doora Barefield GAA Sports Hall",
        shortName: 'Doora Barefield',
        address: "Gurteen, Quin Road, Co. Clare",
        eircode: 'V95 PD36',
        indoor: true,
        courts: 4,
        latitude: 52.8426,
        longitude: -8.9282,
        mapUrl: 'https://maps.google.com/?q=V95+PD36'
      },
      {
        id: 'corofin',
        name: 'Corofin GAA Sports Hall',
        shortName: 'Corofin',
        address: 'Corofin, Co. Clare',
        eircode: 'V95 XD56',
        indoor: true,
        courts: 3,
        latitude: 52.9442,
        longitude: -9.0646,
        mapUrl: 'https://maps.google.com/?q=V95+XD56'
      },
      {
        id: 'ennistymon',
        name: 'Ennistymon Community Centre',
        shortName: 'Ennistymon',
        address: 'Parliament Street, Ennistymon, Co. Clare',
        eircode: 'V95 X8XC',
        indoor: true,
        courts: 3,
        latitude: 52.9394,
        longitude: -9.2922,
        mapUrl: 'https://maps.app.goo.gl/xgPBCUfrBp35vu116'
      }
    ],
    sessions: [
      { id: 'db-mon-social', venueId: 'doora-barefield', day: 'Monday', start: '19:00', end: '20:30', level: 'Social & Recreational', price: 5.50 },
      { id: 'db-mon-advanced', venueId: 'doora-barefield', day: 'Monday', start: '20:30', end: '22:00', level: 'Improver & Advanced', price: 5.50 },
      { id: 'db-thu-social', venueId: 'doora-barefield', day: 'Thursday', start: '19:00', end: '20:30', level: 'Social & Recreational', price: 5.50 },
      { id: 'db-thu-advanced', venueId: 'doora-barefield', day: 'Thursday', start: '20:30', end: '22:00', level: 'Improver & Advanced', price: 5.50 },
      { id: 'ennistymon-1', venueId: 'ennistymon', day: 'Wednesday', start: '19:00', end: '20:00', level: 'Club Session', price: null },
      { id: 'ennistymon-2', venueId: 'ennistymon', day: 'Wednesday', start: '20:00', end: '21:00', level: 'Club Session', price: null }
    ]
  },
  {
    id: 'galway-pickleball',
    slug: 'galway-pickleball',
    name: 'Galway Pickleball',
    sport: 'Pickleball',
    county: 'Galway',
    region: 'Connacht',
    founded: '2020',
    status: 'active',
    membershipStatus: 'Beginners welcome – enquire with the club',
    affiliation: 'Pickleball Ireland',
    logoUrl: 'https://galwaypickleball.ie/wp-content/uploads/2025/05/clear-backrownd-logo--300x265.png',
    website: 'https://galwaypickleball.ie/',
    instagram: 'https://www.instagram.com/galwaypickleballclub/',
    facebook: 'https://www.facebook.com/profile.php?id=100087218320545',
    waitingListUrl: 'https://galwaypickleball.ie/',
    joiningCtaLabel: 'Request information',
    policyLabel: 'Joining Galway Pickleball',
    waiverUrl: 'https://forms.gle/FgtRwX2ih4NKyWYn9',
    description: 'An inclusive and friendly pickleball club founded in 2020, with more than 400 active members and sessions across Galway City and County Galway.',
    guestPolicy: 'Beginners are welcome. Complete the club enquiry form and Galway Pickleball will help you choose the appropriate session.',
    scheduleUpdatedAt: '31 August 2026',
    levelGuide: [
      { name: 'Primary/Beginners', description: 'For new players, people learning the basics, or anyone who prefers a relaxed pace. The focus is on fun, learning and improving skills.' },
      { name: 'Mixed', description: 'Open to all players, including beginners and players with slower mobility. Stronger players adjust their play to keep games inclusive and enjoyable.' },
      { name: 'Intermediate', description: 'For confident players comfortable with faster games, harder shots, power and spin.' },
      { name: 'Intermediate-Advanced', description: 'For experienced players who enjoy high-intensity, fast-paced and competitive play.' }
    ],
    contact: {
      name: 'Teo Cuiche',
      phone: '085 162 8988',
      phoneHref: 'tel:+353851628988',
      whatsapp: 'https://wa.me/353851628988',
      email: 'galwaypickleball@gmail.com'
    },
    venues: [
      { id: 'arus', name: 'Árus Bóthar na Trá', shortName: 'Árus', address: 'Salthill Knocknacarra GAA Club, Dr Mannix Road, Salthill, Galway', eircode: 'H91 T0F6', indoor: true, courts: null, latitude: 53.2586, longitude: -9.0855, mapUrl: 'https://maps.google.com/?q=H91+T0F6' },
      { id: 'maree', name: 'Maree Community Centre', shortName: 'Maree', address: 'Garraun Upper, Gurrane Lower, Co. Galway', eircode: 'H91 V12C', indoor: true, courts: null, latitude: 53.2350, longitude: -8.9910, mapUrl: 'https://maps.google.com/?q=H91+V12C' },
      { id: 'renmore', name: 'Renmore Community Centre', shortName: 'Renmore', address: 'Renmore Avenue, Renmore, Galway', eircode: 'H91 W259', indoor: true, courts: null, latitude: 53.2794, longitude: -9.0188, mapUrl: 'https://maps.google.com/?q=H91+W259' },
      { id: 'oranmore', name: 'Oranmore Community Centre', shortName: 'Oranmore', address: 'Dublin Road, Frenchfort, Oranmore, Co. Galway', eircode: 'H91 AV2D', indoor: true, courts: null, latitude: 53.2668, longitude: -8.9298, mapUrl: 'https://maps.google.com/?q=H91+AV2D' },
      { id: 'knocknacarra', name: 'Knocknacarra Community Centre', shortName: 'Knocknacarra', address: 'Cappagh Road, Galway', eircode: 'H91 R6PW', indoor: true, courts: null, latitude: 53.2607, longitude: -9.1110, mapUrl: 'https://maps.google.com/?q=H91+R6PW' },
      { id: 'mervue', name: 'Mervue Community Centre', shortName: 'Mervue', address: 'Michael Collins Road, Mervue, Galway', eircode: 'H91 C2F3', indoor: true, courts: null, latitude: 53.2841, longitude: -9.0175, mapUrl: 'https://maps.google.com/?q=H91+C2F3' },
      { id: 'westside', name: 'Westside Community Centre', shortName: 'Westside', address: 'Seamus Quirke Road, Galway', eircode: 'H91 R853', indoor: true, courts: null, latitude: 53.2748, longitude: -9.0757, mapUrl: 'https://maps.google.com/?q=H91+R853' },
      { id: 'dome', name: 'Salerno Sports Dome', shortName: 'Dome', address: 'Salerno, Threadneedle Road, Salthill, Galway', eircode: 'H91 D9H3', indoor: true, courts: null, latitude: 53.2596, longitude: -9.0869, mapUrl: 'https://maps.google.com/?q=H91+D9H3' },
      { id: 'oughterard', name: 'Oughterard Community Centre', shortName: 'Oughterard', address: 'Oughterard, Co. Galway', eircode: 'H91 XA8R', indoor: true, courts: null, latitude: 53.4283, longitude: -9.3194, mapUrl: 'https://maps.google.com/?q=H91+XA8R' }
    ],
    sessions: [
      { id: 'g-mon-renmore-1300', venueId: 'renmore', day: 'Monday', start: '13:00', end: null, level: 'Intermediate', price: null },
      { id: 'g-mon-knocknacarra-1830', venueId: 'knocknacarra', day: 'Monday', start: '18:30', end: null, level: 'Mixed', price: null },
      { id: 'g-mon-knocknacarra-1930', venueId: 'knocknacarra', day: 'Monday', start: '19:30', end: null, level: 'Intermediate', price: null },
      { id: 'g-mon-dome-2000', venueId: 'dome', day: 'Monday', start: '20:00', end: null, level: 'Mixed', price: null },
      { id: 'g-mon-oughterard-2030', venueId: 'oughterard', day: 'Monday', start: '20:30', end: null, level: 'Mixed · Fixed partners', price: null },
      { id: 'g-tue-mervue-1000', venueId: 'mervue', day: 'Tuesday', start: '10:00', end: null, level: 'Mixed', price: null },
      { id: 'g-tue-oranmore-1000', venueId: 'oranmore', day: 'Tuesday', start: '10:00', end: null, level: 'Mixed', price: null },
      { id: 'g-tue-oranmore-1130', venueId: 'oranmore', day: 'Tuesday', start: '11:30', end: null, level: 'Beginners & Intermediate', price: null },
      { id: 'g-tue-renmore-1900', venueId: 'renmore', day: 'Tuesday', start: '19:00', end: null, level: 'Mixed', price: null },
      { id: 'g-tue-mervue-1900', venueId: 'mervue', day: 'Tuesday', start: '19:00', end: '21:00', level: 'Advanced · 2-hour session', price: null },
      { id: 'g-wed-westside-1000', venueId: 'westside', day: 'Wednesday', start: '10:00', end: null, level: 'Mixed & Beginners', price: null },
      { id: 'g-wed-mervue-1000', venueId: 'mervue', day: 'Wednesday', start: '10:00', end: null, level: 'Mixed & Beginners', price: null },
      { id: 'g-wed-westside-1100', venueId: 'westside', day: 'Wednesday', start: '11:00', end: null, level: 'Intermediate', price: null },
      { id: 'g-wed-oughterard-1830', venueId: 'oughterard', day: 'Wednesday', start: '18:30', end: null, level: 'Mixed & Beginners', price: null },
      { id: 'g-wed-mervue-1900', venueId: 'mervue', day: 'Wednesday', start: '19:00', end: '21:00', level: 'Intermediate · Fixed partners · 2-hour session', price: null },
      { id: 'g-wed-arus-2000', venueId: 'arus', day: 'Wednesday', start: '20:00', end: null, level: 'Beginners', price: null },
      { id: 'g-wed-dome-2030', venueId: 'dome', day: 'Wednesday', start: '20:30', end: null, level: 'Mixed', price: null },
      { id: 'g-wed-arus-2100', venueId: 'arus', day: 'Wednesday', start: '21:00', end: null, level: 'Beginners', price: null },
      { id: 'g-thu-westside-1230', venueId: 'westside', day: 'Thursday', start: '12:30', end: null, level: 'Intermediate', price: null },
      { id: 'g-thu-mervue-1300', venueId: 'mervue', day: 'Thursday', start: '13:00', end: null, level: 'Mixed & Beginners', price: null },
      { id: 'g-thu-mervue-1900', venueId: 'mervue', day: 'Thursday', start: '19:00', end: '21:00', level: 'Advanced · 2-hour session', price: null },
      { id: 'g-thu-renmore-2030', venueId: 'renmore', day: 'Thursday', start: '20:30', end: null, level: 'Mixed', price: null },
      { id: 'g-fri-maree-1000', venueId: 'maree', day: 'Friday', start: '10:00', end: null, level: 'Mixed', price: null },
      { id: 'g-fri-maree-1130', venueId: 'maree', day: 'Friday', start: '11:30', end: null, level: 'Intermediate', price: null },
      { id: 'g-fri-dome-1830', venueId: 'dome', day: 'Friday', start: '18:30', end: null, level: 'Mixed', price: null },
      { id: 'g-sat-renmore-1030', venueId: 'renmore', day: 'Saturday', start: '10:30', end: null, level: 'Beginners', price: null },
      { id: 'g-sat-renmore-1200', venueId: 'renmore', day: 'Saturday', start: '12:00', end: null, level: 'Mixed', price: null },
      { id: 'g-sun-westside-1030', venueId: 'westside', day: 'Sunday', start: '10:30', end: null, level: 'Singles · Mixed', price: null },
      { id: 'g-sun-dome-1200', venueId: 'dome', day: 'Sunday', start: '12:00', end: null, level: 'Mixed', price: null },
      { id: 'g-sun-dome-1300', venueId: 'dome', day: 'Sunday', start: '13:00', end: null, level: 'Intermediate', price: null }
    ]
  },
  {
    id: 'galway-county-pickleball',
    slug: 'galway-county-pickleball',
    name: 'Galway County Pickleball Club',
    sport: 'Pickleball',
    county: 'Galway',
    region: 'Connacht',
    founded: null,
    status: 'active',
    membershipStatus: 'Contact the club before attending',
    affiliation: 'Pickleball Ireland',
    logoUrl: '/galway-county-pickleball.svg',
    website: null,
    instagram: null,
    facebook: 'https://www.facebook.com/profile.php?id=100090662990217',
    waitingListUrl: null,
    joiningCtaLabel: 'Contact club',
    policyLabel: 'Attendance information',
    description: 'A community pickleball club with more than 150 members and weekly sessions across County Galway.',
    guestPolicy: 'Session availability and suitability vary by venue. Contact the club before attending your first session.',
    scheduleUpdatedAt: '6 September 2026',
    contact: {
      name: 'Caitrina Lawless',
      phone: '086 234 0632',
      phoneHref: 'tel:+353862340632',
      whatsapp: 'https://wa.me/353862340632',
      email: 'galwaycountypickleball@gmail.com'
    },
    venues: [
      { id: 'eyrecourt', name: 'Eyrecourt Hall & Event Centre', shortName: 'Eyrecourt', alternativeNames: ['Eyrecourt Community Centre', 'Eyrecourt Parish Hall'], address: 'The Mall, Eyrecourt, Co. Galway', eircode: 'H53 DY84', indoor: true, courts: null, latitude: 53.1974, longitude: -8.1327, mapUrl: 'https://maps.google.com/?q=H53+DY84', websiteUrl: 'https://www.eyrecourt.com/about-4' },
      { id: 'kilcornan', name: 'Kilcornan Leisure Complex', shortName: 'Kilcornan', address: 'Kilcornan, Clarinbridge, Co. Galway', eircode: 'H91 K2E9', indoor: true, courts: null, latitude: 53.2143, longitude: -8.8664, mapUrl: 'https://maps.google.com/?q=H91+K2E9', websiteUrl: 'https://kilcornanleisurecomplex.com/' },
      { id: 'loughrea', name: 'Temperance Hall', shortName: 'Loughrea', address: 'Barrack Street, Loughrea, Co. Galway', eircode: 'H62 XY20', indoor: true, courts: null, latitude: 53.197481, longitude: -8.568638, mapUrl: 'https://maps.google.com/?q=53.197481,-8.568638', websiteUrl: 'https://galwayaa.com/loughrea-temperance-hall/' },
      { id: 'maree', name: 'Maree Community Centre', shortName: 'Maree', address: 'Garraun Upper, Co. Galway', eircode: 'H91 V12C', indoor: true, courts: 3, playType: 'Pay to play', latitude: 53.2350, longitude: -8.9910, mapUrl: 'https://maps.google.com/?q=H91+V12C' },
      { id: 'gort', name: 'Gort Community Centre', shortName: 'Gort', address: 'Ennis Road, Lavally, Gort, Co. Galway', eircode: 'H91 K7YA', indoor: true, courts: null, latitude: 53.0669, longitude: -8.8188, mapUrl: 'https://maps.google.com/?q=H91+K7YA', websiteUrl: 'https://gortcommunitycentre.wixsite.com/website' }
    ],
    sessions: [
      { id: 'gc-mon-eyrecourt-2000', venueId: 'eyrecourt', day: 'Monday', start: '20:00', end: null, level: 'Club Session', price: null },
      { id: 'gc-mon-kilcornan-1900', venueId: 'kilcornan', day: 'Monday', start: '19:00', end: null, level: 'Club Session', price: null },
      { id: 'gc-tue-loughrea-1700', venueId: 'loughrea', day: 'Tuesday', start: '17:00', end: null, level: 'Club Session', price: null },
      { id: 'gc-tue-kilcornan-1900', venueId: 'kilcornan', day: 'Tuesday', start: '19:00', end: null, level: 'Club Session', price: null },
      { id: 'gc-wed-loughrea-1830', venueId: 'loughrea', day: 'Wednesday', start: '18:30', end: null, level: 'Club Session', price: null },
      { id: 'gc-thu-kilcornan-1900', venueId: 'kilcornan', day: 'Thursday', start: '19:00', end: null, level: 'Club Session', price: null },
      { id: 'gc-fri-kilcornan-1800', venueId: 'kilcornan', day: 'Friday', start: '18:00', end: null, level: 'Club Session', price: null },
      { id: 'gc-sat-maree-1600', venueId: 'maree', day: 'Saturday', start: '16:00', end: null, level: 'Club Session', price: null },
      { id: 'gc-sun-kilcornan-1100', venueId: 'kilcornan', day: 'Sunday', start: '11:00', end: null, level: 'Club Session', price: null }
    ]
  }
];

export const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function getClub(slug) {
  return directoryClubs.find(club => club.slug === slug);
}
