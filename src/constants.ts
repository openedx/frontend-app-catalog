export const appId = 'org.openedx.frontend.app.catalog';
export const catalogRole = 'org.openedx.frontend.role.catalog';

export const ROUTES = {
  HOME: '/',
  COURSES: '/courses',
  COURSE_ABOUT: '/courses/:courseId/about',
  NOT_FOUND: '*',
} as const;

/**
 * Feature policy for iframe, allowing access to courseware-related media.
 * Selected in conference with the edX Security Working Group; changes to
 * it should be vetted by them (security@edx.org).
 */
export const IFRAME_FEATURE_POLICY = (
  'microphone *; camera *; midi *; geolocation *; encrypted-media *; clipboard-write *'
);

export const DEFAULT_VIDEO_MODAL_HEIGHT = 500;
export const DEFAULT_VIDEO_MODAL_WIDTH = 'auto';
export const DEFAULT_VIDEO_MODAL_SIZE = 'lg';

export const DATE_FORMAT_OPTIONS = { month: 'short', day: 'numeric', year: 'numeric' } as const;
