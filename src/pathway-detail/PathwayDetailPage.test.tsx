import { MemoryRouter, Route, Routes } from 'react-router-dom';
import {
  act, fireEvent, render as rtlRender, screen, waitFor, within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  getSiteConfig, IntlProvider, resolveRouteByRole,
} from '@openedx/frontend-base';
import { Icon } from '@openedx/paragon';
import {
  CardMembership as CardMembershipIcon, WorkspacePremium,
} from '@openedx/paragon/icons';
import noCourseImg from '@src/assets/images/no-course-image.svg';
import { courseAboutRole } from '@src/constants';
import { expandCourseAboutData } from '@src/course-about/fallback';
import sidebarDetailsMessages from '@src/course-about/course-sidebar/sidebar-details/messages';
import sidebarSocialMessages from '@src/course-about/course-sidebar/sidebar-social/messages';

import PathwayDetailPage from './PathwayDetailPage';
import { INITIAL_VISIBLE_COUNT } from './sections';
import { DATA_ENGINEERING_PATHWAY, getPathwayDetail } from './data';
import messages from './messages';
import type { PathwayCourse } from './types';

let mockIsEnrolled: boolean | undefined;

/** `null` renders the pathway without its optional certificate label. */
let mockCertificateLabel: string | null | undefined;

/** `null` renders the pathway without its start date; any string is passed through verbatim. */
let mockStart: string | null | undefined;

// The embedded course About body renders CourseOverview, which reads the
// authenticated user to decide whether to show the Studio edit action.
jest.mock('@openedx/frontend-base', () => ({
  ...jest.requireActual('@openedx/frontend-base'),
  getAuthenticatedUser: jest.fn(() => null),
  resolveRouteByRole: jest.fn(),
}));

const mockResolveRouteByRole = resolveRouteByRole as jest.Mock;

jest.mock('./data', () => {
  const actual = jest.requireActual('./data');
  return {
    ...actual,
    getPathwayDetail: (pathwayId: string) => {
      const pathway = actual.getPathwayDetail(pathwayId);
      if (!pathway) {
        return pathway;
      }
      const { certificateLabel, start, ...rest } = pathway;
      const label = mockCertificateLabel === undefined ? certificateLabel : mockCertificateLabel;
      const startValue = mockStart === undefined ? start : mockStart;
      return {
        ...rest,
        ...(mockIsEnrolled === undefined ? {} : { isEnrolled: mockIsEnrolled }),
        ...(label ? { certificateLabel: label } : {}),
        ...(startValue ? { start: startValue } : {}),
      };
    },
  };
});

const getSection = (heading: string) => (
  screen.getByRole('heading', { name: heading }).closest('section') as HTMLElement
);

/** The fixture's featured certificate label. */
const featuredCertificateLabel = DATA_ENGINEERING_PATHWAY.certificateLabel as string;

/** A credential's secondary line; the fixture stores only the course name. */
const credentialCourseTitle = (courseTitle: string) => (
  messages.credentialCourseTitle.defaultMessage.replace('{title}', courseTitle)
);

/** Path data of the icon rendered inside an element. */
const iconPath = (container: Element) => container.querySelector('.pgn__icon svg path')?.getAttribute('d');

/** The same path data for an icon rendered alone, so assertions name the icon, not its markup. */
const iconPathOf = (icon: typeof Icon) => {
  const { container, unmount } = rtlRender(<Icon src={icon} size="lg" />);
  const path = iconPath(container);
  unmount();
  return path;
};

const renderPathwayDetailPage = () => rtlRender(
  <IntlProvider locale="en">
    <MemoryRouter initialEntries={[`/catalog/pathways/${DATA_ENGINEERING_PATHWAY.id}`]}>
      <Routes>
        <Route path="/catalog/pathways/:pathwayId" element={<PathwayDetailPage />} />
      </Routes>
    </MemoryRouter>
  </IntlProvider>,
);

/**
 * Local IntersectionObserver mock: records instances so tests can drive the
 * observer callback with crafted entries.
 */
class MockIntersectionObserver {
  callback: IntersectionObserverCallback;

  options: IntersectionObserverInit;

  observe = jest.fn();

  unobserve = jest.fn();

  disconnect = jest.fn();

  static instances: MockIntersectionObserver[] = [];

  constructor(callback: IntersectionObserverCallback, options: IntersectionObserverInit) {
    this.callback = callback;
    this.options = options;
    MockIntersectionObserver.instances.push(this);
  }
}

const getObserver = () => (
  MockIntersectionObserver.instances[MockIntersectionObserver.instances.length - 1]
);

// jsdom cannot resolve custom properties from stylesheets, so emulate the
// stylesheet fallback the page reads from .pathway-detail-page. A real layout
// measurement (see the resize test) overrides it by writing inline.
const mockNavHeight = (height: string) => {
  const realGetComputedStyle = window.getComputedStyle.bind(window);
  const mockGetComputedStyle: typeof window.getComputedStyle = (
    element: Element,
    pseudoElement?: string | null,
  ) => {
    const style = realGetComputedStyle(element, pseudoElement);
    if ((element as HTMLElement).classList?.contains('pathway-detail-page')) {
      const getPropertyValue = style.getPropertyValue.bind(style);
      style.getPropertyValue = (property: string) => (
        property === '--pathway-detail-nav-height' ? height : getPropertyValue(property)
      );
    }
    return style;
  };
  jest.spyOn(window, 'getComputedStyle').mockImplementation(mockGetComputedStyle);
};

