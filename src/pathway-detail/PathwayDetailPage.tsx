import { useEffect, useRef, useState } from 'react';
import type { SyntheticEvent } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  Badge, Button, Card, Collapsible, Container, Icon, Image, Layout, ModalDialog, Nav, Stack,
} from '@openedx/paragon';
import {
  AccessTimeFilled as AccessTimeFilledIcon,
  Add as AddIcon,
  BsFacebook as BsFacebookIcon,
  BsTwitterX as BsTwitterXIcon,
  CardMembership as CardMembershipIcon,
  Email as EmailIcon,
  FormatQuote,
  Remove as RemoveIcon,
  WorkspacePremium,
} from '@openedx/paragon/icons';
import { useIntl } from '@openedx/frontend-base';

import noCourseImg from '@src/assets/images/no-course-image.svg';
import { getFullImageUrl } from '@src/generic/course-card/utils';
import SocialLinks from '@src/course-about/course-sidebar/sidebar-social/SocialLinks';
import type { SocialLink } from '@src/course-about/course-sidebar/sidebar-social/types';
import { getFacebookShareUrl } from '@src/course-about/course-sidebar/sidebar-social/utils';
import CourseAboutBody from '@src/course-about/CourseAboutBody';

import messages from './messages';
import { getPathwayDetail } from './data';
import type { PathwayCourse } from './types';

/** Number of courses and credentials shown before a list is expanded. */
export const INITIAL_VISIBLE_COUNT = 6;

const SECTION_NAV_ITEMS = [
  { id: 'about', message: messages.aboutNavLink },
  { id: 'credentials', message: messages.credentialsNavLink },
  { id: 'instructors', message: messages.instructorsNavLink },
  { id: 'faqs', message: messages.faqsNavLink },
  { id: 'testimonials', message: messages.testimonialsNavLink },
];

/**
 * Responsive Bootstrap grid config for the two page columns, mirroring
 * CourseAboutPage's Layout usage: stacked on mobile, 9/3 split at lg and up.
 */
const PAGE_LAYOUT = {
  xs: [{ span: 12 }, { span: 12 }],
  sm: [{ span: 12 }, { span: 12 }],
  md: [{ span: 12 }, { span: 12 }],
  lg: [{ span: 9 }, { span: 3 }],
  xl: [{ span: 9 }, { span: 3 }],
};

const renderCourseTitle = (course: PathwayCourse) => {
  const [duration, pace, credential] = course.summary.split(' · ');
  const isBadge = credential?.toLowerCase().includes('badge');

  return (
    <span className="pathway-detail-course-title">
      <strong>{course.title}</strong>
      <span className="pathway-detail-course-meta">
        <span>
          <Icon src={AccessTimeFilledIcon} size="sm" />
          {duration}
        </span>
        <span>{pace}</span>
        <span>
          <Icon src={isBadge ? WorkspacePremium : CardMembershipIcon} size="sm" />
          {credential}
        </span>
      </span>
    </span>
  );
};

