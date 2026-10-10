// Single approved source for public social link previews and platform message positioning.
// Search descriptions can remain page-specific. Keep WhatsApp/Facebook card copy here.
export const RALLYHUB_SHARE = Object.freeze({
  home: Object.freeze({ title: 'RallyHub | Your Next Game Starts Here.', description: "Discover where to play, find your next event and connect with Ireland's growing pickleball community. Running a club? Get discovered, grow your membership and deliver better tournaments." }),
  directory: Object.freeze({ title: 'Find Your Pickleball Club in Ireland | RallyHub', description: 'Find your place to play. Explore pickleball clubs, venues and sessions across Ireland — and connect with your local community on RallyHub.' }),
  directoryHelp: Object.freeze({ title: 'Get Your Club on the Map | RallyHub Directory Help', description: 'Your free club listing is ready to manage. Find out how to claim your listing, update playing details and help more pickleball players discover your club.' }),
  directoryQuickStart: Object.freeze({ title: 'Get Started with Your Club Listing | RallyHub', description: 'Follow the RallyHub Directory quick-start guide to claim your club listing, add sessions and help more players find you.' }),
  directoryStory: Object.freeze({ title: 'Help More Players Find Your Club | RallyHub', description: 'Discover how RallyHub connects pickleball players with local clubs, venues and sessions across Ireland.' }),
  directoryAdd: Object.freeze({ title: 'Put Your Pickleball Club on the Map | RallyHub', description: 'Add or update your free pickleball club listing. Help players discover your club, find sessions and get involved.' }),
  about: Object.freeze({ title: 'Meet RallyHub | Bringing Pickleball People Together', description: 'Discover the story behind RallyHub and how we help players find their game and clubs create stronger communities.' }),
  contact: Object.freeze({ title: 'Get in Touch with RallyHub', description: 'Have a question, club update or idea? Contact RallyHub and help us build a better experience for Ireland’s pickleball community.' }),
  events: Object.freeze({ title: 'Discover Your Next Pickleball Event | RallyHub', description: 'Find pickleball events, competitions, tournaments and coaching opportunities across Ireland. Your next game starts here.' }),
});

export function rallyhubShareForPath(path) {
  const clean = String(path || '/').split('?')[0].replace(/\/$/, '') || '/';
  const routes = {
    '/': 'home', '/directory': 'directory', '/directory/help': 'directoryHelp',
    '/directory/quick-start': 'directoryQuickStart', '/directory/story': 'directoryStory',
    '/directory/add': 'directoryAdd', '/about': 'about', '/contact': 'contact', '/events': 'events',
  };
  return RALLYHUB_SHARE[routes[clean]] || null;
}
