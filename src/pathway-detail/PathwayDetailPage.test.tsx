import { useState } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import {
  act, fireEvent, render as rtlRender, screen, waitFor, within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider, onlineManager } from '@tanstack/react-query';
import {
  EnvironmentTypes, getAppConfig, getSiteConfig, IntlProvider, resolveRouteByRole, setSiteConfig,
} from '@openedx/frontend-base';
import { Icon } from '@openedx/paragon';
import {
  AccessTimeFilled as AccessTimeFilledIcon,
  CardMembership as CardMembershipIcon,
  Event as EventIcon,
  ExpandLess,
  ExpandMore,
  FormatListBulleted as FormatListBulletedIcon,
  MenuBook as MenuBookIcon,
  MonetizationOn as MonetizationOnIcon,
  WorkspacePremium,
} from '@openedx/paragon/icons';
import { mockCourseAboutResponse } from '@src/__mocks__';
import noCourseImg from '@src/assets/images/no-course-image.svg';
import { appId, courseAboutRole } from '@src/constants';
import { fetchCourseAboutData } from '@src/course-about/data/api';
import sidebarDetailsMessages from '@src/course-about/course-sidebar/sidebar-details/messages';
import sidebarSocialMessages from '@src/course-about/course-sidebar/sidebar-social/messages';
import courseAboutMessages from '@src/course-about/messages';

import { PathwayAboutSection } from './PathwayAboutSection';
import PathwayDetailPage from './PathwayDetailPage';
import { INITIAL_VISIBLE_COUNT } from './sections';
import { DATA_ENGINEERING_PATHWAY, getPathwayDetail } from './data';
import messages from './messages';
import type { PathwayCourse, PathwayFact } from './types';

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

// The course modal fetches the full Course About record for the course it opens.
jest.mock('@src/course-about/data/api', () => ({
  ...jest.requireActual('@src/course-about/data/api'),
  fetchCourseAboutData: jest.fn(),
}));

const mockResolveRouteByRole = resolveRouteByRole as jest.Mock;
const mockFetchCourseAboutData = fetchCourseAboutData as jest.Mock;

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

const PathwayDetailPageWithQuery = () => {
  // A client per render: a shared cache would let a later test skip the fetch.
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { retry: false } },
  }));
  return (
    <QueryClientProvider client={queryClient}>
      <PathwayDetailPage />
    </QueryClientProvider>
  );
};

