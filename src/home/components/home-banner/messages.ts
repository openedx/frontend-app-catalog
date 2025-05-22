import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  title: {
    id: 'catalog.home-page.title',
    defaultMessage: 'Welcome to {siteName}',
    description: 'Main heading text displayed at the banner of the home page.',
  },
  subtitle: {
    id: 'catalog.home-page.subtitle',
    defaultMessage: 'It works! Powered by the Open edX® Platform',
    description: 'Secondary text displayed below the main heading on the home page.',
  },
  searchPlaceholder: {
    id: 'catalog.home-page.search-placeholder',
    defaultMessage: 'Search for a course',
    description: 'Placeholder text inside the course search input field.',
  },
  videoButton: {
    id: 'catalog.home-page.video-button',
    defaultMessage: 'View promo video',
    description: 'Label for the button that opens the promotional video modal.',
  },
  videoButtonAlt: {
    id: 'catalog.home-page.video-button-alt',
    defaultMessage: 'search button',
    description: 'Alternative text for the promo video button (for screen readers).',
  },
  videoModalTitle: {
    id: 'catalog.home-page.video-modal-title',
    defaultMessage: 'Video modal',
    description: 'Title text displayed inside the modal when the promo video is opened.',
  },
  videoIframeTitle: {
    id: 'catalog.home-page.video-button',
    defaultMessage: 'YouTube Video title',
    description: 'Title attribute for the embedded YouTube iframe (used for accessibility).',
  },
});

export default messages;
