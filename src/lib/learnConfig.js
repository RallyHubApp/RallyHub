export const LEARN_RESOURCE_TYPES = [
  ['all', 'All types'],
  ['video', 'Videos'],
  ['guide', 'Guides & visuals'],
  ['document', 'Documents'],
  ['coaching', 'Coaching'],
  ['policy', 'Rules & policies'],
  ['link', 'Useful links'],
  ['other', 'Other'],
];

export const LEARN_STARTER_CATEGORIES = [
  ['Start Here', 'Quick orientation and the most useful resources for getting started.', 'sparkles'],
  ['Pickleball Basics', 'Core pickleball knowledge for newer players and useful refreshers for everyone.', 'book-open'],
  ['Skills & Coaching', 'Technique, drills, coaching videos and practical skill development.', 'target'],
  ['Game Formats', 'How to run and play club formats such as King of the Court and other session formats.', 'layout-grid'],
  ['Rules & Officiating', 'Official rules, rule summaries and practical officiating guidance.', 'scroll-text'],
  ['DUPR & Ratings', 'Help with DUPR, ratings and keeping your player profile up to date.', 'bar-chart'],
  ['Club Information', 'Useful club information, links and member resources.', 'info'],
];

export function resourceTypeLabel(type) {
  return LEARN_RESOURCE_TYPES.find(([value]) => value === type)?.[1] || 'Resource';
}
