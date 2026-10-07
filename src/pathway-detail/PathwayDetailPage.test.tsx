import { MemoryRouter, Route, Routes } from 'react-router-dom';
import {
  act, fireEvent, render as rtlRender, screen, within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getAuthenticatedUser, IntlProvider } from '@openedx/frontend-base';
import noCourseImg from '@src/assets/images/no-course-image.svg';

import PathwayDetailPage, { INITIAL_VISIBLE_COUNT } from './PathwayDetailPage';
import { DATA_ENGINEERING_PATHWAY, getPathwayDetail } from './data';
import messages from './messages';

let mockIsEnrolled: boolean | undefined;

// The embedded course About body renders CourseOverview, which reads the
// authenticated user to decide whether to show the Studio edit action.
jest.mock('@openedx/frontend-base', () => ({
  ...jest.requireActual('@openedx/frontend-base'),
  getAuthenticatedUser: jest.fn(() => null),
}));

jest.mock('./data', () => {
  const actual = jest.requireActual('./data');
  return {
    ...actual,
    getPathwayDetail: (pathwayId: string) => {
      const pathway = actual.getPathwayDetail(pathwayId);
      return pathway && mockIsEnrolled !== undefined
        ? { ...pathway, isEnrolled: mockIsEnrolled }
        : pathway;
    },
  };
});

