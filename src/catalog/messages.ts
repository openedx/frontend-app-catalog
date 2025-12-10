import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  pageTitle: {
    id: 'category.catalog.page-title',
    defaultMessage: 'Courses',
    description: 'Catalog page title.',
  },
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
  searchResults: {
    id: 'category.catalog.search-results',
    defaultMessage: 'Search results for "{query}"',
    description: 'Search results heading.',
  },
  noSearchResults: {
    id: 'category.catalog.no-search-results',
    defaultMessage: 'We couldn\'t find any results for "{query}"',
    description: 'No search results.',
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
  organizations: {
    id: 'category.catalog.filter.organizations',
    defaultMessage: 'Organizations',
    description: 'Organizations filter.',
  },
  languages: {
    id: 'category.catalog.filter.languages',
    defaultMessage: 'Languages',
    description: 'Languages filter.',
  },
  courseTypes: {
    id: 'category.catalog.filter.course-types',
    defaultMessage: 'Course types',
    description: 'Course types filter.',
  },
});

export default messages;
