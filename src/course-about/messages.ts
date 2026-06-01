import { defineMessages } from '@openedx/frontend-base';

const messages = defineMessages({
  errorMessage: {
    id: 'category.catalog.error-page-message',
    defaultMessage: 'If you experience repeated failures, please email support at {supportEmail}',
    description: 'Error page message.',
  },
  viewAboutPageInStudio: {
    id: 'catalog.course-about.view-about-page-in-studio',
    defaultMessage: 'View About Page in Studio',
    description: 'Link to view the Schedule and Details page in Studio.',
  },
  pageTitle: {
    id: 'courseAbout.page.title',
    defaultMessage: '{courseName} | {siteName}',
    description: 'Document title for the course about page.',
  },
});

export default messages;
