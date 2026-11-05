import { type ComponentType, type ReactElement, useState } from 'react';
import {
  MemoryRouter, Route, Routes, useNavigate,
} from 'react-router-dom';
import {
  act, fireEvent, render as rtlRender, renderHook, screen, waitFor, within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getSiteConfig, IntlProvider } from '@openedx/frontend-base';
import { Icon } from '@openedx/paragon';
import {
  AccessTimeFilled as AccessTimeFilledIcon,
  Event as EventIcon,
  ExpandLess,
  ExpandMore,
  FormatListBulleted as FormatListBulletedIcon,
  MenuBook as MenuBookIcon,
  MonetizationOn as MonetizationOnIcon,
  WorkspacePremium,
} from '@openedx/paragon/icons';
import { mockPathwayDetailData } from '@src/__mocks__';
import noCourseImg from '@src/assets/images/no-course-image.svg';
import { getStringConfig } from '@src/config';

import { PathwayAboutSection } from './PathwayAboutSection';
import PathwayDetailPage from './PathwayDetailPage';
import { usePathwayNavigation } from './hooks/usePathwayNavigation';
import { INITIAL_VISIBLE_COUNT } from './sections';
import { fetchPathwayDetail } from './data/api';
import { CertificateIcon, CourseContentIcon } from './icons';
import messages from './messages';
import type { PathwayCourse, PathwayFact } from './types';

let mockIsEnrolled: boolean | undefined;

/** `null` renders the pathway without its optional certificate label. */
let mockCertificateLabel: string | null | undefined;

/** `null` renders the pathway without its start date; any string is passed through verbatim. */
let mockStart: string | null | undefined;

jest.mock('./data/api', () => ({
  ...jest.requireActual('./data/api'),
  fetchPathwayDetail: jest.fn(),
}));

const mockFetchPathwayDetail = fetchPathwayDetail as jest.Mock;

/**
 * The shared sample record with the per-test variants applied: enrollment, the
 * optional certificate label, and the optional start date. The id always comes
 * from the requested route id.
 */
const pathwayFor = (pathwayId: string) => {
  const { certificateLabel, start, ...rest } = mockPathwayDetailData;
  const label = mockCertificateLabel === undefined ? certificateLabel : mockCertificateLabel;
  const startValue = mockStart === undefined ? start : mockStart;
  return {
    ...rest,
    id: pathwayId,
    ...(mockIsEnrolled === undefined ? {} : { isEnrolled: mockIsEnrolled }),
    ...(label ? { certificateLabel: label } : {}),
    ...(startValue ? { start: startValue } : {}),
  };
};

const getSection = (heading: string) => (
  screen.getByRole('heading', { name: heading }).closest('section') as HTMLElement
);

/** The fixture's featured certificate label. */
const featuredCertificateLabel = mockPathwayDetailData.certificateLabel as string;

/** A credential's secondary line; the fixture stores only the course name. */
const credentialCourseTitle = (courseTitle: string) => (
  messages.credentialCourseTitle.defaultMessage.replace('{title}', courseTitle)
);

/** The page URL each share destination carries, decoded from its own encoding. */
const decodedShareUrls = (): string[] => {
  const { name } = mockPathwayDetailData;
  const shareGroup = screen.getByRole('group', { name: messages.shareHeading.defaultMessage });
  const [twitter, facebook, email] = within(shareGroup)
    .getAllByRole('link')
    .map((link) => new URL(link.getAttribute('href') as string));

  return [
    (twitter.searchParams.get('text') as string).replace(`Check out the ${name} pathway: `, ''),
    facebook.searchParams.get('u') as string,
    (email.searchParams.get('body') as string).replace(
      `I found the ${name} pathway and thought you might be interested: `,
      '',
    ),
  ];
};

/** Path data of the icon rendered inside an element. */
const iconPath = (container: Element) => container.querySelector('.pgn__icon svg path')?.getAttribute('d');

/** The same path data for an icon rendered alone, so assertions name the icon, not its markup. */
const iconPathOf = (icon: ComponentType) => {
  const { container, unmount } = rtlRender(<Icon src={icon} size="lg" />);
  const path = iconPath(container);
  unmount();
  return path;
};

/** Path data of the first path in an SVG, whether Paragon's Icon wraps it or not. */
const svgPath = (container: Element) => container.querySelector('svg path')?.getAttribute('d');

/** The same path data for a custom icon component rendered alone. */
const svgPathOf = (element: ReactElement) => {
  const { container, unmount } = rtlRender(element);
  const path = svgPath(container);
  unmount();
  return path;
};

const PathwayDetailPageWithQuery = ({ queryClient }: { queryClient?: QueryClient }) => {
  // A client per render: a shared cache would let a later test skip the fetch.
  const [renderClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { retry: false } },
  }));
  return (
    <QueryClientProvider client={queryClient ?? renderClient}>
      <PathwayDetailPage />
    </QueryClientProvider>
  );
};

/** Renders the page on the fixture route without waiting, to observe loading and failure states. */
const renderPathwayDetailPageWithoutWaiting = (queryClient?: QueryClient) => rtlRender(
  <IntlProvider locale="en">
    <MemoryRouter initialEntries={[`/catalog/pathways/${mockPathwayDetailData.id}`]}>
      <Routes>
        <Route
          path="/catalog/pathways/:pathwayId"
          element={<PathwayDetailPageWithQuery queryClient={queryClient} />}
        />
      </Routes>
    </MemoryRouter>
  </IntlProvider>,
);

/**
 * Renders the page on the fixture route and waits for the loaded view: the page
 * fetches its record before it can render any section.
 */
const renderPathwayDetailPage = async (queryClient?: QueryClient) => {
  const view = renderPathwayDetailPageWithoutWaiting(queryClient);
  // Scoped to this render: a still-mounted earlier view would answer for it.
  await within(view.container).findByRole('heading', { level: 1, name: mockPathwayDetailData.name });
  return view;
};

