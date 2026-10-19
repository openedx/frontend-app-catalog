import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  Badge, Button, Card, Collapsible, Container, Icon, Image, Layout, ModalDialog, Nav, Stack,
} from '@openedx/paragon';
import {
  AccessTimeFilled as AccessTimeFilledIcon,
  Add as AddIcon,
  CardMembership as CardMembershipIcon,
  Remove as RemoveIcon,
  Shuffle,
  WorkspacePremium,
} from '@openedx/paragon/icons';
import { getSiteConfig, resolveRouteByRole, useIntl } from '@openedx/frontend-base';

import { onImageLoadError, resolveImageUrl } from '@src/generic/course-image';
import { getShareLinks, ShareLinks, type ShareCopy } from '@src/generic/share-links';
import CourseAboutBody from '@src/course-about/CourseAboutBody';
import { courseAboutRole } from '@src/constants';
import type { IntlShape } from '@src/utils';

import messages from './messages';
import { getPathwayDetail } from './data';
import type { PathwayCourse } from './types';

/** Number of courses and credentials shown before a list is expanded. */
export const INITIAL_VISIBLE_COUNT = 6;

const SECTION_NAV_ITEMS = [
  { id: 'about', message: messages.aboutNavLink },
  { id: 'credentials', message: messages.credentialsNavLink },
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

const renderCourseTitle = (course: PathwayCourse, intl: IntlShape) => {
  const { kind, count } = course.credential;
  const isBadge = kind === 'badge';

  return (
    <span className="pathway-detail-course-title d-flex flex-column">
      <strong>{course.title}</strong>
      <span className="pathway-detail-course-meta d-flex align-items-center flex-wrap text-muted small">
        <span className="d-inline-flex align-items-center">
          <Icon src={AccessTimeFilledIcon} size="sm" />
          {course.duration}
        </span>
        <span className="d-inline-flex align-items-center">{course.pace}</span>
        <span className="d-inline-flex align-items-center">
          <Icon src={isBadge ? WorkspacePremium : CardMembershipIcon} size="sm" />
          {intl.formatMessage(isBadge ? messages.badgeCount : messages.certificateCount, { count })}
        </span>
      </span>
    </span>
  );
};

/**
 * Absolute URL of a course's About page, or null when the site does not
 * register the route. The course modal uses it as the share target; a missing
 * route hides the modal's share controls instead of sharing the pathway URL.
 */
const getCourseAboutUrl = (course: PathwayCourse): string | null => {
  const resolved = resolveRouteByRole(courseAboutRole, { courseId: course.courseAboutData.id });
  if (!resolved) {
    return null;
  }
  return resolved.isInternal ? new URL(resolved.url, getSiteConfig().baseUrl).href : resolved.url;
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

  // Page-local scrollspy: one IntersectionObserver watches the section
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
  const courseShareUrl = selectedCourse ? getCourseAboutUrl(selectedCourse) : null;

  // Built during render with a current-page target, so hash changes synced by
  // the section observer are reflected in the destinations.
  const socialCopy: ShareCopy = {
    twitterLabel: intl.formatMessage(messages.shareTwitterLabel),
    facebookLabel: intl.formatMessage(messages.shareFacebookLabel),
    emailLabel: intl.formatMessage(messages.shareEmailLabel),
    twitterText: url => intl.formatMessage(messages.shareTwitterText, { pathwayName: pathway.name, url }),
    emailSubject: intl.formatMessage(messages.shareEmailSubject, { pathwayName: pathway.name }),
    emailBody: url => intl.formatMessage(messages.shareEmailBody, { pathwayName: pathway.name, url }),
  };
  const { links: socialLinks } = getShareLinks(socialCopy, { kind: 'current-page' });

  return (
    <>
      <Helmet>
        <title>
          {intl.formatMessage(messages.pageTitle, {
            pathwayName: pathway.name,
            siteName: getSiteConfig().siteName,
          })}
        </title>
      </Helmet>
      <Container fluid={false} size="xl" className="pathway-detail-page">
        <header className="pathway-detail-hero d-flex flex-column flex-lg-row align-items-lg-start gap-3 bg-light-200 py-6">
          <div className="pathway-detail-hero-content d-flex flex-column gap-2">
            <h1 className="h2 mb-0">{pathway.name}</h1>
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
            className="pathway-detail-hero-image flex-lg-shrink-0"
            src={resolveImageUrl(pathway.imageUrl)}
            alt={pathway.name}
            onError={onImageLoadError}
          />
        </header>
        <Nav
          as="nav"
          aria-label={intl.formatMessage(messages.sectionsNavLabel)}
          className="pathway-detail-nav position-sticky vw-100 flex-nowrap border-bottom border-light-300 align-items-center gap-4 mt-1 mb-5"
        >
          {SECTION_NAV_ITEMS.map(({ id, message }) => (
            <Nav.Link
              key={id}
              href={`#${id}`}
              className={`pathway-detail-nav-link px-0 d-flex align-items-center h-100 text-nowrap ${activeSection === id ? 'active' : ''}`}
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
                <Stack direction="horizontal" gap={2}>
                  <Icon className="bg-info-200 text-info-800" src={Shuffle} size="sm" />
                  {intl.formatMessage(messages.completeCoursesNote, { count: pathway.courses.length })}
                </Stack>
                <Stack id="pathway-courses-list" direction="vertical" gap={2}>
                  {visibleCourses.map((course) => (
                    <Collapsible
                      className="py-2 px-3"
                      key={course.id}
                      styling="card"
                      iconWhenClosed={<Icon src={AddIcon} />}
                      iconWhenOpen={<Icon src={RemoveIcon} />}
                      title={renderCourseTitle(course, intl)}
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
                  {pathway.certificateLabel && (
                    <Card className="pathway-detail-featured-credential d-flex rounded bg-light-200">
                      <Card.Body className="d-flex flex-column align-items-center justify-content-center text-center p-4">
                        <Icon src={CardMembershipIcon} size="lg" className="text-info-800 mb-3" />
                        <strong className="mb-1">{pathway.name}</strong>
                        <span className="small">{pathway.certificateLabel}</span>
                      </Card.Body>
                    </Card>
                  )}
                  {visibleCredentials.map((credential) => {
                    const isBadge = credential.kind === 'badge';
                    const credentialIcon = isBadge ? WorkspacePremium : CardMembershipIcon;
                    return (
                      <Card
                        key={credential.id}
                        className={`pathway-detail-credential-card justify-content-center border-0 ${isBadge
                          ? 'pathway-detail-credential-card-badge'
                          : 'pathway-detail-credential-card-certificate bg-light-100'}`}
                      >
                        <Card.Body className="d-flex flex-column align-items-center text-center p-4">
                          <Icon src={credentialIcon} size="lg" className="text-info-800 mb-3" />
                          <strong>
                            {intl.formatMessage(
                              isBadge ? messages.earnBadgeTitle : messages.earnCertificateTitle,
                              { rule: credential.rule },
                            )}
                          </strong>
                          <span className="small">
                            {intl.formatMessage(messages.credentialCourseTitle, { title: credential.courseTitle })}
                          </span>
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
                      <ShareLinks links={socialLinks} />
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
                  shareUrl={courseShareUrl}
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
