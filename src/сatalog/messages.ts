import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  errorMessage: {
    id: 'category.catalog.error-page-message',
    defaultMessage: 'If you experience repeated failures, please email support at {supportEmail}',
    description: 'Error page message',
  },
  noCoursesAvailable: {
    id: 'category.catalog.alert.no-courses-available',
    defaultMessage: 'No courses available',
    description: 'No courses available alert title',
  },
  noCoursesAvailableMessage: {
    id: 'category.catalog.alert.no-courses-available-message',
    defaultMessage: 'There are currently no courses available in the catalog. Please check back later for new offerings.',
    description: 'No courses available alert message',
  },
  totalCoursesHeading: {
    id: 'category.catalog.total-courses-heading',
    defaultMessage: 'Viewing {totalCourses} courses',
    description: 'Total courses heading',
  },
});

export default messages;
