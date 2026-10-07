import { defineMessages } from '@openedx/frontend-base';

const messages = defineMessages({
  notFound: {
    id: 'category.not-found-page.title',
    defaultMessage: 'The page you\'re looking for is unavailable or there\'s an error in the URL. Please check the URL and try again.',
    description: 'The title text for the not found page.',
  },
  pathwayBadge: {
    id: 'catalog.pathway-detail.pathway-badge',
    defaultMessage: 'Pathway',
    description: 'Label shown above the pathway name in the hero.',
  },
  enrollNowBtn: {
    id: 'catalog.pathway-detail.enroll-now-btn',
    defaultMessage: 'Enroll now',
    description: 'Text for the disabled pathway enrollment call to action shown to unenrolled learners.',
  },
  viewPathwayBtn: {
    id: 'catalog.pathway-detail.view-pathway-btn',
    defaultMessage: 'View pathway',
    description: 'Text for the disabled pathway call to action shown to enrolled learners.',
  },
  sectionsNavLabel: {
    id: 'catalog.pathway-detail.sections-nav-label',
    defaultMessage: 'Pathway sections',
    description: 'Accessible label for the pathway section navigation.',
  },
  aboutNavLink: {
    id: 'catalog.pathway-detail.about-nav-link',
    defaultMessage: 'About',
    description: 'Navigation link to the About section.',
  },
  credentialsNavLink: {
    id: 'catalog.pathway-detail.credentials-nav-link',
    defaultMessage: 'Credentials',
    description: 'Navigation link to the Credentials section.',
  },
  instructorsNavLink: {
    id: 'catalog.pathway-detail.instructors-nav-link',
    defaultMessage: 'Instructors',
    description: 'Navigation link to the Instructors section.',
  },
  faqsNavLink: {
    id: 'catalog.pathway-detail.faqs-nav-link',
    defaultMessage: 'FAQs',
    description: 'Navigation link to the FAQs section.',
  },
  testimonialsNavLink: {
    id: 'catalog.pathway-detail.testimonials-nav-link',
    defaultMessage: 'Testimonials',
    description: 'Navigation link to the Testimonials section.',
  },
  aboutHeading: {
    id: 'catalog.pathway-detail.about-heading',
    defaultMessage: 'About this Pathway',
    description: 'Heading for the About section.',
  },
  completeCoursesNote: {
    id: 'catalog.pathway-detail.complete-courses-note',
    defaultMessage: 'Complete {count, plural, one {this # course} other {these # courses}} in any order',
    description: 'Note shown above the pathway courses list, including the total course count.',
  },
  credentialsHeading: {
    id: 'catalog.pathway-detail.credentials-heading',
    defaultMessage: 'Credentials',
    description: 'Heading for the Credentials section.',
  },
  instructorsHeading: {
    id: 'catalog.pathway-detail.instructors-heading',
    defaultMessage: 'Instructors',
    description: 'Heading for the Instructors section.',
  },
  faqsHeading: {
    id: 'catalog.pathway-detail.faqs-heading',
    defaultMessage: 'FAQs',
    description: 'Heading for the FAQs section.',
  },
  testimonialsHeading: {
    id: 'catalog.pathway-detail.testimonials-heading',
    defaultMessage: 'Testimonials',
    description: 'Heading for the Testimonials section.',
  },
  learnMoreBtn: {
    id: 'catalog.pathway-detail.learn-more-btn',
    defaultMessage: 'Learn more',
    description: 'Button text for opening the selected course details modal.',
  },
  courseModalTitle: {
    id: 'catalog.pathway-detail.course-modal-title',
    defaultMessage: 'Learn more about {courseTitle}',
    description: 'Accessible title for the course details modal, including the selected course name.',
  },
  courseModalContextBanner: {
    id: 'catalog.pathway-detail.course-modal-context-banner',
    defaultMessage: 'This course is a part of the {pathwayName} pathway.',
    description: 'Context banner in the course details modal header; the pathway name is shown in bold.',
  },
  seeMoreBtn: {
    id: 'catalog.pathway-detail.see-more-btn',
    defaultMessage: 'See more',
    description: 'Button text for revealing hidden list items.',
  },
  seeLessBtn: {
    id: 'catalog.pathway-detail.see-less-btn',
    defaultMessage: 'See less',
    description: 'Button text for hiding revealed list items.',
  },
  factsAriaLabel: {
    id: 'catalog.pathway-detail.facts-aria-label',
    defaultMessage: 'Pathway facts',
    description: 'Accessible label for the pathway facts sidebar.',
  },
  shareHeading: {
    id: 'catalog.pathway-detail.share-heading',
    defaultMessage: 'Share this pathway',
    description: 'Heading for the social sharing links in the sidebar.',
  },
  shareTwitterLabel: {
    id: 'catalog.pathway-detail.share-twitter-label',
    defaultMessage: 'Share this pathway on X (Twitter)',
    description: 'Accessible label for the pathway Twitter share link.',
  },
  shareFacebookLabel: {
    id: 'catalog.pathway-detail.share-facebook-label',
    defaultMessage: 'Share this pathway on Facebook',
    description: 'Accessible label for the pathway Facebook share link.',
  },
  shareEmailLabel: {
    id: 'catalog.pathway-detail.share-email-label',
    defaultMessage: 'Share this pathway by email',
    description: 'Accessible label for the pathway email share link.',
  },
  shareTwitterText: {
    id: 'catalog.pathway-detail.share-twitter-text',
    defaultMessage: 'Check out the {pathwayName} pathway: {url}',
    description: 'Pre-filled text for sharing the pathway on X (Twitter).',
  },
  shareEmailSubject: {
    id: 'catalog.pathway-detail.share-email-subject',
    defaultMessage: 'The {pathwayName} pathway',
    description: 'Email subject for sharing the pathway.',
  },
  shareEmailBody: {
    id: 'catalog.pathway-detail.share-email-body',
    defaultMessage: 'I found the {pathwayName} pathway and thought you might be interested: {url}',
    description: 'Email body for sharing the pathway.',
  },
});

export default messages;