const renderPathwayDetailPage = () => rtlRender(
  <IntlProvider locale="en">
    <MemoryRouter initialEntries={[`/catalog/pathways/${DATA_ENGINEERING_PATHWAY.id}`]}>
      <Routes>
        <Route path="/catalog/pathways/:pathwayId" element={<PathwayDetailPageWithQuery />} />
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
    mockResolveRouteByRole.mockReset().mockReturnValue(null);
    mockFetchCourseAboutData.mockReset().mockResolvedValue(mockCourseAboutResponse);
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
    // Only the count phrase is emphasised; the rest of the note stays plain text.
    const countPhrase = screen.getByText(`${DATA_ENGINEERING_PATHWAY.courses.length} courses`);
    expect(countPhrase.tagName).toBe('STRONG');
    // The bold phrase is nested in the note's own span, which is the single flex
    // item beside the icon: the Stack gap must not split the sentence.
    expect(countPhrase.parentElement?.tagName).toBe('SPAN');
    expect(countPhrase.parentElement).toHaveTextContent(
      `Complete these ${DATA_ENGINEERING_PATHWAY.courses.length} courses in any order`,
    );

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

  it('gives each fact kind its own semantic icon', () => {
    renderPathwayDetailPage();

    const factsAside = screen.getByRole('complementary', { name: messages.factsAriaLabel.defaultMessage });
    // Keyed by fact kind, never by the learner-visible label, so copy edits and
    // translations cannot move an icon.
    const expectedPaths: Record<PathwayFact['kind'], ReturnType<typeof iconPath>> = {
      start: iconPathOf(EventIcon),
      courses: iconPathOf(FormatListBulletedIcon),
      price: iconPathOf(MonetizationOnIcon),
      duration: iconPathOf(AccessTimeFilledIcon),
      pace: iconPathOf(MenuBookIcon),
      certificates: iconPathOf(CardMembershipIcon),
      badges: iconPathOf(WorkspacePremium),
    };

    DATA_ENGINEERING_PATHWAY.facts.forEach((fact) => {
      // The label span sits beside its icon inside the fact's icon row.
      const iconRow = within(factsAside).getByText(fact.label).parentElement as HTMLElement;
      expect(iconPath(iconRow)).toBe(expectedPaths[fact.kind]);
      expect(iconRow.querySelector('.pgn__icon')).toHaveClass('text-gray-400');
    });
  });

  it('bolds the count phrase in the singular plural branch too', () => {
    const oneCoursePathway = {
      ...DATA_ENGINEERING_PATHWAY,
      courses: [DATA_ENGINEERING_PATHWAY.courses[0]],
    };

    const { container } = rtlRender(
      <IntlProvider locale="en">
        <PathwayAboutSection pathway={oneCoursePathway} />
      </IntlProvider>,
    );

    const phrase = within(container).getByText('1 course');
    expect(phrase.tagName).toBe('STRONG');
    expect(phrase.parentElement).toHaveTextContent('Complete this 1 course in any order');
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

  it('keeps a single active tab when the scrollspy moves off a clicked section', async () => {
    renderPathwayDetailPage();

    const aboutLink = screen.getByRole('link', { name: messages.aboutNavLink.defaultMessage });
    const credentialsLink = screen.getByRole('link', { name: messages.credentialsNavLink.defaultMessage });
    const aboutSection = document.getElementById('about') as HTMLElement;
    const credentialsSection = document.getElementById('credentials') as HTMLElement;

    // Clicking a tab activates it, and Paragon records its own uncontrolled activeKey.
    await userEvent.click(credentialsLink);
    expect(credentialsLink).toHaveClass('active');

    // Scrolling back up makes About the section nearest the sticky boundary.
    setSectionTop(aboutSection, 240);
    setSectionTop(credentialsSection, 900);
    fireIntersections(makeEntry(aboutSection, true), makeEntry(credentialsSection, true));

    expect(aboutLink).toHaveClass('active');
    expect(aboutLink).toHaveAttribute('aria-current', 'location');
    // The clicked tab must lose its underline once the scrollspy moves away.
    expect(credentialsLink).not.toHaveClass('active');
    expect(credentialsLink).not.toHaveAttribute('aria-current');
    expect(document.querySelectorAll('.pathway-detail-nav-link.active')).toHaveLength(1);
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

    // Both controls sit centred under their list, chevron pointing down.
    const coursesSeeMore = within(aboutSection).getByRole('button', { name: messages.seeMoreBtn.defaultMessage });
    const credentialsSeeMore = within(credentialsSection).getByRole('button', { name: messages.seeMoreBtn.defaultMessage });
    [coursesSeeMore, credentialsSeeMore].forEach((button) => {
      expect(button.parentElement).toHaveClass('justify-content-center');
      expect(iconPath(button)).toBe(iconPathOf(ExpandMore));
    });

    // Expanding courses does not change credentials.
    await userEvent.click(coursesSeeMore);
    expect(within(aboutSection).getByText(courses[7].title)).toBeInTheDocument();
    // The expanded control flips its chevron up.
    expect(iconPath(within(aboutSection).getByRole('button', { name: messages.seeLessBtn.defaultMessage }))).toBe(iconPathOf(ExpandLess));
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

    // Every duration/credential icon in a course row carries the shared info tint.
    const metadataIcons = aboutSection.querySelectorAll('.pathway-detail-course-meta .pgn__icon');
    expect(metadataIcons.length).toBeGreaterThan(0);
    metadataIcons.forEach((icon) => expect(icon).toHaveClass('text-info-800'));
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
        expect(card).toHaveClass('bg-primary-100');
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
    // The featured certificate uses the pathway primary tint, not the neutral card tint.
    expect(featured).toHaveClass('bg-primary-100');
    expect(featured).not.toHaveClass('bg-light-200');
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
    expect(within(firstCourse).queryByText(courses[0].shortDescription)).not.toBeInTheDocument();
    expect(firstCourse).not.toHaveClass('is-open');

    // Opening one course mounts only its body. Paragon marks the open card with
    // is-open, which is what tints it; the root carries no horizontal padding,
    // so the header/body divider it draws reaches both card edges.
    await userEvent.click(firstCourseTrigger);
    expect(firstCourseTrigger).toHaveAttribute('aria-expanded', 'true');
    expect(firstCourse).toHaveClass('is-open');
    expect(firstCourse).toHaveClass('py-2');
    expect(firstCourse).not.toHaveClass('px-3');
    expect(secondCourse).not.toHaveClass('is-open');
    expect(secondCourseTrigger).toHaveAttribute('aria-expanded', 'false');
    expect(within(firstCourse).getByText(courses[0].shortDescription)).toBeVisible();
    expect(within(firstCourse).getByRole('button', { name: messages.learnMoreBtn.defaultMessage })).toBeEnabled();
    expect(within(secondCourse).queryByText(courses[1].shortDescription)).not.toBeInTheDocument();

    // Opening a second course keeps the first open.
    await userEvent.click(secondCourseTrigger);
    expect(firstCourseTrigger).toHaveAttribute('aria-expanded', 'true');
    expect(secondCourseTrigger).toHaveAttribute('aria-expanded', 'true');
    expect(within(firstCourse).getByText(courses[0].shortDescription)).toBeVisible();
    expect(within(secondCourse).getByText(courses[1].shortDescription)).toBeVisible();
  });

  describe('course modal', () => {
    // The offline case flips React Query's online manager; always restore it.
    afterEach(() => {
      onlineManager.setOnline(true);
    });

    const getDialog = (courseTitle: string) => (
      screen.findByRole('dialog', { name: `Learn more about ${courseTitle}` })
    );

    /** Opens the dialog without waiting for its Course About fetch to settle. */
    const openDialog = async (courseIndex = 0) => {
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
      return { course, dialog: await getDialog(course.title) };
    };

    const openModal = async (courseIndex = 0) => {
      const { dialog } = await openDialog(courseIndex);
      return dialog;
    };

    /** Re-opens the dialog from the already expanded course row. */
    const openAgain = async (course: PathwayCourse) => {
      const aboutSection = getSection(messages.aboutHeading.defaultMessage);
      const collapsible = within(aboutSection)
        .getByRole('button', { name: (name) => name.includes(course.title) })
        .closest('.collapsible-card') as HTMLElement;
      await userEvent.click(
        within(collapsible).getByRole('button', { name: messages.learnMoreBtn.defaultMessage }),
      );
      return getDialog(course.title);
    };

    it('keeps the cached Course About content when a refetch fails', async () => {
      const course = DATA_ENGINEERING_PATHWAY.courses[0];
      const dialog = await openModal();
      expect(within(dialog).getByRole('heading', { level: 1, name: mockCourseAboutResponse.name }))
        .toBeInTheDocument();

      await userEvent.click(within(dialog).getByRole('button', { name: 'Close' }));
      expect(screen.queryByRole('dialog', { name: `Learn more about ${course.title}` }))
        .not.toBeInTheDocument();

      // Reopening refetches; a failed refetch must not hide the cached record.
      mockFetchCourseAboutData.mockRejectedValueOnce(new Error('refetch failed'));
      const reopened = await openAgain(course);
      await waitFor(() => expect(mockFetchCourseAboutData).toHaveBeenCalledTimes(2));
      // Let the failed refetch settle before asserting the body survived it.
      await act(async () => {
        await new Promise((resolve) => {
          setTimeout(resolve, 0);
        });
      });

      expect(within(reopened).getByRole('heading', { level: 1, name: mockCourseAboutResponse.name }))
        .toBeInTheDocument();
      expect(within(reopened).queryByRole('alert')).not.toBeInTheDocument();
    });

    it('requests nothing while the dialog is closed', () => {
      renderPathwayDetailPage();

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(mockFetchCourseAboutData).not.toHaveBeenCalled();
    });

    it('fetches the opened course by its course ID and renders the fetched record', async () => {
      const course = DATA_ENGINEERING_PATHWAY.courses[1];
      const dialog = await openModal(1);

      expect(mockFetchCourseAboutData).toHaveBeenCalledTimes(1);
      expect(mockFetchCourseAboutData).toHaveBeenCalledWith(course.id);

      // The dialog chrome names the course from the pathway summary; the body
      // renders the fetched record, not the pathway fixture.
      expect(dialog).toHaveAccessibleName(`Learn more about ${course.title}`);
      expect(within(dialog).getByRole('heading', { level: 1, name: mockCourseAboutResponse.name }))
        .toBeInTheDocument();
      expect(within(dialog).getByText(mockCourseAboutResponse.shortDescription)).toBeInTheDocument();
      expect(within(dialog).getByText('Course overview content')).toBeInTheDocument();
      expect(within(dialog).getByText(sidebarDetailsMessages.courseNumber.defaultMessage)).toBeInTheDocument();
    });

    it('renders the bundled Course About fixture in development without fetching', async () => {
      const realSiteConfig = getSiteConfig();
      setSiteConfig({ ...realSiteConfig, environment: EnvironmentTypes.DEVELOPMENT });

      try {
        const { dialog } = await openDialog();

        // The development shortcut renders the fixture directly, so the shared fetch never runs.
        expect(mockFetchCourseAboutData).not.toHaveBeenCalled();
        expect(within(dialog).getByRole('heading', { level: 1, name: mockCourseAboutResponse.name }))
          .toBeInTheDocument();
        expect(within(dialog).getByText(mockCourseAboutResponse.shortDescription)).toBeInTheDocument();
        expect(within(dialog).getByText('Course overview content')).toBeInTheDocument();
      } finally {
        setSiteConfig(realSiteConfig);
      }
    });

    it('shows an accessible loading state in the dialog while the request is pending', async () => {
      mockFetchCourseAboutData.mockReturnValue(new Promise(() => {}));
      const { dialog } = await openDialog();

      expect(within(dialog).getByRole('status')).toBeInTheDocument();
      // The dialog chrome keeps naming the course from the pathway summary.
      expect(dialog).toHaveAccessibleName(
        `Learn more about ${DATA_ENGINEERING_PATHWAY.courses[0].title}`,
      );
      expect(within(dialog).queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
    });

    it('shows an accessible error alert with support copy and no course content when the request fails', async () => {
      mockFetchCourseAboutData.mockRejectedValue(new Error('boom'));
      const { dialog } = await openDialog();
      const supportEmail = getAppConfig(appId).INFO_EMAIL as string;
      const expectedMessage = courseAboutMessages.errorMessage.defaultMessage
        .replace('{supportEmail}', supportEmail);

      expect(expectedMessage).not.toBe('');
      expect(await within(dialog).findByRole('alert')).toHaveTextContent(expectedMessage);
      expect(within(dialog).getByText(expectedMessage)).toBeVisible();
      expect(within(dialog).queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
      expect(within(dialog).queryByRole('status')).not.toBeInTheDocument();
    });

    it('shows a loading state instead of a blank body while the query cannot start', async () => {
      // Offline: React Query pauses the query, so it is pending but not fetching.
      onlineManager.setOnline(false);
      const { dialog } = await openDialog();

      expect(within(dialog).getByRole('status')).toBeInTheDocument();
      expect(mockFetchCourseAboutData).not.toHaveBeenCalled();
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
      const reopened = await getDialog(course.title);
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
      expect(tweetText).toContain(mockCourseAboutResponse.displayNumberWithDefault);
      expect(tweetText).toContain(mockCourseAboutResponse.name);
      expect(tweetText).toContain(expectedCourseUrl);
      expect(tweetText).not.toContain('/pathways/');
      expect(tweetText).not.toContain('#credentials');

      const emailUrl = getShareUrl(sidebarSocialMessages.socialSharingEmail.defaultMessage);
      expect(emailUrl.protocol).toBe('mailto:');
      const emailBody = emailUrl.searchParams.get('body') ?? '';
      expect(emailBody).toContain(mockCourseAboutResponse.displayNumberWithDefault);
      expect(emailBody).toContain(mockCourseAboutResponse.name);
      expect(emailBody).toContain(expectedCourseUrl);
      expect(emailBody).not.toContain('/pathways/');
      expect(emailBody).not.toContain('#credentials');
    });

    it('omits the modal social controls when the course About route cannot be resolved', async () => {
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
      expect(within(dialog).getByRole('heading', { level: 1, name: mockCourseAboutResponse.name }))
        .toBeInTheDocument();
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
