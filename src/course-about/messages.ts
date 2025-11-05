import { defineMessages } from '@edx/frontend-platform/i18n';

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
  noCourseOverview: {
    id: 'catalog.course-about.no-course-overview',
    defaultMessage: 'No course overview added',
    description: 'Message displayed when no course overview is available.',
  },
});

export default messages;