const getSection = (heading: string) => (
  screen.getByRole('heading', { name: heading }).closest('section') as HTMLElement
);

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
// one value the page reads from PathwayDetailPage.scss.
const mockNavHeight = (height: string) => {
  const realGetComputedStyle = window.getComputedStyle.bind(window);
  const mockGetComputedStyle: typeof window.getComputedStyle = (
    element: Element,
    pseudoElement?: string | null,
  ) => {
    const style = realGetComputedStyle(element, pseudoElement);
    if ((element as HTMLElement).classList?.contains('pathway-detail-nav')) {
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
    window.history.replaceState(null, '', `/catalog/pathways/${DATA_ENGINEERING_PATHWAY.id}`);
    MockIntersectionObserver.instances = [];
    Object.defineProperty(globalThis, 'IntersectionObserver', {
      writable: true,
      value: MockIntersectionObserver,
    });
  });

  it('renders the Data Engineering fixture for the route pathway ID', () => {
    renderPathwayDetailPage();

    expect(screen.getByRole('heading', { level: 1, name: DATA_ENGINEERING_PATHWAY.name })).toBeInTheDocument();
    expect(screen.getByText(DATA_ENGINEERING_PATHWAY.organization)).toBeInTheDocument();
    expect(screen.getByText(DATA_ENGINEERING_PATHWAY.description)).toBeInTheDocument();
    expect(screen.getByText(messages.pathwayBadge.defaultMessage)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: DATA_ENGINEERING_PATHWAY.name })).toBeInTheDocument();

    [
      messages.aboutHeading,
      messages.credentialsHeading,
      messages.instructorsHeading,
      messages.faqsHeading,
      messages.testimonialsHeading,
    ].forEach((message) => {
      expect(screen.getByRole('heading', { name: message.defaultMessage })).toBeInTheDocument();
    });

    // Initial-letter avatars are decorative because each name is adjacent.
    const instructorsSection = getSection(messages.instructorsHeading.defaultMessage);
    expect(instructorsSection.querySelectorAll('.pathway-detail-instructor-avatar')).toHaveLength(
      DATA_ENGINEERING_PATHWAY.instructors.length,
    );
    expect(within(instructorsSection).getAllByRole('heading', { level: 3 })).toHaveLength(
      DATA_ENGINEERING_PATHWAY.instructors.length,
    );

    const factsAside = screen.getByRole('complementary', { name: messages.factsAriaLabel.defaultMessage });
    expect(within(factsAside).getByRole('group', { name: messages.shareHeading.defaultMessage })).toBeInTheDocument();
    expect(document.querySelectorAll('.pathway-detail-credential-card .pgn__icon')).toHaveLength(
      INITIAL_VISIBLE_COUNT,
    );

    [
      { message: messages.aboutNavLink, hash: '#about' },
      { message: messages.credentialsNavLink, hash: '#credentials' },
      { message: messages.instructorsNavLink, hash: '#instructors' },
      { message: messages.faqsNavLink, hash: '#faqs' },
      { message: messages.testimonialsNavLink, hash: '#testimonials' },
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
    expect(DATA_ENGINEERING_PATHWAY.instructors).toHaveLength(4);
    expect(DATA_ENGINEERING_PATHWAY.faqs).toHaveLength(3);
    expect(DATA_ENGINEERING_PATHWAY.testimonials).toHaveLength(2);
    expect(DATA_ENGINEERING_PATHWAY.isEnrolled).toBe(false);
  });

  it('marks About as current by default when the URL has no hash', () => {
    renderPathwayDetailPage();

    const aboutLink = screen.getByRole('link', { name: messages.aboutNavLink.defaultMessage });
    expect(aboutLink).toHaveClass('active');
    expect(aboutLink).toHaveAttribute('aria-current', 'location');
  });

  it('marks the hash-selected section as the current navigation item', () => {
    window.history.replaceState(null, '', '/catalog/pathways/pathway-1#about');
    renderPathwayDetailPage();

    const aboutLink = screen.getByRole('link', { name: messages.aboutNavLink.defaultMessage });
    expect(aboutLink).toHaveClass('active');
    expect(aboutLink).toHaveAttribute('aria-current', 'location');
  });

  it('substitutes any nonempty pathway ID into the fixture and rejects blank IDs', () => {
    expect(getPathwayDetail('some-id')?.id).toBe('some-id');
    expect(getPathwayDetail('')).toBeUndefined();
    expect(getPathwayDetail('   ')).toBeUndefined();
  });

  it('falls back to the placeholder image once and does not retry on repeated errors', () => {
    renderPathwayDetailPage();
    const image = screen.getByRole('img', { name: DATA_ENGINEERING_PATHWAY.name });
    const setSrc = jest.spyOn(HTMLImageElement.prototype, 'src', 'set');

    // Fixture has no imageUrl, so start from a broken remote URL to exercise the fallback.
    image.setAttribute('src', 'http://example.com/broken.jpg');
    fireEvent.error(image);
    fireEvent.error(image);

    expect(setSrc).toHaveBeenCalledTimes(1);
    expect(image).toHaveAttribute('src', noCourseImg);
    setSrc.mockRestore();
  });

  it('renders only a disabled "Enroll now" CTA when not enrolled', () => {
    renderPathwayDetailPage();

    expect(screen.getByRole('button', { name: messages.enrollNowBtn.defaultMessage })).toBeDisabled();
    expect(screen.queryByRole('button', { name: messages.viewPathwayBtn.defaultMessage })).not.toBeInTheDocument();
  });

  it('renders only a disabled "View pathway" CTA when enrolled', () => {
    mockIsEnrolled = true;
    renderPathwayDetailPage();

    expect(screen.getByRole('button', { name: messages.viewPathwayBtn.defaultMessage })).toBeDisabled();
    expect(screen.queryByRole('button', { name: messages.enrollNowBtn.defaultMessage })).not.toBeInTheDocument();
  });

  it('shows 6 courses and credentials by default and expands each list independently', async () => {
    renderPathwayDetailPage();

    const aboutSection = getSection(messages.aboutHeading.defaultMessage);
    const credentialsSection = getSection(messages.credentialsHeading.defaultMessage);
    const { courses, credentials } = DATA_ENGINEERING_PATHWAY;
    const lastVisibleCourse = courses[INITIAL_VISIBLE_COUNT - 1].title;
    const firstHiddenCourse = courses[INITIAL_VISIBLE_COUNT].title;
    const lastVisibleCredential = credentials[INITIAL_VISIBLE_COUNT - 1].courseTitle;
    const firstHiddenCredential = credentials[INITIAL_VISIBLE_COUNT].courseTitle;

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
    expect(within(credentialsSection).getByText(credentials[7].courseTitle)).toBeInTheDocument();
    expect(within(aboutSection).getByText(courses[7].title)).toBeInTheDocument();

    // Each "See less" independently collapses its own list.
    await userEvent.click(within(aboutSection).getByRole('button', { name: messages.seeLessBtn.defaultMessage }));
    expect(within(aboutSection).queryByText(firstHiddenCourse)).not.toBeInTheDocument();
    expect(within(credentialsSection).getByText(credentials[7].courseTitle)).toBeInTheDocument();

    await userEvent.click(within(credentialsSection).getByRole('button', { name: messages.seeLessBtn.defaultMessage }));
    expect(within(credentialsSection).queryByText(firstHiddenCredential)).not.toBeInTheDocument();
  });

  it('keeps course and FAQ disclosures independent', async () => {
    renderPathwayDetailPage();

    const aboutSection = getSection(messages.aboutHeading.defaultMessage);
    const faqsSection = getSection(messages.faqsHeading.defaultMessage);
    const { courses, faqs } = DATA_ENGINEERING_PATHWAY;

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

    // FAQs open independently of each other and stay open together.
    const firstFaqTrigger = within(faqsSection).getByRole('button', { name: faqs[0].question });
    const secondFaqTrigger = within(faqsSection).getByRole('button', { name: faqs[1].question });
    const firstFaq = firstFaqTrigger.closest('.collapsible-basic') as HTMLElement;
    const secondFaq = secondFaqTrigger.closest('.collapsible-basic') as HTMLElement;
    expect(firstFaqTrigger).toHaveAttribute('aria-expanded', 'false');
    expect(secondFaqTrigger).toHaveAttribute('aria-expanded', 'false');
    expect(within(firstFaq).queryByText(faqs[0].answer)).not.toBeInTheDocument();

    await userEvent.click(firstFaqTrigger);
    await userEvent.click(secondFaqTrigger);
    expect(firstFaqTrigger).toHaveAttribute('aria-expanded', 'true');
    expect(secondFaqTrigger).toHaveAttribute('aria-expanded', 'true');
    expect(within(firstFaq).getByText(faqs[0].answer)).toBeVisible();
    expect(within(secondFaq).getByText(faqs[1].answer)).toBeVisible();
  });

  it('embeds a complete CourseAboutData in every fixture course', () => {
    DATA_ENGINEERING_PATHWAY.courses.forEach((course) => {
      const { courseAboutData } = course;
      expect(courseAboutData.id).toBe(course.id);
      expect(courseAboutData.name).toBe(course.title);
      expect(courseAboutData.shortDescription).toBeTruthy();
      // Trusted static fixture HTML only: the overview renders through
      // dangerouslySetInnerHTML and must be built-in copy, never user input.
      expect(courseAboutData.overview).toContain('<p>');
      expect(courseAboutData.overview).not.toMatch(/\{\{|\$\{/);
      // Structured overview sections rendered by the About card.
      ['About This Course', 'Requirements', 'Frequently Asked Questions'].forEach((heading) => {
        expect(courseAboutData.overview).toContain(heading);
      });
      expect(courseAboutData.enrollment).toEqual({ mode: null, isActive: false });
      expect(courseAboutData.media).toEqual({
        courseImage: { uri: null },
        courseVideo: { uri: null },
        image: { raw: '', small: '', large: '' },
      });
      expect(courseAboutData.coursePrice).toBe('Free');
      expect(courseAboutData.displayOrgWithDefault).toBe('MIT OpenLearning');
      expect(courseAboutData.displayNumberWithDefault).toBe('1234');
    });

    // Only the Capstone fixture is intentionally longer (so the modal body
    // scrolls during manual checks); every other course keeps the identical
    // shared default overview.
    const capstone = DATA_ENGINEERING_PATHWAY.courses.find(
      ({ title }) => title === 'Capstone: Build a Data Platform',
    );
    const others = DATA_ENGINEERING_PATHWAY.courses.filter((course) => course !== capstone);
    expect(new Set(others.map(({ courseAboutData }) => courseAboutData.overview)).size).toBe(1);
    expect(capstone?.courseAboutData.overview.length).toBeGreaterThan(
      Math.max(...others.map(({ courseAboutData }) => courseAboutData.overview.length)),
    );
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
      // Sidebar renders from the embedded dummy data.
      expect(within(dialog).getByText(course.courseAboutData.coursePrice)).toBeInTheDocument();
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

    it('renders the structured overview card with About, Requirements, and FAQ headings', async () => {
      const dialog = await openModal();

      const overviewCard = within(dialog)
        .getByRole('heading', { level: 2, name: 'About This Course' })
        .closest('.pgn__card') as HTMLElement;
      expect(within(overviewCard).getByRole('heading', { level: 2, name: 'Requirements' })).toBeInTheDocument();
      expect(within(overviewCard).getByRole('heading', { level: 2, name: 'Frequently Asked Questions' }))
        .toBeInTheDocument();
    });

    it('renders the fixture course number and organization in the dialog', async () => {
      const course = DATA_ENGINEERING_PATHWAY.courses[0];
      const dialog = await openModal();

      expect(within(dialog).getByText(course.courseAboutData.displayNumberWithDefault)).toBeInTheDocument();
      expect(within(dialog).getByText(course.courseAboutData.displayOrgWithDefault)).toBeInTheDocument();
    });

    it('renders no enrollment or view-course actions inside the dialog', async () => {
      const dialog = await openModal();

      expect(within(dialog).queryByRole('button', { name: /enroll/i })).not.toBeInTheDocument();
      expect(within(dialog).queryByRole('button', { name: /view course/i })).not.toBeInTheDocument();
      // hideActions removes the intro action footer entirely.
      expect(dialog.querySelector('.card-footer')).not.toBeInTheDocument();
    });

    it('does not call getAuthenticatedUser when rendering the modal', async () => {
      (getAuthenticatedUser as jest.Mock).mockClear();
      const dialog = await openModal();

      expect(dialog).toBeInTheDocument();
      expect(getAuthenticatedUser).not.toHaveBeenCalled();
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
  });

  describe('navigation scrollspy', () => {
    beforeEach(() => {
      mockNavHeight('56px');
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('marks the observed section nearest the sticky boundary as active', () => {
      renderPathwayDetailPage();
      const credentials = document.getElementById('credentials') as HTMLElement;
      const faqs = document.getElementById('faqs') as HTMLElement;
      setSectionTop(credentials, 56);
      setSectionTop(faqs, 250);

      fireIntersections(
        makeEntry(credentials, true),
        makeEntry(faqs, true),
      );

      expect(screen.getByRole('link', { name: messages.credentialsNavLink.defaultMessage }))
        .toHaveAttribute('aria-current', 'location');
      [
        messages.aboutNavLink,
        messages.instructorsNavLink,
        messages.faqsNavLink,
        messages.testimonialsNavLink,
      ].forEach((message) => {
        expect(screen.getByRole('link', { name: message.defaultMessage }))
          .not.toHaveAttribute('aria-current');
      });

      // Once credentials scrolls past the boundary, FAQs becomes active.
      setSectionTop(credentials, -100);
      setSectionTop(faqs, 56);
      fireIntersections(
        makeEntry(credentials, false),
        makeEntry(faqs, true),
      );

      expect(screen.getByRole('link', { name: messages.faqsNavLink.defaultMessage }))
        .toHaveAttribute('aria-current', 'location');
      expect(screen.getByRole('link', { name: messages.credentialsNavLink.defaultMessage }))
        .not.toHaveAttribute('aria-current');
    });

    it('picks the intersecting section nearest the boundary deterministically', () => {
      renderPathwayDetailPage();
      const about = document.getElementById('about') as HTMLElement;
      const credentials = document.getElementById('credentials') as HTMLElement;
      const instructors = document.getElementById('instructors') as HTMLElement;

      // The nearest section wins over a more recently reported one.
      setSectionTop(credentials, 250);
      setSectionTop(instructors, 56);
      fireIntersections(
        makeEntry(credentials, true),
        makeEntry(instructors, true),
      );
      expect(screen.getByRole('link', { name: messages.instructorsNavLink.defaultMessage }))
        .toHaveAttribute('aria-current', 'location');

      // Equal distances keep the first section in navigation order.
      setSectionTop(about, 56);
      setSectionTop(instructors, 56);
      fireIntersections(
        makeEntry(about, true),
        makeEntry(instructors, true),
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
      setSectionTop(credentials, -10);
      setSectionTop(instructors, -20);
      fireIntersections(
        makeEntry(credentials, false),
        makeEntry(instructors, false),
      );
      expect(screen.getByRole('link', { name: messages.credentialsNavLink.defaultMessage }))
        .toHaveAttribute('aria-current', 'location');
    });

    it('re-reads section geometry fresh instead of trusting cached entry geometry', () => {
      renderPathwayDetailPage();
      const credentials = document.getElementById('credentials') as HTMLElement;
      const faqs = document.getElementById('faqs') as HTMLElement;
      setSectionTop(credentials, 56);
      setSectionTop(faqs, 250);
      fireIntersections(makeEntry(credentials, true), makeEntry(faqs, true));
      expect(screen.getByRole('link', { name: messages.credentialsNavLink.defaultMessage }))
        .toHaveAttribute('aria-current', 'location');

      // The page scrolls: FAQs crosses the boundary while credentials falls
      // below it. The observer reports only the FAQs change; credentials' old
      // entry geometry (top 56) is stale. Only a fresh getBoundingClientRect
      // read of both sections picks FAQs.
      setSectionTop(credentials, 250);
      setSectionTop(faqs, 56);
      fireIntersections(makeEntry(faqs, true));

      expect(screen.getByRole('link', { name: messages.faqsNavLink.defaultMessage }))
        .toHaveAttribute('aria-current', 'location');
      expect(screen.getByRole('link', { name: messages.credentialsNavLink.defaultMessage }))
        .not.toHaveAttribute('aria-current');
    });

    it('synchronizes the hash with window.history.replaceState, preserving pathname and query', () => {
      window.history.replaceState(null, '', '/catalog/pathways/pathway-1?tab=courses');
      renderPathwayDetailPage();
      const replaceState = jest.spyOn(window.history, 'replaceState');
      const credentials = document.getElementById('credentials') as HTMLElement;
      setSectionTop(credentials, 56);

      fireIntersections(makeEntry(credentials, true));

      expect(replaceState).toHaveBeenCalledTimes(1);
      expect(replaceState).toHaveBeenCalledWith(null, '', '/catalog/pathways/pathway-1?tab=courses#credentials');
      replaceState.mockRestore();
    });

    it('skips replaceState when the hash already matches the active section', () => {
      window.history.replaceState(null, '', '/catalog/pathways/pathway-1#credentials');
      renderPathwayDetailPage();
      const replaceState = jest.spyOn(window.history, 'replaceState');
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

    it('observes each of the five sections once and disconnects on unmount', () => {
      const { unmount } = renderPathwayDetailPage();
      const observer = getObserver();

      expect(observer.observe).toHaveBeenCalledTimes(5);
      expect(observer.observe.mock.calls.map(([section]) => (section as HTMLElement).id)).toEqual([
        'about',
        'credentials',
        'instructors',
        'faqs',
        'testimonials',
      ]);

      unmount();
      expect(observer.disconnect).toHaveBeenCalledTimes(1);
    });
  });

  it('renders Facebook, X (Twitter), and email share links for the current pathway URL', () => {
    window.history.replaceState(null, '', '/catalog/pathways/pathway-1');
    renderPathwayDetailPage();
    const shareUrl = window.location.href;
    const { name: pathwayName } = DATA_ENGINEERING_PATHWAY;

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
  });

  it('reflects an observer-driven hash change in the share destinations', () => {
    window.history.replaceState(null, '', '/catalog/pathways/pathway-1');
    renderPathwayDetailPage();
    const credentials = document.getElementById('credentials') as HTMLElement;
    setSectionTop(credentials, 56);

    fireIntersections(makeEntry(credentials, true));

    // The re-render triggered by the active-section change must build share
    // URLs from the already-synchronized location, not a stale href.
    const shareUrl = window.location.href;
    expect(shareUrl).toBe('http://localhost/catalog/pathways/pathway-1#credentials');
    const { name: pathwayName } = DATA_ENGINEERING_PATHWAY;

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
  });
});
