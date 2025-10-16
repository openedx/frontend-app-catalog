import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  courseNumber: {
    id: 'catalog.course-about.sidebar-details.course-number',
    defaultMessage: 'Course number',
    description: 'Course number label.',
  },
  classesStart: {
    id: 'catalog.course-about.sidebar-details.classes-start',
    defaultMessage: 'Classes start',
    description: 'Classes start label.',
  },
  classesEnd: {
    id: 'catalog.course-about.sidebar-details.classes-end',
    defaultMessage: 'Classes end',
    description: 'Classes end label.',
  },
  estimatedEffort: {
    id: 'catalog.course-about.sidebar-details.estimated-effort',
    defaultMessage: 'Estimated effort',
    description: 'Estimated effort label.',
  },
  price: {
    id: 'catalog.course-about.sidebar-details.price',
    defaultMessage: 'Price',
    description: 'Price label.',
  },
  requirements: {
    id: 'catalog.course-about.sidebar-details.requirements',
    defaultMessage: 'Requirements',
    description: 'Requirements label.',
  },
  prerequisites: {
    id: 'catalog.course-about.sidebar-details.prerequisites',
    defaultMessage: 'Prerequisites',
    description: 'Prerequisites label.',
  },
  prerequisitesCompletion: {
    id: 'catalog.course-about.sidebar-details.prerequisites-completion',
    defaultMessage: 'You must successfully complete {prerequisite} before you begin this course.',
    description: 'Text explaining that a prerequisite course must be completed.',
  },
});

export default messages;
