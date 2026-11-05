import messages from './messages';

/** Number of courses and credentials shown before a list is expanded. */
export const INITIAL_VISIBLE_COUNT = 6;

/** Section tabs of the pathway detail page, in display order. */
export const SECTION_NAV_ITEMS = [
  { id: 'about', message: messages.aboutNavLink },
  { id: 'credentials', message: messages.credentialsNavLink },
];
