const hasText = value => String(value || '').trim().length > 0;
const hasUsableDescription = value => {
  const text = String(value || '').trim();
  if (text.length < 30) return false;
  return !/is setting up a .* listing on rallyhub/i.test(text);
};
const hasContact = profile => hasText(profile?.contact?.email) || hasText(profile?.contact?.phone) || hasText(profile?.website);
const venueReady = venue => hasText(venue?.name) && (hasText(venue?.address) || hasText(venue?.eircode) || (Number.isFinite(Number(venue?.latitude)) && Number.isFinite(Number(venue?.longitude))));
const sessionReady = session => hasText(session?.day) && hasText(session?.start) && hasText(session?.venueId);
const eventStarted = event => hasText(event?.name) && hasText(event?.start_date);
const eventPublished = event => event?.event_publish_status === 'published' && event?.event_public_visible === true;

export const DIRECTORY_SETUP_BLUEPRINTS = {
  club: {
    noun: 'club',
    intro: 'We’ve already started your RallyHub club listing. Check what we found, fill any gaps, then review it before you finish.',
    steps: ['basics','contact','venues','sessions','review'],
  },
  holidays: {
    noun: 'holiday provider',
    intro: 'We’ve already started your RallyHub listing and event setup. Most of the work should be checking what is already there, not typing it again.',
    steps: ['basics','contact','location','events','review'],
  },
  tournaments_events: {
    noun: 'event organiser',
    intro: 'We’ve already started your organiser listing. Check the details we found, finish your event, then preview and publish.',
    steps: ['basics','contact','location','events','review'],
  },
  coach: {
    noun: 'coach',
    intro: 'We’ve already prepared your coaching profile. Check your photograph, biography, qualifications, coaching services and where you teach, then preview and save. Adding a clinic or event is optional.',
    steps: ['basics','photograph','contact','location','events','review'],
    eventOptional: true,
  },
  coaching: {
    noun: 'coach or coaching provider',
    intro: 'We’ve already started your RallyHub coaching listing. Check the details we found and add a clinic or event when it is useful.',
    steps: ['basics','contact','location','events','review'],
    eventOptional: true,
  },
  equipment: {
    noun: 'supplier',
    intro: 'We’ve already started your RallyHub supplier listing. Check your details, contact links and public preview before publishing.',
    steps: ['basics','contact','review'],
  },
  other: {
    noun: 'provider',
    intro: 'We’ve already started your RallyHub listing. Check what is already there, fill any gaps and publish when you are happy.',
    steps: ['basics','contact','location','events','review'],
    eventOptional: true,
  },
};

const STEP_LABELS = {
  identity: { club:'Confirm club name', default:'Confirm public name' },
  basics: { club:'Club details', default:'About you' },
  photograph: { coach:'Your coaching photograph', default:'Photograph or logo' },
  contact: { club:'Contact information', coach:'Confirm contact details', coaching:'Confirm contact details', default:'Contact & social' },
  location: { default:'Where you operate' },
  venues: { default:'Playing venues' },
  sessions: { default:'Regular sessions' },
  events: { holidays:'Your holiday event', tournaments_events:'Your event', coach:'Clinic or event (optional)', coaching:'Clinic or event (optional)', default:'Your event' },
  review: { default:'Preview & publish' },
};

export function setupStepLabel(listingType, id) {
  return STEP_LABELS[id]?.[listingType] || STEP_LABELS[id]?.default || id;
}

/** @param {{listingType?: string, profile?: {name?: string,description?: string, contact?: {email?: string,phone?:string},website?: string, serviceArea?: string,venues?: any[],sessions?: any[]},events?: any[],visibility?: string,setup?: {identity?: {requiresConfirmation?:boolean,confirmed?:boolean,candidates?:any[],selectedPublicName?:string}}}} [options] */
export function buildDirectorySetupProgress({ listingType='club', profile={}, events=[], visibility='public', setup={} }={}) {
  const blueprint = DIRECTORY_SETUP_BLUEPRINTS[listingType] || DIRECTORY_SETUP_BLUEPRINTS.other;
  const identity = setup?.identity || {};
  const identityRelevant = identity?.requiresConfirmation === true || identity?.confirmed === true || (Array.isArray(identity?.candidates) && identity.candidates.length > 0);
  const startedEvents = (events || []).filter(eventStarted);
  const publishedEvents = startedEvents.filter(eventPublished);
  const firstEvent = startedEvents[0] || null;
  const eventRequired = !blueprint.eventOptional && blueprint.steps.includes('events');
  const states = {
    identity: {
      complete: identity?.confirmed === true || identity?.requiresConfirmation !== true,
      detail: identity?.confirmed === true
        ? `Players will see ${identity?.selectedPublicName || profile?.name || 'your chosen public name'}`
        : 'We found more than one name connected with you — choose which one players should see',
    },
    basics: {
      complete: hasText(profile?.name) && hasUsableDescription(profile?.description),
      detail: hasText(profile?.name) && hasUsableDescription(profile?.description) ? 'Already filled' : 'Check your name and short description',
    },
    photograph: {
      complete: hasText(profile?.photoUrl),
      detail: hasText(profile?.photoUrl) ? 'Photograph uploaded — you can adjust its framing' : 'Upload and frame your coaching photograph',
    },
    contact: {
      complete: hasContact(profile),
      detail: hasContact(profile) ? 'Contact details already added' : 'Add at least one way for players to contact or find you',
    },
    location: {
      complete: hasText(profile?.serviceArea),
      detail: hasText(profile?.serviceArea) ? 'Area or destination already added' : 'Tell players where you operate',
    },
    venues: {
      complete: (profile?.venues || []).some(venueReady),
      detail: (profile?.venues || []).some(venueReady) ? 'At least one playing venue is ready' : 'Check or add your main playing venue',
    },
    sessions: {
      complete: (profile?.sessions || []).some(sessionReady),
      detail: (profile?.sessions || []).some(sessionReady) ? 'Regular play is already listed' : 'Check your regular playing sessions',
    },
    events: {
      complete: eventRequired ? publishedEvents.length > 0 : true,
      started: startedEvents.length > 0,
      optional: !!blueprint.eventOptional,
      event: firstEvent,
      detail: startedEvents.length > 0
        ? (publishedEvents.length > 0 ? 'Your event is live' : 'We’ve already started this — check the details')
        : (blueprint.eventOptional ? 'Optional — add one when useful' : 'Add the event you want players to see'),
    },
    review: {
      complete: visibility === 'public' && (!eventRequired || publishedEvents.length > 0),
      detail: visibility === 'public' ? 'Public listing ready' : 'Preview everything, then publish',
    },
  };
  const stepIds = identityRelevant ? ['identity', ...blueprint.steps] : blueprint.steps;
  const requiredBeforeReview = stepIds.filter(id => id !== 'review' && !states[id]?.optional);
  states.review.complete = visibility === 'public' && requiredBeforeReview.every(id => states[id]?.complete);
  states.review.detail = states.review.complete ? 'Public listing ready' : (visibility === 'public' ? 'Review the items still needing attention' : 'Preview everything, then publish');

  const steps = stepIds.map((id, index) => ({
    id,
    index,
    label: setupStepLabel(listingType, id),
    ...states[id],
  }));
  const actionable = steps.filter(step => !step.complete && !step.optional);
  const firstIncomplete = actionable[0] || steps.find(step => step.id === 'review') || steps[steps.length - 1];
  const completedCount = steps.filter(step => step.complete).length;
  return { blueprint, steps, firstIncomplete, completedCount, totalCount:steps.length, firstEvent };
}