const SWITCH_LABEL = 'open the other pathway';

/**
 * In-app route switch for cached pathways: the button navigates to another id on
 * the same route, so the route element keeps its identity and only the page's
 * keyed subtree can reset what the sections had expanded.
 */
const PathwaySwitchHarness = ({ queryClient, toId }: { queryClient: QueryClient; toId: string }) => {
  const navigate = useNavigate();
  return (
    <QueryClientProvider client={queryClient}>
      <button type="button" onClick={() => navigate(`/catalog/pathways/${toId}`)}>{SWITCH_LABEL}</button>
      <Routes>
        <Route path="/catalog/pathways/:pathwayId" element={<PathwayDetailPage />} />
      </Routes>
    </QueryClientProvider>
  );
};

const renderCachedPathwaySwitch = (queryClient: QueryClient, fromId: string, toId: string) => rtlRender(
  <IntlProvider locale="en">
    <MemoryRouter initialEntries={[`/catalog/pathways/${fromId}`]}>
      <PathwaySwitchHarness queryClient={queryClient} toId={toId} />
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
    mockFetchPathwayDetail.mockReset();
    mockFetchPathwayDetail.mockImplementation((pathwayId: string) => Promise.resolve(
      pathwayId.trim() ? pathwayFor(pathwayId) : null,
    ));
    mockIsEnrolled = undefined;
    mockCertificateLabel = undefined;
    mockStart = undefined;
    window.history.replaceState(null, '', `/catalog/pathways/${mockPathwayDetailData.id}`);
    MockIntersectionObserver.instances = [];
    Object.defineProperty(globalThis, 'IntersectionObserver', {
      writable: true,
      value: MockIntersectionObserver,
    });
  });

  it('sets the document title to the pathway name and the configured site name', async () => {
    await renderPathwayDetailPage();

    await waitFor(() => {
      expect(document.title).toBe(
        messages.pageTitle.defaultMessage
          .replace('{pathwayName}', mockPathwayDetailData.name)
          .replace('{siteName}', getSiteConfig().siteName),
      );
    });
  });

  it('renders the not-found page and keeps navigation inert when the route has no pathway id', () => {
    const address = window.location.href;
    rtlRender(
      <IntlProvider locale="en">
        <MemoryRouter initialEntries={['/catalog/pathways']}>
          <Routes>
            <Route path="/catalog/pathways" element={<PathwayDetailPageWithQuery />} />
          </Routes>
        </MemoryRouter>
      </IntlProvider>,
    );

    expect(screen.getByTestId('not-found-page')).toHaveTextContent(messages.notFound.defaultMessage);
    // A route with no id never starts a query, so nothing is fetched or pending.
    expect(mockFetchPathwayDetail).not.toHaveBeenCalled();
    expect(document.querySelector('.pathway-detail-nav')).not.toBeInTheDocument();
    // The hook exits before observing anything: there is no page layout to drive.
    expect(MockIntersectionObserver.instances).toHaveLength(0);
    // Navigation derives from the address; a route with no pathway never rewrites it.
    expect(window.location.href).toBe(address);
  });

  it('renders the sample pathway record for the route pathway ID', async () => {
    await renderPathwayDetailPage();

    expect(screen.getByRole('heading', { level: 1, name: mockPathwayDetailData.name })).toBeInTheDocument();
    expect(screen.getByText(mockPathwayDetailData.organization)).toBeInTheDocument();
    expect(screen.getByText(mockPathwayDetailData.description)).toBeInTheDocument();
    expect(screen.getByText(messages.pathwayBadge.defaultMessage)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: mockPathwayDetailData.name })).toBeInTheDocument();

    [
      messages.aboutHeading,
      messages.credentialsHeading,
    ].forEach((message) => {
      expect(screen.getByRole('heading', { name: message.defaultMessage })).toBeInTheDocument();
    });

    const factsAside = screen.getByRole('complementary', { name: messages.factsAriaLabel.defaultMessage });
    expect(within(factsAside).getByRole('group', { name: messages.shareHeading.defaultMessage })).toBeInTheDocument();

    // Both columns stack full width, then split 8/1/3 from lg: the sidebar's
    // offset is the gap that keeps it flush right.
    const sidebarColumn = factsAside.parentElement as HTMLElement;
    const mainColumn = sidebarColumn.parentElement?.firstElementChild as HTMLElement;
    expect(mainColumn).toHaveClass('col-12', 'col-lg-8');
    expect(mainColumn).not.toHaveClass('offset-lg-1');
    expect(sidebarColumn).toHaveClass('col-12', 'col-lg-3', 'offset-lg-1');
    // Only badges use a Paragon icon; certificate cards carry the custom image.
    expect(document.querySelectorAll('.pathway-detail-credential-card .pgn__icon')).toHaveLength(
      mockPathwayDetailData.credentials
        .slice(0, INITIAL_VISIBLE_COUNT)
        .filter((credential) => credential.kind === 'badge').length,
    );

    const sectionNav = screen.getByRole('navigation', { name: messages.sectionsNavLabel.defaultMessage });
    expect(within(sectionNav).getAllByRole('link')).toHaveLength(2);
    [
      { message: messages.aboutNavLink, hash: '#about' },
      { message: messages.credentialsNavLink, hash: '#credentials' },
    ].forEach(({ message, hash }) => {
      expect(screen.getByRole('link', { name: message.defaultMessage })).toHaveAttribute('href', hash);
    });

    expect(screen.getByText(mockPathwayDetailData.facts[0].value)).toBeInTheDocument();

    // Counts shown to the learner stay in sync with the fixture, not hardcoded copy.
    const coursesFact = mockPathwayDetailData.facts.find((fact) => fact.label === 'Courses');
    expect(coursesFact?.value).toBe(String(mockPathwayDetailData.courses.length));
    // Only the count phrase is emphasised; the rest of the note stays plain text.
    const countPhrase = screen.getByText(`${mockPathwayDetailData.courses.length} courses`);
    expect(countPhrase.tagName).toBe('STRONG');
    // The bold phrase is nested in the note's own span, which is the single flex
    // item beside the icon: the Stack gap must not split the sentence.
    expect(countPhrase.parentElement?.tagName).toBe('SPAN');
    expect(countPhrase.parentElement).toHaveTextContent(
      `Complete these ${mockPathwayDetailData.courses.length} courses in any order`,
    );

    // Fixture shape matches the confirmed decisions.
    expect(mockPathwayDetailData.courses).toHaveLength(8);
    expect(mockPathwayDetailData.credentials).toHaveLength(8);
    expect(mockPathwayDetailData.isEnrolled).toBe(false);

    // The intentionally removed sections stay absent.
    ['instructors', 'faqs', 'testimonials'].forEach((sectionId) => {
      expect(document.getElementById(sectionId)).not.toBeInTheDocument();
    });
    expect(screen.queryByRole('heading', { name: /instructors|faqs|testimonials/i })).not.toBeInTheDocument();

    // Hero wiring: the fixture has no imageUrl, so the initial src comes from
    // resolveImageUrl's placeholder; a load error is replaced by it as well.
    const heroImage = screen.getByRole('img', { name: mockPathwayDetailData.name });
    expect(heroImage).toHaveAttribute('src', noCourseImg);
    heroImage.setAttribute('src', 'http://example.com/broken.jpg');
    fireEvent.error(heroImage);
    expect(heroImage).toHaveAttribute('src', noCourseImg);
  });

  it('gives each fact kind its own semantic icon', async () => {
    await renderPathwayDetailPage();

    const factsAside = screen.getByRole('complementary', { name: messages.factsAriaLabel.defaultMessage });
    // Keyed by fact kind, never by the learner-visible label, so copy edits and
    // translations cannot move an icon. Every fact goes through Paragon's Icon,
    // including the custom certificate graphic.
    const expectedPaths: Record<PathwayFact['kind'], ReturnType<typeof iconPath>> = {
      start: iconPathOf(EventIcon),
      courses: iconPathOf(FormatListBulletedIcon),
      price: iconPathOf(MonetizationOnIcon),
      duration: iconPathOf(AccessTimeFilledIcon),
      pace: iconPathOf(MenuBookIcon),
      certificates: iconPathOf(CourseContentIcon),
      badges: iconPathOf(WorkspacePremium),
    };

    mockPathwayDetailData.facts.forEach((fact) => {
      // The label span sits beside its icon inside the fact's icon row.
      const iconRow = within(factsAside).getByText(fact.label).parentElement as HTMLElement;
      expect(iconPath(iconRow)).toBe(expectedPaths[fact.kind]);
      expect(iconRow.querySelector('.pgn__icon')).toHaveClass('text-gray-400');
    });
  });

  it('bolds the count phrase in the singular plural branch too', () => {
    const oneCoursePathway = {
      ...mockPathwayDetailData,
      courses: [mockPathwayDetailData.courses[0]],
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

  it('marks the initial navigation item from the URL before the observer runs', async () => {
    const { unmount } = await renderPathwayDetailPage();

    // No hash: About is current immediately after mount.
    const aboutLink = screen.getByRole('link', { name: messages.aboutNavLink.defaultMessage });
    expect(aboutLink).toHaveClass('active');
    expect(aboutLink).toHaveAttribute('aria-current', 'location');

    unmount();

    // R2: a #credentials deep link is pinned before any observer callback.
    window.history.replaceState(null, '', '/catalog/pathways/pathway-1#credentials');
    await renderPathwayDetailPage();

    expect(screen.getByRole('link', { name: messages.credentialsNavLink.defaultMessage }))
      .toHaveClass('active');
    expect(screen.getByRole('link', { name: messages.credentialsNavLink.defaultMessage }))
      .toHaveAttribute('aria-current', 'location');
    expect(screen.getByRole('link', { name: messages.aboutNavLink.defaultMessage }))
      .not.toHaveAttribute('aria-current');
  });

  it('keeps a single active tab when the scrollspy moves off a clicked section', async () => {
    await renderPathwayDetailPage();

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

  it('renders exactly one disabled pathway CTA, inside the hero, before the bar sticks', async () => {
    const { unmount } = await renderPathwayDetailPage();
    const heroActions = () => document.querySelector('.pathway-detail-hero-actions') as HTMLElement;

    const enrollButtons = screen.getAllByRole('button', { name: messages.enrollNowBtn.defaultMessage });
    expect(enrollButtons).toHaveLength(1);
    expect(enrollButtons[0]).toBeDisabled();
    expect(within(heroActions()).getByRole('button', { name: messages.enrollNowBtn.defaultMessage }))
      .toBe(enrollButtons[0]);
    expect(screen.queryByRole('button', { name: messages.viewPathwayBtn.defaultMessage })).not.toBeInTheDocument();

    unmount();
    mockIsEnrolled = true;
    await renderPathwayDetailPage();

    const viewButtons = screen.getAllByRole('button', { name: messages.viewPathwayBtn.defaultMessage });
    expect(viewButtons).toHaveLength(1);
    expect(viewButtons[0]).toBeDisabled();
    expect(within(heroActions()).getByRole('button', { name: messages.viewPathwayBtn.defaultMessage }))
      .toBe(viewButtons[0]);
    expect(screen.queryByRole('button', { name: messages.enrollNowBtn.defaultMessage })).not.toBeInTheDocument();
  });

  it('reveals the sticky summary only while the bar is stuck', async () => {
    await renderPathwayDetailPage();

    const nav = document.querySelector('.pathway-detail-nav') as HTMLElement;
    const heroActions = document.querySelector('.pathway-detail-hero-actions') as HTMLElement;
    const { name, start } = mockPathwayDetailData;
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

  it('renders the CTA without a start label when the pathway start date is invalid', async () => {
    mockStart = 'not-a-date';
    await renderPathwayDetailPage();

    const heroActions = document.querySelector('.pathway-detail-hero-actions') as HTMLElement;
    const enrollButtons = screen.getAllByRole('button', { name: messages.enrollNowBtn.defaultMessage });

    expect(enrollButtons).toHaveLength(1);
    expect(enrollButtons[0]).toBeDisabled();
    expect(within(heroActions).queryByText(/^Starts /)).not.toBeInTheDocument();
  });

  it('renders an enrolled sticky summary without a start label when start is absent', async () => {
    mockIsEnrolled = true;
    mockStart = null;
    await renderPathwayDetailPage();

    const nav = document.querySelector('.pathway-detail-nav') as HTMLElement;
    jest.spyOn(nav, 'getBoundingClientRect').mockReturnValue({ top: -1, bottom: 148, height: 148 } as DOMRect);
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    const summary = nav.querySelector('.pathway-detail-nav-summary') as HTMLElement;
    expect(summary).toBeInTheDocument();
    expect(within(summary).getByRole('button', { name: messages.viewPathwayBtn.defaultMessage })).toBeDisabled();
    expect(within(summary).queryByText(/^Starts /)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: messages.enrollNowBtn.defaultMessage })).not.toBeInTheDocument();
  });

  it('shows 6 courses and credentials by default and expands each list independently', async () => {
    await renderPathwayDetailPage();

    const aboutSection = getSection(messages.aboutHeading.defaultMessage);
    const credentialsSection = getSection(messages.credentialsHeading.defaultMessage);
    const { courses, credentials } = mockPathwayDetailData;
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

  it('renders each course row from its structured duration, pace and credential count', async () => {
    await renderPathwayDetailPage();

    const aboutSection = getSection(messages.aboutHeading.defaultMessage);
    const { courses } = mockPathwayDetailData;
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

    // The credential icon follows the kind: the custom course content icon for a
    // certificate, WorkspacePremium for a badge.
    const credentialMeta = (row: HTMLElement) => row.querySelectorAll('.pathway-detail-course-meta > span')[2];
    expect(iconPath(credentialMeta(rowFor(certificateCourse.title)))).toBe(iconPathOf(CourseContentIcon));
    // The custom icon inherits the shared info tint rather than carrying its own fill.
    expect(credentialMeta(rowFor(certificateCourse.title)).querySelector('svg path')).toHaveAttribute(
      'fill',
      'currentColor',
    );
    expect(iconPath(credentialMeta(rowFor(badgeCourse.title)))).toBe(iconPathOf(WorkspacePremium));
  });

  it('drives credential card copy, icon and styling from the credential kind', async () => {
    await renderPathwayDetailPage();

    const credentialsSection = getSection(messages.credentialsHeading.defaultMessage);
    const { credentials } = mockPathwayDetailData;
    // The course line is unique to a card, so it selects the card and ties the
    // assertions to the credential the learner reads rather than a hook class.
    const cardForCourse = (courseTitle: string) => (
      within(credentialsSection)
        .getByText(credentialCourseTitle(courseTitle))
        .closest('.pathway-detail-credential-card') as HTMLElement
    );

    credentials.slice(0, INITIAL_VISIBLE_COUNT).forEach((credential) => {
      const card = cardForCourse(credential.courseTitle);
      const isBadge = credential.kind === 'badge';
      const expectedTitle = `${isBadge ? 'Earn a badge' : 'Earn a certificate'} ${credential.rule}`;

      expect(card).not.toHaveClass('bg-light-200');
      if (isBadge) {
        expect(card).toHaveClass('bg-primary-100');
        expect(card).not.toHaveClass('bg-light-100');
        expect(iconPath(card)).toBe(iconPathOf(WorkspacePremium));
      } else {
        expect(card).toHaveClass('bg-light-100');
        expect(card).not.toHaveClass('bg-primary-100');
        expect(card.querySelector('.pgn__icon')).not.toBeInTheDocument();
        expect(svgPath(card)).toBe(svgPathOf(<CertificateIcon />));
      }
      expect(within(card).getByText(expectedTitle)).toBeInTheDocument();
      expect(within(card).getByText(credentialCourseTitle(credential.courseTitle))).toBeInTheDocument();
    });
  });

  it('renders the featured pathway certificate first and outside the ordinary credential cards', async () => {
    await renderPathwayDetailPage();

    const credentialsSection = getSection(messages.credentialsHeading.defaultMessage);
    const grid = credentialsSection.querySelector('#pathway-credentials-list') as HTMLElement;
    const { name } = mockPathwayDetailData;
    const featured = grid.firstElementChild as HTMLElement;

    // The distinct class carries the full-width span; the grid order puts it first.
    expect(featured).toHaveClass('pathway-detail-featured-credential');
    // The featured certificate uses the pathway primary tint, not the neutral card tint.
    expect(featured).toHaveClass('bg-primary-100');
    expect(featured).not.toHaveClass('bg-light-200');
    expect(credentialsSection.querySelectorAll('.pathway-detail-featured-credential')).toHaveLength(1);
    expect(within(featured).getByText(name)).toBeInTheDocument();
    expect(within(featured).getByText(featuredCertificateLabel)).toBeInTheDocument();
    // The section's certificate graphic is the custom component at its design
    // size, not a Paragon icon box.
    expect(featured.querySelector('.pgn__icon')).not.toBeInTheDocument();
    expect(svgPath(featured)).toBe(svgPathOf(<CertificateIcon />));
    expect(featured.querySelector('svg')).toHaveAttribute('width', '58');
    expect(featured.querySelector('svg')).toHaveAttribute('height', '54');
    // Ordinary credential counts and See more ignore the featured card.
    expect(featured).not.toHaveClass('pathway-detail-credential-card');
  });

  it('omits the featured certificate when the pathway has no certificate label', async () => {
    mockCertificateLabel = null;
    await renderPathwayDetailPage();

    const credentialsSection = getSection(messages.credentialsHeading.defaultMessage);

    expect(credentialsSection.querySelector('.pathway-detail-featured-credential')).not.toBeInTheDocument();
    expect(credentialsSection.querySelectorAll('.pathway-detail-credential-card')).toHaveLength(INITIAL_VISIBLE_COUNT);
  });

  it('keeps course disclosures independent', async () => {
    await renderPathwayDetailPage();

    const aboutSection = getSection(messages.aboutHeading.defaultMessage);
    const { courses } = mockPathwayDetailData;

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
    expect(within(secondCourse).queryByText(courses[1].shortDescription)).not.toBeInTheDocument();

    // Opening a second course keeps the first open.
    await userEvent.click(secondCourseTrigger);
    expect(firstCourseTrigger).toHaveAttribute('aria-expanded', 'true');
    expect(secondCourseTrigger).toHaveAttribute('aria-expanded', 'true');
    expect(within(firstCourse).getByText(courses[0].shortDescription)).toBeVisible();
    expect(within(secondCourse).getByText(courses[1].shortDescription)).toBeVisible();
  });

  describe('navigation scrollspy', () => {
    beforeEach(() => {
      mockNavHeight('56px');
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('picks the active section nearest the boundary with deterministic tie-breaking', async () => {
      await renderPathwayDetailPage();
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

    it('skips a tracked section removed from the DOM before the observer callback', async () => {
      await renderPathwayDetailPage();
      const about = document.getElementById('about') as HTMLElement;
      const credentials = document.getElementById('credentials') as HTMLElement;
      setSectionTop(about, 56);
      fireIntersections(makeEntry(about, true));
      expect(screen.getByRole('link', { name: messages.aboutNavLink.defaultMessage }))
        .toHaveAttribute('aria-current', 'location');

      // Observer delivery is async, so a tracked section can already be detached.
      about.remove();
      setSectionTop(credentials, 56);

      expect(() => fireIntersections(makeEntry(credentials, true))).not.toThrow();
      expect(screen.getByRole('link', { name: messages.credentialsNavLink.defaultMessage }))
        .toHaveAttribute('aria-current', 'location');
    });

    it('re-reads section geometry fresh instead of trusting cached entry geometry', async () => {
      await renderPathwayDetailPage();
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

    it('synchronizes the hash only when it does not already match the active section', async () => {
      window.history.replaceState(null, '', '/catalog/pathways/pathway-1?tab=courses');
      const { unmount } = await renderPathwayDetailPage();
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
      await renderPathwayDetailPage();
      const credentials = document.getElementById('credentials') as HTMLElement;
      setSectionTop(credentials, 56);

      fireIntersections(makeEntry(credentials, true));

      expect(replaceState).not.toHaveBeenCalled();
      replaceState.mockRestore();
    });

    it('honours a cold #credentials deep link, then follows a scroll to About', async () => {
      const scrollIntoView = jest.fn();
      const originalScrollIntoView = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollIntoView');
      Object.defineProperty(Element.prototype, 'scrollIntoView', {
        configurable: true,
        writable: true,
        value: scrollIntoView,
      });

      try {
        window.history.replaceState(null, '', '/catalog/pathways/pathway-1#credentials');
        await renderPathwayDetailPage();

        const aboutLink = screen.getByRole('link', { name: messages.aboutNavLink.defaultMessage });
        const credentialsLink = screen.getByRole('link', { name: messages.credentialsNavLink.defaultMessage });
        const about = document.getElementById('about') as HTMLElement;
        const credentials = document.getElementById('credentials') as HTMLElement;
        const scrolledTo = (scrollIntoView.mock.instances[0] as HTMLElement | undefined)?.id ?? null;

        if (scrolledTo) {
          // The fix navigated to the target: model the applied scroll, with
          // the stuck nav and Credentials at the measured 143px boundary.
          const nav = document.querySelector('.pathway-detail-nav') as HTMLElement;
          jest.spyOn(nav, 'getBoundingClientRect').mockReturnValue({ top: 0, bottom: 143, height: 143 } as DOMRect);
          setSectionTop(about, -200);
          setSectionTop(credentials, 143);
          act(() => {
            window.dispatchEvent(new Event('scroll'));
          });
          fireIntersections(makeEntry(credentials, true));
        } else {
          // No initial navigation: the real cold entries still report About as
          // nearest the boundary while Credentials is off-screen.
          setSectionTop(about, 56);
          setSectionTop(credentials, 1603);
          fireIntersections(makeEntry(about, true));
        }

        // The deep link was navigated to and remains active, not rewritten.
        expect({
          scrolledTo,
          hash: window.location.hash,
          credentialsActive: credentialsLink.getAttribute('aria-current'),
          aboutActive: aboutLink.getAttribute('aria-current'),
        }).toEqual({
          scrolledTo: 'credentials',
          hash: '#credentials',
          credentialsActive: 'location',
          aboutActive: null,
        });

        // A genuine scroll back to About follows the observer again.
        setSectionTop(about, 143);
        setSectionTop(credentials, -100);
        act(() => {
          window.dispatchEvent(new Event('scroll'));
        });
        fireIntersections(makeEntry(about, true), makeEntry(credentials, false));

        expect(window.location.hash).toBe('#about');
        expect(aboutLink).toHaveAttribute('aria-current', 'location');
        expect(credentialsLink).not.toHaveAttribute('aria-current');
      } finally {
        if (originalScrollIntoView) {
          Object.defineProperty(Element.prototype, 'scrollIntoView', originalScrollIntoView);
        } else {
          Reflect.deleteProperty(Element.prototype, 'scrollIntoView');
        }
      }
    });

    it('keeps a clamped cold #credentials deep link through the first observer, then follows a scroll to About', async () => {
      const scrollIntoView = jest.fn();
      const originalScrollIntoView = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollIntoView');
      Object.defineProperty(Element.prototype, 'scrollIntoView', {
        configurable: true,
        writable: true,
        value: scrollIntoView,
      });

      try {
        window.history.replaceState(null, '', '/catalog/pathways/pathway-1#credentials');
        await renderPathwayDetailPage();

        const aboutLink = screen.getByRole('link', { name: messages.aboutNavLink.defaultMessage });
        const credentialsLink = screen.getByRole('link', { name: messages.credentialsNavLink.defaultMessage });
        const about = document.getElementById('about') as HTMLElement;
        const credentials = document.getElementById('credentials') as HTMLElement;

        // The scroll was attempted, but jsdom applies none: both sections stay
        // visible, the nav is unpinned and About is nearer the 56px boundary.
        expect((scrollIntoView.mock.instances[0] as HTMLElement | undefined)?.id).toBe('credentials');
        setSectionTop(about, 0);
        setSectionTop(credentials, 500);
        fireIntersections(makeEntry(about, true), makeEntry(credentials, true));

        expect(window.location.hash).toBe('#credentials');
        expect(credentialsLink).toHaveAttribute('aria-current', 'location');
        expect(aboutLink).not.toHaveAttribute('aria-current');

        // A genuine scroll to About resumes normal hash sync.
        setSectionTop(about, 56);
        setSectionTop(credentials, -100);
        act(() => {
          window.dispatchEvent(new Event('scroll'));
        });
        fireIntersections(makeEntry(about, true), makeEntry(credentials, false));

        expect(window.location.hash).toBe('#about');
        expect(aboutLink).toHaveAttribute('aria-current', 'location');
        expect(credentialsLink).not.toHaveAttribute('aria-current');
      } finally {
        if (originalScrollIntoView) {
          Object.defineProperty(Element.prototype, 'scrollIntoView', originalScrollIntoView);
        } else {
          Reflect.deleteProperty(Element.prototype, 'scrollIntoView');
        }
      }
    });

    it('keeps a cold #credentials deep link when a rebuild precedes the first delivery', async () => {
      const scrollIntoView = jest.fn();
      const originalScrollIntoView = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollIntoView');
      Object.defineProperty(Element.prototype, 'scrollIntoView', {
        configurable: true,
        writable: true,
        value: scrollIntoView,
      });

      try {
        window.history.replaceState(null, '', '/catalog/pathways/pathway-1#credentials');
        await renderPathwayDetailPage();
        const replaceState = jest.spyOn(window.history, 'replaceState');
        const nav = document.querySelector('.pathway-detail-nav') as HTMLElement;
        const about = document.getElementById('about') as HTMLElement;
        const credentials = document.getElementById('credentials') as HTMLElement;

        // Mounting has no layout, so nothing is pinned and the deep link is aligned by
        // the first observer's build. That pass consumes the alignment request.
        expect(scrollIntoView.mock.instances.map((element) => (element as HTMLElement).id)).toEqual(['credentials']);

        // The summary mounts and grows the pinned bar, rebuilding the observer before
        // either instance delivered a single entry.
        jest.spyOn(nav, 'getBoundingClientRect').mockReturnValue({ top: -1, bottom: 148, height: 148 } as DOMRect);
        act(() => {
          window.dispatchEvent(new Event('scroll'));
        });
        expect(MockIntersectionObserver.instances).toHaveLength(2);
        expect(MockIntersectionObserver.instances[0].disconnect).toHaveBeenCalled();

        // Clamped scroll: the address still names Credentials while About sits nearest
        // the 148px boundary. The rebuilt observer's first delivery must not rewrite it.
        setSectionTop(about, 148);
        setSectionTop(credentials, 1200);
        fireIntersections(makeEntry(about, true), makeEntry(credentials, true));

        expect(replaceState).not.toHaveBeenCalled();
        expect(window.location.hash).toBe('#credentials');
        expect(screen.getByRole('link', { name: messages.credentialsNavLink.defaultMessage }))
          .toHaveAttribute('aria-current', 'location');
        expect(screen.getByRole('link', { name: messages.aboutNavLink.defaultMessage }))
          .not.toHaveAttribute('aria-current');

        // The protection covers one delivery only: the next scroll to About still syncs.
        fireIntersections(makeEntry(about, true), makeEntry(credentials, false));

        expect(window.location.hash).toBe('#about');
        expect(screen.getByRole('link', { name: messages.aboutNavLink.defaultMessage }))
          .toHaveAttribute('aria-current', 'location');
      } finally {
        if (originalScrollIntoView) {
          Object.defineProperty(Element.prototype, 'scrollIntoView', originalScrollIntoView);
        } else {
          Reflect.deleteProperty(Element.prototype, 'scrollIntoView');
        }
      }
    });

    it('derives the rootMargin from the nav-height CSS custom property', async () => {
      // 56px boundary from the beforeEach mock.
      await renderPathwayDetailPage();
      expect(getObserver().options.rootMargin).toBe('-56px 0px 0px 0px');

      // Without the stylesheet value the observer falls back to a safe offset.
      jest.restoreAllMocks();
      await renderPathwayDetailPage();
      expect(getObserver().options.rootMargin).toBe('-0px 0px 0px 0px');
    });

    it('writes the measured panel height to the page and rebuilds the observer', async () => {
      await renderPathwayDetailPage();

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

    it('observes each of the two sections once and disconnects on unmount', async () => {
      const { unmount } = await renderPathwayDetailPage();
      const observer = getObserver();

      expect(observer.observe).toHaveBeenCalledTimes(2);
      expect(observer.observe.mock.calls.map(([section]) => (section as HTMLElement).id)).toEqual([
        'about',
        'credentials',
      ]);

      unmount();
      expect(observer.disconnect).toHaveBeenCalledTimes(1);
    });

    it('ignores a missing deep-link target when only some sections are rendered', () => {
      const scrollIntoView = jest.fn();
      const originalScrollIntoView = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollIntoView');
      Object.defineProperty(Element.prototype, 'scrollIntoView', {
        configurable: true,
        writable: true,
        value: scrollIntoView,
      });

      try {
        window.history.replaceState(null, '', '/catalog/pathways/pathway-1#credentials');
        const fixture = rtlRender(
          <div className="pathway-detail-page">
            <div className="pathway-detail-nav" />
            <section id="about" />
          </div>,
        );

        try {
          const hook = renderHook(() => usePathwayNavigation());

          try {
            // Missing target: no anchor scroll, and the observer watches only rendered sections.
            expect(scrollIntoView).not.toHaveBeenCalled();
            const observer = getObserver();
            expect(observer.observe).toHaveBeenCalledTimes(1);
            expect((observer.observe.mock.calls[0][0] as HTMLElement).id).toBe('about');
          } finally {
            hook.unmount();
          }
        } finally {
          fixture.unmount();
        }
      } finally {
        if (originalScrollIntoView) {
          Object.defineProperty(Element.prototype, 'scrollIntoView', originalScrollIntoView);
        } else {
          Reflect.deleteProperty(Element.prototype, 'scrollIntoView');
        }
      }
    });

    it('re-aligns a cold deep link after the pinned summary grows the nav', async () => {
      const scrollIntoView = jest.fn();
      const originalScrollIntoView = Object.getOwnPropertyDescriptor(Element.prototype, 'scrollIntoView');
      Object.defineProperty(Element.prototype, 'scrollIntoView', {
        configurable: true,
        writable: true,
        value: scrollIntoView,
      });

      const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
      const rectSpy = jest.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
        if (!this.classList?.contains('pathway-detail-nav')) {
          return originalGetBoundingClientRect.call(this);
        }
        const summaryMounted = document.querySelector('.pathway-detail-nav-summary') !== null;
        return summaryMounted
          ? ({ top: -1, bottom: 148, height: 148 } as DOMRect)
          : ({ top: 0, bottom: 56, height: 56 } as DOMRect);
      });

      try {
        window.history.replaceState(null, '', '/catalog/pathways/pathway-1#credentials');
        await renderPathwayDetailPage();

        // Pinned at mount: 56px before the summary renders, 148px once it has grown the nav.
        // The summary mounts in a commit whose effects re-measure the nav, so the second
        // alignment lands after the loaded view: wait for that pass, then assert the height
        // it aligned at. Waiting for an unchanged count would hide a lost re-alignment.
        await waitFor(() => expect(scrollIntoView).toHaveBeenCalledTimes(2));

        const page = document.querySelector('.pathway-detail-page') as HTMLElement;
        expect(document.querySelector('.pathway-detail-nav-summary')).toBeInTheDocument();
        expect(page.style.getPropertyValue('--pathway-detail-nav-height')).toBe('148px');
        expect(scrollIntoView.mock.instances.map((element) => (element as HTMLElement).id))
          .toEqual(['credentials', 'credentials']);
        scrollIntoView.mock.calls.forEach(([options]) => {
          expect(options).toEqual({ block: 'start', behavior: 'instant' });
        });

        // Unchanged height after a resize must not re-align again.
        act(() => {
          window.dispatchEvent(new Event('resize'));
        });
        expect(scrollIntoView).toHaveBeenCalledTimes(2);
      } finally {
        rectSpy.mockRestore();
        if (originalScrollIntoView) {
          Object.defineProperty(Element.prototype, 'scrollIntoView', originalScrollIntoView);
        } else {
          Reflect.deleteProperty(Element.prototype, 'scrollIntoView');
        }
      }
    });
  });

  it('renders pathway share links for the current URL, including observer-driven hash changes', async () => {
    window.history.replaceState(null, '', '/catalog/pathways/pathway-1');
    await renderPathwayDetailPage();
    const { name: pathwayName } = mockPathwayDetailData;

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

  it('keeps share destinations on the address when the observer keeps About active', async () => {
    await renderPathwayDetailPage();

    // The first delivery re-selects the already-active About section, so no
    // state change re-renders the sidebar: its destinations must already name
    // the address the observer synchronizes.
    const about = document.getElementById('about') as HTMLElement;
    setSectionTop(about, 56);
    fireIntersections(makeEntry(about, true));

    expect(window.location.hash).toBe('#about');
    expect(decodedShareUrls()).toEqual([window.location.href, window.location.href, window.location.href]);
  });

  it('synchronizes the address before rendering when a tab is clicked', async () => {
    await renderPathwayDetailPage();
    const aboutLink = screen.getByRole('link', { name: messages.aboutNavLink.defaultMessage });
    const credentialsLink = screen.getByRole('link', { name: messages.credentialsNavLink.defaultMessage });

    // Re-clicking the initially active About tab changes no state: the address
    // and the destinations must still agree once the click settles.
    await userEvent.click(aboutLink);
    expect(window.location.hash).toBe('#about');
    expect(decodedShareUrls()).toEqual([window.location.href, window.location.href, window.location.href]);

    // A different tab changes the state and must render its destinations from
    // the address the click synchronizes, not from the previous one.
    await userEvent.click(credentialsLink);
    expect(window.location.hash).toBe('#credentials');
    expect(decodedShareUrls()).toEqual([window.location.href, window.location.href, window.location.href]);
  });

  it('shows the loading state while the record is in flight', async () => {
    renderPathwayDetailPageWithoutWaiting();

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();

    // Settle the fetch, so its update does not land after the test ends.
    await screen.findByRole('heading', { level: 1, name: mockPathwayDetailData.name });
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows the danger alert when the fetch fails with nothing cached', async () => {
    mockFetchPathwayDetail.mockRejectedValueOnce(new Error('offline'));
    renderPathwayDetailPageWithoutWaiting();

    const alert = await screen.findByTestId('pathway-error');
    // A request failure is a support problem, not a URL mistake: it shows the
    // configured support address instead of the not-found copy.
    expect(alert).toHaveTextContent(
      messages.errorMessage.defaultMessage.replace('{supportEmail}', getStringConfig('INFO_EMAIL')),
    );
    expect(alert).not.toHaveTextContent(messages.notFound.defaultMessage);
    expect(screen.queryByTestId('not-found-page')).not.toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
  });

  it('renders the not-found page when the response carries no record', async () => {
    mockFetchPathwayDetail.mockResolvedValueOnce(null);
    renderPathwayDetailPageWithoutWaiting();

    expect(await screen.findByTestId('not-found-page')).toHaveTextContent(messages.notFound.defaultMessage);
    // An empty success is a missing pathway, not a failure.
    expect(screen.queryByTestId('pathway-error')).not.toBeInTheDocument();
  });

  it('keeps the loaded pathway when a background refetch fails', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    await renderPathwayDetailPage(queryClient);

    expect(screen.getByRole('heading', { level: 1, name: mockPathwayDetailData.name })).toBeInTheDocument();

    // The refetch fails while the loaded record is still on screen.
    mockFetchPathwayDetail.mockRejectedValueOnce(new Error('offline'));
    await act(async () => {
      await queryClient.invalidateQueries({ queryKey: ['pathwayDetail', mockPathwayDetailData.id] });
    });

    expect(mockFetchPathwayDetail).toHaveBeenCalledTimes(2);
    expect(screen.getByRole('heading', { level: 1, name: mockPathwayDetailData.name })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: messages.aboutHeading.defaultMessage })).toBeInTheDocument();
    // A stale record is not a failure the reader has to act on: no blocking alerts or spinners.
    expect(screen.queryByTestId('pathway-error')).not.toBeInTheDocument();
    expect(screen.queryByTestId('not-found-page')).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('resets each expanded list when a cached pathway switch replaces the record', async () => {
    const recordA = { ...pathwayFor('pathway-a'), name: 'Pathway A' };
    const recordB = { ...pathwayFor('pathway-b'), name: 'Pathway B' };
    // Both ids are seeded before the switch: B renders from the cache and never
    // enters the pending view, whose unmount would reset the lists by itself and
    // hide a missing remount key.
    mockFetchPathwayDetail.mockImplementation((pathwayId: string) => Promise.resolve(
      pathwayId === recordB.id ? recordB : recordA,
    ));
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    queryClient.setQueryData(['pathwayDetail', recordA.id], recordA);
    queryClient.setQueryData(['pathwayDetail', recordB.id], recordB);

    renderCachedPathwaySwitch(queryClient, recordA.id, recordB.id);

    expect(await screen.findByRole('heading', { level: 1, name: recordA.name })).toBeInTheDocument();

    const { courses, credentials } = mockPathwayDetailData;
    const aboutA = getSection(messages.aboutHeading.defaultMessage);
    const credentialsA = getSection(messages.credentialsHeading.defaultMessage);

    await userEvent.click(within(aboutA).getByRole('button', { name: messages.seeMoreBtn.defaultMessage }));
    await userEvent.click(within(credentialsA).getByRole('button', { name: messages.seeMoreBtn.defaultMessage }));

    const lastCourse = courses[7].title;
    const lastCredential = credentialCourseTitle(credentials[7].courseTitle);
    expect(within(aboutA).getByText(lastCourse)).toBeInTheDocument();
    expect(within(credentialsA).getByText(lastCredential)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: SWITCH_LABEL }));

    expect(await screen.findByRole('heading', { level: 1, name: recordB.name })).toBeInTheDocument();
    // Seeded data keeps the route out of its pending view throughout the switch.
    expect(queryClient.getQueryState(['pathwayDetail', recordB.id])?.status).toBe('success');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    const aboutB = getSection(messages.aboutHeading.defaultMessage);
    const credentialsB = getSection(messages.credentialsHeading.defaultMessage);
    const lastVisibleCourse = courses[INITIAL_VISIBLE_COUNT - 1].title;
    const firstHiddenCourse = courses[INITIAL_VISIBLE_COUNT].title;
    const lastVisibleCredential = credentialCourseTitle(credentials[INITIAL_VISIBLE_COUNT - 1].courseTitle);
    const firstHiddenCredential = credentialCourseTitle(credentials[INITIAL_VISIBLE_COUNT].courseTitle);

    expect(within(aboutB).queryByText(lastCourse)).not.toBeInTheDocument();
    expect(within(credentialsB).queryByText(lastCredential)).not.toBeInTheDocument();
    expect(within(aboutB).getByText(lastVisibleCourse)).toBeInTheDocument();
    expect(within(aboutB).queryByText(firstHiddenCourse)).not.toBeInTheDocument();
    expect(within(credentialsB).getByText(lastVisibleCredential)).toBeInTheDocument();
    expect(within(credentialsB).queryByText(firstHiddenCredential)).not.toBeInTheDocument();

    // Both controls are back to their collapsed label, one per list.
    expect(within(aboutB).getByRole('button', { name: messages.seeMoreBtn.defaultMessage })).toBeInTheDocument();
    expect(within(credentialsB).getByRole('button', { name: messages.seeMoreBtn.defaultMessage })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: messages.seeLessBtn.defaultMessage })).not.toBeInTheDocument();
  });

  it('renders repeated about paragraphs without a duplicate-key warning', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    const paragraph = 'This paragraph appears twice on purpose.';
    mockFetchPathwayDetail.mockResolvedValueOnce({
      ...pathwayFor('repeated-paragraphs'),
      about: [paragraph, paragraph],
    });

    try {
      await renderPathwayDetailPage();

      expect(screen.getAllByText(paragraph)).toHaveLength(2);
      expect(consoleError.mock.calls.flat().join(' ')).not.toMatch(/same key/i);
    } finally {
      consoleError.mockRestore();
    }
  });
});