const PathwayDetailPage = () => {
  const intl = useIntl();
  const { pathwayId } = useParams<{ pathwayId: string }>();
  const [showAllCourses, setShowAllCourses] = useState(false);
  const [showAllCredentials, setShowAllCredentials] = useState(false);
  const [activeSection, setActiveSection] = useState<string | undefined>(() => {
    const initialSection = window.location.hash.slice(1);
    return SECTION_NAV_ITEMS.some(({ id }) => id === initialSection) ? initialSection : 'about';
  });
  // The course whose Learn-more modal is open; null keeps the dialog closed.
  // Deliberately page-local state: the modal never touches the URL or history.
  const [selectedCourse, setSelectedCourse] = useState<PathwayCourse | null>(null);
  const intersectingSections = useRef(new Set<string>());

  // Page-local scrollspy: one IntersectionObserver watches the five section
  // targets. The nav height is read from the same CSS custom property used for
  // scroll-margin-top (px unit keeps it valid as a rootMargin length), so the
  // JS and CSS offsets cannot drift.
  useEffect(() => {
    // Paragon Nav does not forward refs to its DOM element, so resolve it
    // directly; this page renders exactly one section navigation.
    const nav = document.querySelector<HTMLElement>('.pathway-detail-nav');
    const sections = SECTION_NAV_ITEMS
      .map(({ id }) => document.getElementById(id))
      .filter((section): section is HTMLElement => section !== null);
    if (!nav || sections.length === 0) {
      return undefined;
    }

    const navHeight = parseFloat(getComputedStyle(nav).getPropertyValue('--pathway-detail-nav-height'));
    const stickyBoundary = Number.isFinite(navHeight) ? navHeight : 0;

    // Mirror the active section in the URL hash without adding a history
    // entry per scroll event; pathname and query are preserved. This runs
    // before setActiveSection so the re-render reads the already-synced URL
    // (share destinations are built from window.location.href).
    const syncHash = (sectionId: string) => {
      const hash = `#${sectionId}`;
      if (window.location.hash !== hash) {
        window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}${hash}`);
      }
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          intersectingSections.current.add(entry.target.id);
        } else {
          intersectingSections.current.delete(entry.target.id);
        }
      });

      // Several sections can intersect at once. Pick the one nearest the
      // sticky boundary (the nav's bottom edge); a strictly-smaller
      // comparison keeps the first matching section on ties, so the choice
      // is deterministic and does not flicker. Geometry is read fresh from
      // the live DOM: entry.boundingClientRect is stale between callbacks.
      let nearestId: string | undefined;
      let nearestDistance = Infinity;
      SECTION_NAV_ITEMS.forEach(({ id }) => {
        if (!intersectingSections.current.has(id)) {
          return;
        }
        const section = document.getElementById(id);
        if (!section) {
          return;
        }
        const distance = Math.abs(section.getBoundingClientRect().top - stickyBoundary);
        if (distance < nearestDistance) {
          nearestId = id;
          nearestDistance = distance;
        }
      });
      // Keep the current section active while none intersect (e.g. the page
      // footer) rather than flickering the active link off.
      if (nearestId) {
        syncHash(nearestId);
        setActiveSection(nearestId);
      }
    }, { rootMargin: `-${stickyBoundary}px 0px 0px 0px` });

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const pathway = pathwayId ? getPathwayDetail(pathwayId) : undefined;

  if (!pathway) {
    return (
      <Container size="sm">
        <p className="my-0 py-5 text-muted text-center mx-auto" data-testid="not-found-page">
          {intl.formatMessage(messages.notFound)}
        </p>
      </Container>
    );
  }

  const visibleCourses = pathway.courses.slice(0, showAllCourses ? undefined : INITIAL_VISIBLE_COUNT);
  const visibleCredentials = pathway.credentials.slice(0, showAllCredentials ? undefined : INITIAL_VISIBLE_COUNT);

  const handleHeroImageError = (event: SyntheticEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    // Compare the raw attribute: img.src is resolved to an absolute URL, so
    // it never equals the imported (relative) placeholder path and would
    // otherwise re-assign forever on repeated errors.
    if (img.getAttribute('src') !== noCourseImg) {
      img.src = noCourseImg;
    }
  };

  // Read during render so observer-driven hash changes (synced before
  // setActiveSection) are reflected in the share destinations.
  const shareUrl = window.location.href;
  const socialLinks: SocialLink[] = [
    {
      id: 'facebook',
      destination: getFacebookShareUrl(),
      icon: BsFacebookIcon,
      screenReaderText: intl.formatMessage(messages.shareFacebookLabel),
    },
    {
      id: 'twitter',
      destination: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        intl.formatMessage(messages.shareTwitterText, { pathwayName: pathway.name, url: shareUrl }),
      )}`,
      icon: BsTwitterXIcon,
      screenReaderText: intl.formatMessage(messages.shareTwitterLabel),
    },
    {
      id: 'email',
      destination: `mailto:?subject=${encodeURIComponent(
        intl.formatMessage(messages.shareEmailSubject, { pathwayName: pathway.name }),
      )}&body=${encodeURIComponent(
        intl.formatMessage(messages.shareEmailBody, { pathwayName: pathway.name, url: shareUrl }),
      )}`,
      icon: EmailIcon,
      screenReaderText: intl.formatMessage(messages.shareEmailLabel),
    },
  ];

  return (
    <>
      <Helmet>
        <title>{pathway.name}</title>
      </Helmet>
      <Container fluid={false} size="xl" className="pathway-detail-page">
        <header className="pathway-detail-hero d-flex flex-column flex-lg-row align-items-lg-start gap-3 bg-light-200 py-6">
          <div className="pathway-detail-hero-content d-flex flex-column gap-3">
            <h1 className="h2 mb-1">{pathway.name}</h1>
            <Stack direction="horizontal" gap={3}>
              <Badge variant="light">{intl.formatMessage(messages.pathwayBadge)}</Badge>
              <div className="text-muted">{pathway.organization}</div>
            </Stack>
            <p className="mt-3">{pathway.description}</p>
            <div className="mt-1">
              <Button variant="primary" disabled>
                {intl.formatMessage(pathway.isEnrolled ? messages.viewPathwayBtn : messages.enrollNowBtn)}
              </Button>
            </div>
          </div>
          <Image
            className="pathway-detail-hero-image"
            src={getFullImageUrl(pathway.imageUrl) || noCourseImg}
            alt={pathway.name}
            onError={handleHeroImageError}
          />
        </header>
        <Nav
          as="nav"
          aria-label={intl.formatMessage(messages.sectionsNavLabel)}
          className="pathway-detail-nav align-items-center gap-4 mt-1 mb-5"
        >
          {SECTION_NAV_ITEMS.map(({ id, message }) => (
            <Nav.Link
              key={id}
              href={`#${id}`}
              className={`pathway-detail-nav-link px-0 ${activeSection === id ? 'active' : ''}`}
              aria-current={activeSection === id ? 'location' : undefined}
              onClick={() => setActiveSection(id)}
            >
              {intl.formatMessage(message)}
            </Nav.Link>
          ))}
        </Nav>
        <Layout {...PAGE_LAYOUT}>
          <Layout.Element className="d-flex flex-column gap-5 mt-4 mb-4 mb-lg-0">
            <Stack direction="vertical" gap={5}>
              <section id="about" className="pathway-detail-section d-flex flex-column gap-3">
                <h2 className="h3 mb-2">{intl.formatMessage(messages.aboutHeading)}</h2>
                {pathway.about.map(paragraph => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                <strong className="mt-3">
                  {intl.formatMessage(messages.completeCoursesNote, { count: pathway.courses.length })}
                </strong>
                <Stack id="pathway-courses-list" direction="vertical" gap={2}>
                  {visibleCourses.map((course) => (
                    <Collapsible
                      className="py-2 px-3"
                      key={course.id}
                      styling="card"
                      iconWhenClosed={<Icon src={AddIcon} />}
                      iconWhenOpen={<Icon src={RemoveIcon} />}
                      title={renderCourseTitle(course)}
                    >
                      <p className="mb-2">{course.courseAboutData.shortDescription}</p>
                      <Button variant="primary" size="sm" onClick={() => setSelectedCourse(course)}>
                        {intl.formatMessage(messages.learnMoreBtn)}
                      </Button>
                    </Collapsible>
                  ))}
                </Stack>
                {pathway.courses.length > INITIAL_VISIBLE_COUNT && (
                  <div>
                    <Button
                      variant="link"
                      aria-expanded={showAllCourses}
                      aria-controls="pathway-courses-list"
                      onClick={() => setShowAllCourses((current) => !current)}
                    >
                      {intl.formatMessage(showAllCourses ? messages.seeLessBtn : messages.seeMoreBtn)}
                    </Button>
                  </div>
                )}
              </section>
              <section id="credentials" className="pathway-detail-section d-flex flex-column gap-3">
                <h2 className="h3 mb-3">{intl.formatMessage(messages.credentialsHeading)}</h2>
                <div id="pathway-credentials-list" className="pathway-detail-credentials">
                  {visibleCredentials.map((credential) => {
                    const isBadge = credential.title.toLowerCase().includes('badge');
                    const credentialIcon = isBadge ? WorkspacePremium : CardMembershipIcon;
                    return (
                      <Card
                        key={credential.id}
                        className={`pathway-detail-credential-card justify-content-center bg-light-200 ${isBadge
                          ? 'pathway-detail-credential-card-badge'
                          : 'pathway-detail-credential-card-certificate'}`}
                      >
                        <Card.Body className="d-flex flex-column align-items-center text-center p-4">
                          <Icon src={credentialIcon} size="lg" className="pathway-detail-credential-icon mb-3" />
                          <strong>{credential.title}</strong>
                          <span className="small">{credential.courseTitle}</span>
                        </Card.Body>
                      </Card>
                    );
                  })}
                </div>
                {pathway.credentials.length > INITIAL_VISIBLE_COUNT && (
                  <div>
                    <Button
                      variant="link"
                      aria-expanded={showAllCredentials}
                      aria-controls="pathway-credentials-list"
                      onClick={() => setShowAllCredentials((current) => !current)}
                    >
                      {intl.formatMessage(showAllCredentials ? messages.seeLessBtn : messages.seeMoreBtn)}
                    </Button>
                  </div>
                )}
              </section>
              <section id="instructors" className="pathway-detail-section d-flex flex-column gap-3">
                <h2 className="h3 mb-3">{intl.formatMessage(messages.instructorsHeading)}</h2>
                <Card className="pathway-detail-instructors-card">
                  <Card.Body className="d-flex flex-column gap-3 p-4">
                    {pathway.instructors.map((instructor) => (
                      <Stack direction="horizontal" gap={3} key={instructor.id} className="pathway-detail-instructor-row d-flex align-items-center gap-3">
                        <div className="pathway-detail-instructor-avatar" aria-hidden="true">
                          {instructor.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="mb-0">{instructor.name}</h3>
                          <span className="x-small text-muted">{instructor.role}</span>
                        </div>
                      </Stack>
                    ))}
                  </Card.Body>
                </Card>
              </section>
              <section id="faqs" className="pathway-detail-section d-flex flex-column gap-2">
                <h2 className="h3 mb-3">{intl.formatMessage(messages.faqsHeading)}</h2>
                <Stack direction="vertical" gap={2}>
                  {pathway.faqs.map((faq) => (
                    <Collapsible key={faq.id} styling="basic" className="pathway-detail-faq" title={faq.question}>
                      <p className="mb-0">{faq.answer}</p>
                    </Collapsible>
                  ))}
                </Stack>
              </section>
              <section id="testimonials" className="pathway-detail-section d-flex flex-column gap-3">
                <h2 className="h3 mb-3">{intl.formatMessage(messages.testimonialsHeading)}</h2>
                <Stack direction="vertical" gap={2}>
                  {pathway.testimonials.map((testimonial) => (
                    <Card key={testimonial.id} className="shadow-none border border-light-300 bg-light-200 p-4">
                      <Card.Body>
                        <figure className="m-0">
                          <figcaption className="pathway-detail-testimonial-attribution">
                            <Stack direction="horizontal" gap={2} className="mb-1 align-items-start">
                              <Icon src={FormatQuote} className="text-info" />
                              <Stack direction="vertical" gap={2} className="mb-1">
                                <strong>{testimonial.attribution}</strong>
                                <blockquote className="mb-0">{testimonial.quote}</blockquote>
                              </Stack>
                            </Stack>
                          </figcaption>
                        </figure>
                      </Card.Body>
                    </Card>
                  ))}
                </Stack>
              </section>
            </Stack>
          </Layout.Element>
          <Layout.Element className="align-self-start mt-lg-4">
            <aside aria-label={intl.formatMessage(messages.factsAriaLabel)}>
              <Card>
                <Card.Body className="p-0">
                  <div
                    role="group"
                    aria-label={intl.formatMessage(messages.shareHeading)}
                    className="p-3"
                  >
                    <Stack direction="horizontal" gap={3} className="justify-content-center">
                      <SocialLinks socialLinks={socialLinks} />
                    </Stack>
                  </div>
                  <Card.Divider />
                  {pathway.facts.map((fact) => (
                    <div key={fact.label}>
                      <Stack direction="horizontal" className="justify-content-between flex-wrap p-3" gap={2}>
                        <span>{fact.label}</span>
                        <span className="font-weight-bold">{fact.value}</span>
                      </Stack>
                      <Card.Divider />
                    </div>
                  ))}
                </Card.Body>
              </Card>
            </aside>
          </Layout.Element>
        </Layout>
        <ModalDialog
          title={selectedCourse
            ? intl.formatMessage(messages.courseModalTitle, { courseTitle: selectedCourse.title })
            : ''}
          isOpen={selectedCourse !== null}
          onClose={() => setSelectedCourse(null)}
          size="xl"
          // Dark variant styles the header with white text and inverts the
          // close button to white; only the header tint is overridden in
          // PathwayDetailPage.scss, the dialog body stays white.
          variant="dark"
          isOverflowVisible={false}
          // Near-full-screen below the md breakpoint while keeping the close
          // control; the default 80vh cap plus the internally scrollable
          // ModalDialog.Body bounds the dialog on larger screens.
          isFullscreenOnMobile
          className="pathway-detail-course-modal"
        >
          {selectedCourse && (
            <>
              <ModalDialog.Header>
                {/* Non-heading element: the banner is a compact bar, not a page heading. */}
                <ModalDialog.Title as="p">
                  {intl.formatMessage(messages.courseModalContextBanner, {
                    pathwayName: <strong>{pathway.name}</strong>,
                  })}
                </ModalDialog.Title>
              </ModalDialog.Header>
              <ModalDialog.Body>
                <CourseAboutBody
                  courseAboutData={selectedCourse.courseAboutData}
                  hideActions
                />
              </ModalDialog.Body>
            </>
          )}
        </ModalDialog>
      </Container>
    </>
  );
};

export default PathwayDetailPage;
