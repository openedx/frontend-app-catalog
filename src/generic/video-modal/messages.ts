import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
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
