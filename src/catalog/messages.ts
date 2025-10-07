import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  errorMessage: {
    id: 'category.catalog.error-page-message',
    defaultMessage: 'If you experience repeated failures, please email support at {supportEmail}',
    description: 'Error page message.',
  },
  noCoursesAvailable: {
    id: 'category.catalog.alert.no-courses-available',
    defaultMessage: 'No courses available',
    description: 'No courses available alert title.',
  },
  noCoursesAvailableMessage: {
    id: 'category.catalog.alert.no-courses-available-message',
    defaultMessage: 'There are currently no courses available in the catalog. Please check back later for new offerings.',
    description: 'No courses available alert message.',
  },
  searchPlaceholder: {
    id: 'category.catalog.search-placeholder',
    defaultMessage: 'Search for a course',
    description: 'Search placeholder.',
  },
  exploreCourses: {
    id: 'category.catalog.explore-courses',
    defaultMessage: 'Explore courses',
    description: 'Explore courses.',
  },
  noResultsFound: {
    id: 'category.catalog.no-results-found',
    defaultMessage: 'No results found',
    description: 'No results found.',
  },
});

export default messages;
