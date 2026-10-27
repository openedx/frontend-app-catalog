import { defineMessages } from '@openedx/frontend-base';

const messages = defineMessages({
  errorMessage: {
    id: 'category.catalog.error-page-message',
    defaultMessage: 'If you experience repeated failures, please email support at {supportEmail}',
    description: 'Error page message.',
  },
  noItemsAvailable: {
    id: 'category.catalog.alert.no-items-available',
    defaultMessage: 'No items available',
    description: 'No items available alert title.',
  },
  noItemsAvailableMessage: {
    id: 'category.catalog.alert.no-items-available-message',
    defaultMessage: 'There are currently no items available in the catalog. Please check back later for new offerings.',
    description: 'No items available alert message.',
  },
  viewAllCoursesButton: {
    id: 'category.catalog.home-page.view-courses-button',
    defaultMessage: 'View all courses',
    description: 'Label for the button that redirect to courses page.',
  },
});

export default messages;
