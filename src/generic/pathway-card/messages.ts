import { defineMessages } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  courseCount: {
    id: 'generic.pathway-card.course-count',
    defaultMessage: '{count, plural, one {# Course} other {# Courses}}',
    description: 'Number of courses in a pathway.',
  },
  startDate: {
    id: 'generic.pathway-card.start-date',
    defaultMessage: 'Starts: {startDate}',
    description: 'Start date.',
  },
});

export default messages;
