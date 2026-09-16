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
    spondUrl: 'https://spond.com/invite/CRZPX',
    shopUrl: 'https://borusports.ie/product-category/club-shop/clare-pickleball/',
    description: 'A welcoming, members-only pickleball club with indoor sessions across County Clare. Experienced visiting players can contact the club about guest availability.',
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
  }
];

export const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function getClub(slug) {
  return directoryClubs.find(club => club.slug === slug);
}