// The page reads section geometry fresh from the live DOM on every callback,
// so tests position sections via getBoundingClientRect instead of baking
// (stale) geometry into the entry objects.
const setSectionTop = (target: HTMLElement, top: number) => {
  jest.spyOn(target, 'getBoundingClientRect').mockReturnValue({ top } as DOMRect);
};

const makeEntry = (target: HTMLElement, isIntersecting: boolean): IntersectionObserverEntry => ({
  target,
  isIntersecting,
} as unknown as IntersectionObserverEntry);

const fireIntersections = (...entries: IntersectionObserverEntry[]) => {
  const observer = getObserver();
  act(() => observer.callback(entries, observer as unknown as IntersectionObserver));
};

describe('PathwayDetailPage', () => {
  beforeEach(() => {
    mockIsEnrolled = undefined;
    mockCertificateLabel = undefined;
    mockStart = undefined;
    mockResolveRouteByRole.mockReturnValue(null);
    window.history.replaceState(null, '', `/catalog/pathways/${DATA_ENGINEERING_PATHWAY.id}`);
    MockIntersectionObserver.instances = [];
    Object.defineProperty(globalThis, 'IntersectionObserver', {
      writable: true,
      value: MockIntersectionObserver,
    });
  });

  it('sets the document title to the pathway name and the configured site name', async () => {
    renderPathwayDetailPage();

    await waitFor(() => {
      expect(document.title).toBe(
        messages.pageTitle.defaultMessage
          .replace('{pathwayName}', DATA_ENGINEERING_PATHWAY.name)
          .replace('{siteName}', getSiteConfig().siteName),
      );
    });
  });

  it('renders the Data Engineering fixture for the route pathway ID and rejects blank IDs', () => {
    renderPathwayDetailPage();

    expect(screen.getByRole('heading', { level: 1, name: DATA_ENGINEERING_PATHWAY.name })).toBeInTheDocument();
    expect(screen.getByText(DATA_ENGINEERING_PATHWAY.organization)).toBeInTheDocument();
    expect(screen.getByText(DATA_ENGINEERING_PATHWAY.description)).toBeInTheDocument();
    expect(screen.getByText(messages.pathwayBadge.defaultMessage)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: DATA_ENGINEERING_PATHWAY.name })).toBeInTheDocument();

    [
      messages.aboutHeading,
      messages.credentialsHeading,
    ].forEach((message) => {
      expect(screen.getByRole('heading', { name: message.defaultMessage })).toBeInTheDocument();
    });

    const factsAside = screen.getByRole('complementary', { name: messages.factsAriaLabel.defaultMessage });
    expect(within(factsAside).getByRole('group', { name: messages.shareHeading.defaultMessage })).toBeInTheDocument();
    expect(document.querySelectorAll('.pathway-detail-credential-card .pgn__icon')).toHaveLength(
      INITIAL_VISIBLE_COUNT,
    );

    const sectionNav = screen.getByRole('navigation', { name: messages.sectionsNavLabel.defaultMessage });
    expect(within(sectionNav).getAllByRole('link')).toHaveLength(2);
    [
      { message: messages.aboutNavLink, hash: '#about' },
      { message: messages.credentialsNavLink, hash: '#credentials' },
    ].forEach(({ message, hash }) => {
      expect(screen.getByRole('link', { name: message.defaultMessage })).toHaveAttribute('href', hash);
    });

    expect(screen.getByText(DATA_ENGINEERING_PATHWAY.facts[0].value)).toBeInTheDocument();

    // Counts shown to the learner stay in sync with the fixture, not hardcoded copy.
    const coursesFact = DATA_ENGINEERING_PATHWAY.facts.find((fact) => fact.label === 'Courses');
    expect(coursesFact?.value).toBe(String(DATA_ENGINEERING_PATHWAY.courses.length));
    expect(screen.getByText(`Complete these ${DATA_ENGINEERING_PATHWAY.courses.length} courses in any order`)).toBeInTheDocument();

    // Fixture shape matches the confirmed decisions.
    expect(DATA_ENGINEERING_PATHWAY.courses).toHaveLength(8);
    expect(DATA_ENGINEERING_PATHWAY.credentials).toHaveLength(8);
    expect(DATA_ENGINEERING_PATHWAY.isEnrolled).toBe(false);

    // The intentionally removed sections stay absent.
    ['instructors', 'faqs', 'testimonials'].forEach((sectionId) => {
      expect(document.getElementById(sectionId)).not.toBeInTheDocument();
    });
    expect(screen.queryByRole('heading', { name: /instructors|faqs|testimonials/i })).not.toBeInTheDocument();

    // Route-ID substitution: any nonempty ID resolves, blank IDs never do.
    expect(getPathwayDetail('some-id')?.id).toBe('some-id');
    expect(getPathwayDetail('')).toBeUndefined();
    expect(getPathwayDetail('   ')).toBeUndefined();

    // Hero wiring: the fixture has no imageUrl, so the initial src comes from
    // resolveImageUrl's placeholder; a load error is replaced by it as well.
    const heroImage = screen.getByRole('img', { name: DATA_ENGINEERING_PATHWAY.name });
    expect(heroImage).toHaveAttribute('src', noCourseImg);
    heroImage.setAttribute('src', 'http://example.com/broken.jpg');
    fireEvent.error(heroImage);
    expect(heroImage).toHaveAttribute('src', noCourseImg);
  });

  it('marks the initial navigation item from the URL before the observer runs', () => {
    const { unmount } = renderPathwayDetailPage();

    // No hash: About is current immediately after mount.
    const aboutLink = screen.getByRole('link', { name: messages.aboutNavLink.defaultMessage });
    expect(aboutLink).toHaveClass('active');
    expect(aboutLink).toHaveAttribute('aria-current', 'location');

    unmount();

    // R2: a #credentials deep link is pinned before any observer callback.
    window.history.replaceState(null, '', '/catalog/pathways/pathway-1#credentials');
    renderPathwayDetailPage();

    expect(screen.getByRole('link', { name: messages.credentialsNavLink.defaultMessage }))
      .toHaveClass('active');
    expect(screen.getByRole('link', { name: messages.credentialsNavLink.defaultMessage }))
      .toHaveAttribute('aria-current', 'location');
    expect(screen.getByRole('link', { name: messages.aboutNavLink.defaultMessage }))
      .not.toHaveAttribute('aria-current');
  });

  it('renders exactly one disabled pathway CTA, inside the hero, before the bar sticks', () => {
    const { unmount } = renderPathwayDetailPage();
    const heroActions = () => document.querySelector('.pathway-detail-hero-actions') as HTMLElement;

    const enrollButtons = screen.getAllByRole('button', { name: messages.enrollNowBtn.defaultMessage });
    expect(enrollButtons).toHaveLength(1);
    expect(enrollButtons[0]).toBeDisabled();
    expect(within(heroActions()).getByRole('button', { name: messages.enrollNowBtn.defaultMessage }))
      .toBe(enrollButtons[0]);
    expect(screen.queryByRole('button', { name: messages.viewPathwayBtn.defaultMessage })).not.toBeInTheDocument();

    unmount();
    mockIsEnrolled = true;
    renderPathwayDetailPage();

    const viewButtons = screen.getAllByRole('button', { name: messages.viewPathwayBtn.defaultMessage });
    expect(viewButtons).toHaveLength(1);
    expect(viewButtons[0]).toBeDisabled();
    expect(within(heroActions()).getByRole('button', { name: messages.viewPathwayBtn.defaultMessage }))
      .toBe(viewButtons[0]);
    expect(screen.queryByRole('button', { name: messages.enrollNowBtn.defaultMessage })).not.toBeInTheDocument();
  });

  it('reveals the sticky summary only while the bar is stuck', () => {
    renderPathwayDetailPage();

    const nav = document.querySelector('.pathway-detail-nav') as HTMLElement;
    const heroActions = document.querySelector('.pathway-detail-hero-actions') as HTMLElement;
    const { name, start } = DATA_ENGINEERING_PATHWAY;
    const startsOn = messages.startsOn.defaultMessage.replace('{date}', 'Mar 3');
    const stickySummary = () => nav.querySelector('.pathway-detail-nav-summary');

    // Not stuck (jsdom has no layout): the hero owns the CTA, the bar is tabs only.
    // The start date lives in the sticky summary, so the hero never shows it.
    expect(start).toBe('2027-03-03');
    expect(stickySummary()).not.toBeInTheDocument();
    expect(heroActions).not.toHaveAttribute('aria-hidden');
    expect(within(heroActions).queryByText(startsOn)).not.toBeInTheDocument();
    expect(within(nav).getAllByRole('link')).toHaveLength(2);

    jest.spyOn(nav, 'getBoundingClientRect').mockReturnValue({ top: -1, bottom: 148, height: 148 } as DOMRect);
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    // Stuck: the bar takes over the summary and the hero action leaves sight and the a11y tree.
    expect(stickySummary()).toBeInTheDocument();
    expect(heroActions).toHaveAttribute('aria-hidden', 'true');
    expect(heroActions).toHaveClass('invisible');
    const stickyButtons = screen.getAllByRole('button', { name: messages.enrollNowBtn.defaultMessage });
    expect(stickyButtons).toHaveLength(1);
    expect(within(stickySummary() as HTMLElement).getByRole('button', { name: messages.enrollNowBtn.defaultMessage }))
      .toBe(stickyButtons[0]);
    expect(within(stickySummary() as HTMLElement).getByText(name)).toBeInTheDocument();
    expect(within(stickySummary() as HTMLElement).getByText(startsOn)).toBeInTheDocument();
    // The name stays plain text, so the page keeps exactly one h1.
    expect(within(stickySummary() as HTMLElement).queryByRole('heading', { name })).not.toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);

    jest.spyOn(nav, 'getBoundingClientRect').mockReturnValue({ top: 40, bottom: 96, height: 56 } as DOMRect);
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    // Unstuck again: the summary unmounts, the hero action is exposed without a start date.
    expect(stickySummary()).not.toBeInTheDocument();
    expect(heroActions).not.toHaveAttribute('aria-hidden');
    expect(heroActions).not.toHaveClass('invisible');
    expect(within(heroActions).getByRole('button', { name: messages.enrollNowBtn.defaultMessage })).toBeDisabled();
    expect(within(heroActions).queryByText(startsOn)).not.toBeInTheDocument();
  });

  it('renders the CTA without a start label when the pathway start date is invalid', () => {
    mockStart = 'not-a-date';
    renderPathwayDetailPage();

    const heroActions = document.querySelector('.pathway-detail-hero-actions') as HTMLElement;
    const enrollButtons = screen.getAllByRole('button', { name: messages.enrollNowBtn.defaultMessage });

    expect(enrollButtons).toHaveLength(1);
    expect(enrollButtons[0]).toBeDisabled();
    expect(within(heroActions).queryByText(/^Starts /)).not.toBeInTheDocument();
  });

  it('shows 6 courses and credentials by default and expands each list independently', async () => {
    renderPathwayDetailPage();

    const aboutSection = getSection(messages.aboutHeading.defaultMessage);
    const credentialsSection = getSection(messages.credentialsHeading.defaultMessage);
    const { courses, credentials } = DATA_ENGINEERING_PATHWAY;
    const lastVisibleCourse = courses[INITIAL_VISIBLE_COUNT - 1].title;
    const firstHiddenCourse = courses[INITIAL_VISIBLE_COUNT].title;
    const lastVisibleCredential = credentialCourseTitle(credentials[INITIAL_VISIBLE_COUNT - 1].courseTitle);
    const firstHiddenCredential = credentialCourseTitle(credentials[INITIAL_VISIBLE_COUNT].courseTitle);

    expect(within(aboutSection).getByText(lastVisibleCourse)).toBeInTheDocument();
    expect(within(aboutSection).queryByText(firstHiddenCourse)).not.toBeInTheDocument();
    expect(within(credentialsSection).getByText(lastVisibleCredential)).toBeInTheDocument();
    expect(within(credentialsSection).queryByText(firstHiddenCredential)).not.toBeInTheDocument();

    // Expanding courses does not change credentials.
    await userEvent.click(within(aboutSection).getByRole('button', { name: messages.seeMoreBtn.defaultMessage }));
    expect(within(aboutSection).getByText(courses[7].title)).toBeInTheDocument();
    expect(within(aboutSection).getByRole('button', { name: messages.seeLessBtn.defaultMessage })).toBeInTheDocument();
    expect(within(credentialsSection).queryByText(firstHiddenCredential)).not.toBeInTheDocument();

    // Expanding credentials does not change courses.
    await userEvent.click(within(credentialsSection).getByRole('button', { name: messages.seeMoreBtn.defaultMessage }));
    expect(within(credentialsSection).getByText(credentialCourseTitle(credentials[7].courseTitle))).toBeInTheDocument();
    expect(credentialsSection.querySelectorAll('.pathway-detail-featured-credential')).toHaveLength(1);
    expect(within(aboutSection).getByText(courses[7].title)).toBeInTheDocument();

    // Each "See less" independently collapses its own list.
    await userEvent.click(within(aboutSection).getByRole('button', { name: messages.seeLessBtn.defaultMessage }));
    expect(within(aboutSection).queryByText(firstHiddenCourse)).not.toBeInTheDocument();
    expect(within(credentialsSection).getByText(credentialCourseTitle(credentials[7].courseTitle))).toBeInTheDocument();

    await userEvent.click(within(credentialsSection).getByRole('button', { name: messages.seeLessBtn.defaultMessage }));
    expect(within(credentialsSection).queryByText(firstHiddenCredential)).not.toBeInTheDocument();
    expect(credentialsSection.querySelectorAll('.pathway-detail-featured-credential')).toHaveLength(1);
  });

  it('renders each course row from its structured duration, pace and credential count', () => {
    renderPathwayDetailPage();

    const aboutSection = getSection(messages.aboutHeading.defaultMessage);
    const { courses } = DATA_ENGINEERING_PATHWAY;
    const rowFor = (title: string) => (
      within(aboutSection).getByText(title).closest('.pathway-detail-course-title') as HTMLElement
    );
    const badgeCourse = courses.find((course) => course.credential.kind === 'badge') as PathwayCourse;
    const certificateCourse = courses.find(
      (course) => course.credential.kind === 'certificate',
    ) as PathwayCourse;

    // Duration and pace are their own fields, not segments of a parsed summary.
    [badgeCourse, certificateCourse].forEach((course) => {
      const row = rowFor(course.title);
      expect(within(row).getByText(course.duration)).toBeInTheDocument();
      expect(within(row).getByText(course.pace)).toBeInTheDocument();
    });

    // The count is described by the course's own credential kind.
    expect(within(rowFor(badgeCourse.title)).getByText('1 badge')).toBeInTheDocument();
    expect(within(rowFor(certificateCourse.title)).getByText('1 certificate')).toBeInTheDocument();
  });

  it('drives credential card copy, icon and styling from the credential kind', () => {
    renderPathwayDetailPage();

    const credentialsSection = getSection(messages.credentialsHeading.defaultMessage);
    const { credentials } = DATA_ENGINEERING_PATHWAY;
    const cards = credentialsSection.querySelectorAll('.pathway-detail-credential-card');

    credentials.slice(0, INITIAL_VISIBLE_COUNT).forEach((credential, index) => {
      const card = cards[index] as HTMLElement;
      const isBadge = credential.kind === 'badge';
      const expectedTitle = `${isBadge ? 'Earn a badge' : 'Earn a certificate'} ${credential.rule}`;

      expect(card).toHaveClass(
        isBadge ? 'pathway-detail-credential-card-badge' : 'pathway-detail-credential-card-certificate',
      );
      expect(card).not.toHaveClass('bg-light-200');
      if (isBadge) {
        expect(card).not.toHaveClass('bg-light-100');
      } else {
        expect(card).toHaveClass('bg-light-100');
      }
      expect(card.querySelector('.pgn__icon svg')).toBeInTheDocument();
      expect(within(card).getByText(expectedTitle)).toBeInTheDocument();
      expect(within(card).getByText(credentialCourseTitle(credential.courseTitle))).toBeInTheDocument();
    });

    // The card's class comes from the kind, so comparing its icon against the
    // named icon fails if the badge and certificate icons are ever swapped.
    const badgeCard = credentialsSection.querySelector('.pathway-detail-credential-card-badge') as Element;
    const certificateCard = credentialsSection.querySelector(
      '.pathway-detail-credential-card-certificate',
    ) as Element;
    expect(iconPath(badgeCard)).toBe(iconPathOf(WorkspacePremium));
    expect(iconPath(certificateCard)).toBe(iconPathOf(CardMembershipIcon));
    expect(iconPath(badgeCard)).not.toBe(iconPath(certificateCard));
  });

  it('renders the featured pathway certificate first and outside the ordinary credential cards', () => {
    renderPathwayDetailPage();

    const credentialsSection = getSection(messages.credentialsHeading.defaultMessage);
    const grid = credentialsSection.querySelector('#pathway-credentials-list') as HTMLElement;
    const { name } = DATA_ENGINEERING_PATHWAY;
    const featured = grid.firstElementChild as HTMLElement;

    // The distinct class carries the full-width span; the grid order puts it first.
    expect(featured).toHaveClass('pathway-detail-featured-credential');
    expect(credentialsSection.querySelectorAll('.pathway-detail-featured-credential')).toHaveLength(1);
    expect(within(featured).getByText(name)).toBeInTheDocument();
    expect(within(featured).getByText(featuredCertificateLabel)).toBeInTheDocument();
    expect(iconPath(featured)).toBe(iconPathOf(CardMembershipIcon));
    // Ordinary credential counts and See more ignore the featured card.
    expect(featured).not.toHaveClass('pathway-detail-credential-card');
  });

  it('omits the featured certificate when the pathway has no certificate label', () => {
    mockCertificateLabel = null;
    renderPathwayDetailPage();

    const credentialsSection = getSection(messages.credentialsHeading.defaultMessage);

    expect(credentialsSection.querySelector('.pathway-detail-featured-credential')).not.toBeInTheDocument();
    expect(credentialsSection.querySelectorAll('.pathway-detail-credential-card')).toHaveLength(INITIAL_VISIBLE_COUNT);
  });

  it('keeps course disclosures independent', async () => {
    renderPathwayDetailPage();

    const aboutSection = getSection(messages.aboutHeading.defaultMessage);
    const { courses } = DATA_ENGINEERING_PATHWAY;

    // Closed initially: each trigger is a button that reports itself collapsed
    // and its body is unmounted. Course descriptions are identical fixture
    // lorem ipsum, so all body assertions are scoped to one collapsible card.
    const firstCourseTrigger = within(aboutSection).getByRole('button', {
      name: (name) => name.includes(courses[0].title),
    });
    const secondCourseTrigger = within(aboutSection).getByRole('button', {
      name: (name) => name.includes(courses[1].title),
    });
    const firstCourse = firstCourseTrigger.closest('.collapsible-card') as HTMLElement;
    const secondCourse = secondCourseTrigger.closest('.collapsible-card') as HTMLElement;
    expect(firstCourseTrigger).toHaveAttribute('aria-expanded', 'false');
    expect(secondCourseTrigger).toHaveAttribute('aria-expanded', 'false');
    expect(within(firstCourse).queryByText(courses[0].courseAboutData.shortDescription)).not.toBeInTheDocument();

    // Opening one course mounts only its body.
    await userEvent.click(firstCourseTrigger);
    expect(firstCourseTrigger).toHaveAttribute('aria-expanded', 'true');
    expect(secondCourseTrigger).toHaveAttribute('aria-expanded', 'false');
    expect(within(firstCourse).getByText(courses[0].courseAboutData.shortDescription)).toBeVisible();
    expect(within(firstCourse).getByRole('button', { name: messages.learnMoreBtn.defaultMessage })).toBeEnabled();
    expect(within(secondCourse).queryByText(courses[1].courseAboutData.shortDescription)).not.toBeInTheDocument();

    // Opening a second course keeps the first open.
    await userEvent.click(secondCourseTrigger);
    expect(firstCourseTrigger).toHaveAttribute('aria-expanded', 'true');
    expect(secondCourseTrigger).toHaveAttribute('aria-expanded', 'true');
    expect(within(firstCourse).getByText(courses[0].courseAboutData.shortDescription)).toBeVisible();
    expect(within(secondCourse).getByText(courses[1].courseAboutData.shortDescription)).toBeVisible();
  });

  it('expands embedded fixture courses without leaking host fallback copy', () => {
    // Field completeness, pass-through and neutral defaults are owned by
    // src/course-about/__tests__/fallback.test.ts; this keeps the host-leak guard.
    const expandedCourses = DATA_ENGINEERING_PATHWAY.courses.map(
      (course) => expandCourseAboutData(course.courseAboutData),
    );
    const expandedFixture = JSON.stringify(expandedCourses);

    // No other suite owns this: the flag is what makes SidebarDetails hide the
    // start row, so every expanded course must keep the default.
    expandedCourses.forEach((expanded) => {
      expect(expanded.startDateIsStillDefault).toBe(true);
    });

    ['MIT OpenLearning', '1234', 'Free', 'Mar 3, 2027', '2027-03-03', '4-6 hours per week'].forEach((copy) => {
      expect(expandedFixture).not.toContain(copy);
    });

    // Build-time template markers must never survive into expanded copy.
    expect(expandedFixture).not.toMatch(/\{\{|\$\{/);
  });

  describe('course modal', () => {
    const getDialog = (courseTitle: string) => (
      screen.getByRole('dialog', { name: `Learn more about ${courseTitle}` })
    );

    const openModal = async (courseIndex = 0) => {
      renderPathwayDetailPage();
      const course = DATA_ENGINEERING_PATHWAY.courses[courseIndex];
      const aboutSection = getSection(messages.aboutHeading.defaultMessage);
      const trigger = within(aboutSection).getByRole('button', {
        name: (name) => name.includes(course.title),
      });
      await userEvent.click(trigger);
      const collapsible = trigger.closest('.collapsible-card') as HTMLElement;
      await userEvent.click(
        within(collapsible).getByRole('button', { name: messages.learnMoreBtn.defaultMessage }),
      );
      return getDialog(course.title);
    };

    it('opens a dialog with the selected course\'s embedded About content', async () => {
      const course = DATA_ENGINEERING_PATHWAY.courses[0];
      const dialog = await openModal();

      expect(dialog).toBeInTheDocument();
      expect(within(dialog).getByRole('heading', { level: 1, name: course.title })).toBeInTheDocument();
      // The intro section and the overview's first paragraph share the fixture
      // lorem copy, so assert the shared text is present without a unique match.
      expect(within(dialog).getAllByText(course.courseAboutData.shortDescription).length).toBeGreaterThanOrEqual(1);
      // Overview HTML is specific to the fixture (not the short description).
      expect(within(dialog).getByText(/Duis aute irure/)).toBeInTheDocument();
      // The sidebar renders from the expanded record rather than the fixture.
      expect(within(dialog).getByText(sidebarDetailsMessages.courseNumber.defaultMessage)).toBeInTheDocument();

      // The structured overview renders its fixture sections.
      const overviewCard = within(dialog)
        .getByRole('heading', { level: 2, name: 'About This Course' })
        .closest('.pgn__card') as HTMLElement;
      expect(within(overviewCard).getByRole('heading', { level: 2, name: 'Requirements' })).toBeInTheDocument();
      expect(within(overviewCard).getByRole('heading', { level: 2, name: 'Frequently Asked Questions' }))
        .toBeInTheDocument();
    });

    it('shows the pathway context banner with the pathway name bold', async () => {
      const dialog = await openModal();
      const { name: pathwayName } = DATA_ENGINEERING_PATHWAY;

      // The banner title renders as a non-heading element (compact bar).
      const banner = within(dialog).getByText(
        (_, element) => element?.tagName === 'P'
          && element.textContent === `This course is a part of the ${pathwayName} pathway.`,
      );
      const boldPathwayName = within(banner).getByText(pathwayName);
      expect(boldPathwayName.tagName).toBe('STRONG');
    });

    it('renders no enrollment or view-course actions inside the dialog', async () => {
      const dialog = await openModal();

      expect(within(dialog).queryByRole('button', { name: /enroll/i })).not.toBeInTheDocument();
      expect(within(dialog).queryByRole('button', { name: /view course/i })).not.toBeInTheDocument();
      // hideActions removes the intro action footer entirely.
      expect(dialog.querySelector('.card-footer')).not.toBeInTheDocument();
    });

    it('closes via the close button and Escape without changing the URL', async () => {
      const course = DATA_ENGINEERING_PATHWAY.courses[0];
      const dialog = await openModal();
      const { pathname, hash, search } = window.location;

      await userEvent.click(within(dialog).getByRole('button', { name: 'Close' }));
      expect(screen.queryByRole('dialog', { name: `Learn more about ${course.title}` })).not.toBeInTheDocument();
      expect(window.location.pathname).toBe(pathname);
      expect(window.location.hash).toBe(hash);
      expect(window.location.search).toBe(search);

      // Reopening still works after a close, and Escape closes again.
      const aboutSection = getSection(messages.aboutHeading.defaultMessage);
      const collapsible = within(aboutSection)
        .getByRole('button', { name: (name) => name.includes(course.title) })
        .closest('.collapsible-card') as HTMLElement;
      await userEvent.click(within(collapsible).getByRole('button', { name: messages.learnMoreBtn.defaultMessage }));
      const reopened = getDialog(course.title);
      expect(reopened).toBeInTheDocument();
      await userEvent.keyboard('{Escape}');
      expect(screen.queryByRole('dialog', { name: `Learn more about ${course.title}` })).not.toBeInTheDocument();
      expect(window.location.pathname).toBe(pathname);
      expect(window.location.hash).toBe(hash);
      expect(window.location.search).toBe(search);
    });

    it('shares the selected course About URL, not the pathway URL, from the modal', async () => {
      const course = DATA_ENGINEERING_PATHWAY.courses[0];
      const courseAboutPath = `/catalog/courses/${course.id}/about`;
      const expectedCourseUrl = new URL(courseAboutPath, getSiteConfig().baseUrl).href;
      mockResolveRouteByRole.mockReturnValue({ url: courseAboutPath, isInternal: true });
      // A hash on the pathway URL must never leak into the modal share target.
      window.history.replaceState(null, '', '/catalog/pathways/pathway-1#credentials');

      const dialog = await openModal();

      // The social Adapter's region renders while a target is resolvable; the
      // unresolvable case is asserted by its own test below.
      expect(within(dialog).getByLabelText(
        sidebarSocialMessages.socialSharingOptionsAriaLabel.defaultMessage,
      )).toBeInTheDocument();

      expect(mockResolveRouteByRole).toHaveBeenCalledWith(courseAboutRole, {
        courseId: course.id,
      });

      const getShareUrl = (label: string) => {
        const link = within(dialog).getByText(label).closest('a');
        expect(link).not.toBeNull();
        return new URL((link as HTMLAnchorElement).href);
      };

      const facebookUrl = getShareUrl(sidebarSocialMessages.socialSharingFacebook.defaultMessage);
      expect(facebookUrl.origin).toBe('https://www.facebook.com');
      expect(facebookUrl.pathname).toBe('/sharer/sharer.php');
      const facebookTarget = facebookUrl.searchParams.get('u') ?? '';
      expect(facebookTarget).toBe(expectedCourseUrl);
      expect(facebookTarget).not.toContain('/pathways/');

      const tweetText = getShareUrl(sidebarSocialMessages.socialSharingTwitter.defaultMessage)
        .searchParams.get('text') ?? '';
      expect(tweetText).toContain(course.courseAboutData.displayNumberWithDefault);
      expect(tweetText).toContain(course.title);
      expect(tweetText).toContain(expectedCourseUrl);
      expect(tweetText).not.toContain('/pathways/');
      expect(tweetText).not.toContain('#credentials');

      const emailUrl = getShareUrl(sidebarSocialMessages.socialSharingEmail.defaultMessage);
      expect(emailUrl.protocol).toBe('mailto:');
      const emailBody = emailUrl.searchParams.get('body') ?? '';
      expect(emailBody).toContain(course.courseAboutData.displayNumberWithDefault);
      expect(emailBody).toContain(course.title);
      expect(emailBody).toContain(expectedCourseUrl);
      expect(emailBody).not.toContain('/pathways/');
      expect(emailBody).not.toContain('#credentials');
    });

    it('omits the modal social controls when the course About route cannot be resolved', async () => {
      const course = DATA_ENGINEERING_PATHWAY.courses[0];
      mockResolveRouteByRole.mockReturnValue(null);

      const dialog = await openModal();

      expect(within(dialog).queryByText(sidebarSocialMessages.socialSharingTwitter.defaultMessage))
        .not.toBeInTheDocument();
      expect(within(dialog).queryByText(sidebarSocialMessages.socialSharingFacebook.defaultMessage))
        .not.toBeInTheDocument();
      expect(within(dialog).queryByText(sidebarSocialMessages.socialSharingEmail.defaultMessage))
        .not.toBeInTheDocument();
      // The social Adapter's region itself is absent, not merely rendered empty.
      expect(within(dialog).queryByLabelText(
        sidebarSocialMessages.socialSharingOptionsAriaLabel.defaultMessage,
      )).not.toBeInTheDocument();
      // The rest of the course content still renders, and pathway-level sharing is untouched.
      expect(within(dialog).getByRole('heading', { level: 1, name: course.title })).toBeInTheDocument();
      expect(screen.getByText(messages.shareFacebookLabel.defaultMessage)).toBeInTheDocument();
    });
  });

  describe('navigation scrollspy', () => {
    beforeEach(() => {
      mockNavHeight('56px');
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('picks the active section nearest the boundary with deterministic tie-breaking', () => {
      renderPathwayDetailPage();
      const about = document.getElementById('about') as HTMLElement;
      const credentials = document.getElementById('credentials') as HTMLElement;

      // The nearest section wins over a more recently reported one.
      setSectionTop(credentials, 56);
      setSectionTop(about, 250);
      fireIntersections(
        makeEntry(credentials, true),
        makeEntry(about, true),
      );
      expect(screen.getByRole('link', { name: messages.credentialsNavLink.defaultMessage }))
        .toHaveAttribute('aria-current', 'location');
      expect(screen.getByRole('link', { name: messages.aboutNavLink.defaultMessage }))
        .not.toHaveAttribute('aria-current');

      // Once credentials scrolls past the boundary, About becomes active.
      setSectionTop(credentials, -100);
      setSectionTop(about, 56);
      fireIntersections(
        makeEntry(credentials, false),
        makeEntry(about, true),
      );
      expect(screen.getByRole('link', { name: messages.aboutNavLink.defaultMessage }))
        .toHaveAttribute('aria-current', 'location');
      expect(screen.getByRole('link', { name: messages.credentialsNavLink.defaultMessage }))
        .not.toHaveAttribute('aria-current');

      // Equal distances keep the first section in navigation order.
      setSectionTop(about, 56);
      setSectionTop(credentials, 56);
      fireIntersections(
        makeEntry(about, true),
        makeEntry(credentials, true),
      );
      expect(screen.getByRole('link', { name: messages.aboutNavLink.defaultMessage }))
        .toHaveAttribute('aria-current', 'location');

      // Sections that stopped intersecting are ignored.
      setSectionTop(about, -100);
      setSectionTop(credentials, 56);
      fireIntersections(
        makeEntry(about, false),
        makeEntry(credentials, true),
      );
      expect(screen.getByRole('link', { name: messages.credentialsNavLink.defaultMessage }))
        .toHaveAttribute('aria-current', 'location');

      // With no intersecting section the current active link is kept.
      setSectionTop(about, -10);
      setSectionTop(credentials, -20);
      fireIntersections(
        makeEntry(about, false),
        makeEntry(credentials, false),
      );
      expect(screen.getByRole('link', { name: messages.credentialsNavLink.defaultMessage }))
        .toHaveAttribute('aria-current', 'location');
    });

    it('re-reads section geometry fresh instead of trusting cached entry geometry', () => {
      renderPathwayDetailPage();
      const about = document.getElementById('about') as HTMLElement;
      const credentials = document.getElementById('credentials') as HTMLElement;
      setSectionTop(credentials, 56);
      setSectionTop(about, 250);
      fireIntersections(makeEntry(credentials, true), makeEntry(about, true));
      expect(screen.getByRole('link', { name: messages.credentialsNavLink.defaultMessage }))
        .toHaveAttribute('aria-current', 'location');

      // The page scrolls: About crosses the boundary while credentials falls
      // below it. The observer reports only the About change; credentials' old
      // entry geometry (top 56) is stale. Only a fresh getBoundingClientRect
      // read of both sections picks About.
      setSectionTop(credentials, 250);
      setSectionTop(about, 56);
      fireIntersections(makeEntry(about, true));

      expect(screen.getByRole('link', { name: messages.aboutNavLink.defaultMessage }))
        .toHaveAttribute('aria-current', 'location');
      expect(screen.getByRole('link', { name: messages.credentialsNavLink.defaultMessage }))
        .not.toHaveAttribute('aria-current');
    });

    it('synchronizes the hash only when it does not already match the active section', () => {
      window.history.replaceState(null, '', '/catalog/pathways/pathway-1?tab=courses');
      const { unmount } = renderPathwayDetailPage();
      const replaceState = jest.spyOn(window.history, 'replaceState');
      const firstCredentials = document.getElementById('credentials') as HTMLElement;
      setSectionTop(firstCredentials, 56);

      fireIntersections(makeEntry(firstCredentials, true));

      expect(replaceState).toHaveBeenCalledTimes(1);
      expect(replaceState).toHaveBeenCalledWith(null, '', '/catalog/pathways/pathway-1?tab=courses#credentials');

      // Re-mounting directly on the active hash must not replace it again.
      unmount();
      window.history.replaceState(null, '', '/catalog/pathways/pathway-1#credentials');
      replaceState.mockClear();
      renderPathwayDetailPage();
      const credentials = document.getElementById('credentials') as HTMLElement;
      setSectionTop(credentials, 56);

      fireIntersections(makeEntry(credentials, true));

      expect(replaceState).not.toHaveBeenCalled();
      replaceState.mockRestore();
    });

    it('derives the rootMargin from the nav-height CSS custom property', () => {
      // 56px boundary from the beforeEach mock.
      renderPathwayDetailPage();
      expect(getObserver().options.rootMargin).toBe('-56px 0px 0px 0px');

      // Without the stylesheet value the observer falls back to a safe offset.
      jest.restoreAllMocks();
      renderPathwayDetailPage();
      expect(getObserver().options.rootMargin).toBe('-0px 0px 0px 0px');
    });

    it('writes the measured panel height to the page and rebuilds the observer', () => {
      renderPathwayDetailPage();

      const page = document.querySelector('.pathway-detail-page') as HTMLElement;
      const nav = document.querySelector('.pathway-detail-nav') as HTMLElement;

      // With no layout (jsdom) the stylesheet value stays in place.
      expect(getObserver().options.rootMargin).toBe('-56px 0px 0px 0px');
      expect(page.style.getPropertyValue('--pathway-detail-nav-height')).toBe('');

      jest.spyOn(nav, 'getBoundingClientRect').mockReturnValue({ height: 148 } as DOMRect);
      act(() => {
        window.dispatchEvent(new Event('resize'));
      });

      // The measured height lands on the page element the sections read.
      expect(page.style.getPropertyValue('--pathway-detail-nav-height')).toBe('148px');
      expect(getObserver().options.rootMargin).toBe('-148px 0px 0px 0px');
      // Rebuilt once, without leaking the previous observer.
      expect(MockIntersectionObserver.instances).toHaveLength(2);
      expect(MockIntersectionObserver.instances[0].disconnect).toHaveBeenCalled();

      // An unchanged height must not rebuild again.
      act(() => {
        window.dispatchEvent(new Event('resize'));
      });
      expect(MockIntersectionObserver.instances).toHaveLength(2);
    });

    it('observes each of the two sections once and disconnects on unmount', () => {
      const { unmount } = renderPathwayDetailPage();
      const observer = getObserver();

      expect(observer.observe).toHaveBeenCalledTimes(2);
      expect(observer.observe.mock.calls.map(([section]) => (section as HTMLElement).id)).toEqual([
        'about',
        'credentials',
      ]);

      unmount();
      expect(observer.disconnect).toHaveBeenCalledTimes(1);
    });
  });

  it('renders pathway share links for the current URL, including observer-driven hash changes', () => {
    window.history.replaceState(null, '', '/catalog/pathways/pathway-1');
    renderPathwayDetailPage();
    const { name: pathwayName } = DATA_ENGINEERING_PATHWAY;

    const expectShareLinks = (shareUrl: string) => {
      const facebookLink = screen.getByText(messages.shareFacebookLabel.defaultMessage).closest('a');
      expect(facebookLink).toHaveAttribute(
        'href',
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      );

      const tweetText = `Check out the ${pathwayName} pathway: ${shareUrl}`;
      const twitterLink = screen.getByText(messages.shareTwitterLabel.defaultMessage).closest('a');
      expect(twitterLink).toHaveAttribute(
        'href',
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`,
      );

      const emailLink = screen.getByText(messages.shareEmailLabel.defaultMessage).closest('a');
      expect(emailLink).toHaveAttribute(
        'href',
        `mailto:?subject=${encodeURIComponent(`The ${pathwayName} pathway`)}`
        + `&body=${encodeURIComponent(`I found the ${pathwayName} pathway and thought you might be interested: ${shareUrl}`)}`,
      );

      // Learner-visible order is the shared Module's canonical one.
      const shareGroup = screen.getByRole('group', { name: messages.shareHeading.defaultMessage });
      const destinations = within(shareGroup).getAllByRole('link').map((link) => link.getAttribute('href') ?? '');
      expect(destinations).toHaveLength(3);
      expect(destinations[0]).toContain('https://twitter.com/intent/tweet?text=');
      expect(destinations[1]).toContain('https://www.facebook.com/sharer/sharer.php?u=');
      expect(destinations[2]).toContain('mailto:?subject=');
    };

    expectShareLinks(window.location.href);

    // The re-render triggered by the active-section change must build share
    // URLs from the already-synchronized location, not a stale href.
    const credentials = document.getElementById('credentials') as HTMLElement;
    setSectionTop(credentials, 56);

    fireIntersections(makeEntry(credentials, true));

    const shareUrl = window.location.href;
    expect(shareUrl).toBe('http://localhost/catalog/pathways/pathway-1#credentials');
    expectShareLinks(shareUrl);
  });
});
