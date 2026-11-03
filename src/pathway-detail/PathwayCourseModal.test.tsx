import { useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import {
  render, screen, waitFor, within,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  EnvironmentTypes, getSiteConfig, IntlProvider, resolveRouteByRole, setSiteConfig,
} from '@openedx/frontend-base';

import { mockCourseAboutResponse } from '@src/__mocks__';
import { courseAboutRole } from '@src/constants';
import { fetchCourseAboutData } from '@src/course-about/data/api';
import sidebarSocialMessages from '@src/course-about/course-sidebar/sidebar-social/messages';

import { PathwayCourseModal } from './PathwayCourseModal';
import { DATA_ENGINEERING_PATHWAY } from './data';
import type { PathwayCourse } from './types';

jest.mock('@openedx/frontend-base', () => ({
  ...jest.requireActual('@openedx/frontend-base'),
  getAuthenticatedUser: jest.fn(() => null),
  resolveRouteByRole: jest.fn(),
}));

jest.mock('@src/course-about/data/api', () => ({
  ...jest.requireActual('@src/course-about/data/api'),
  fetchCourseAboutData: jest.fn(),
}));

const mockFetchCourseAboutData = fetchCourseAboutData as jest.Mock;
const mockResolveRouteByRole = resolveRouteByRole as jest.Mock;

const COURSE: PathwayCourse = {
  // A real LMS course key: pathway fixture IDs render the bundled fixture instead.
  id: 'course-v1:opencraft+DE101+2027',
  title: 'Introduction to Data Pipelines',
  duration: '2 weeks',
  pace: 'Self-paced',
  credential: { kind: 'certificate', count: 1 },
  shortDescription: 'A short path from raw data to a reliable pipeline.',
};

/** A static pathway fixture course: its About page cannot be fetched. */
const FIXTURE_COURSE: PathwayCourse = {
  ...COURSE,
  id: DATA_ENGINEERING_PATHWAY.courses[0].id,
};

const PATHWAY_NAME = 'Data Engineering Fundamentals';
const dialogName = `Learn more about ${COURSE.title}`;

const realSiteConfig = getSiteConfig();

const ModalWithQuery = ({ course = COURSE, onClose }: { course?: PathwayCourse; onClose: () => void }) => {
  // A client per render: a shared cache would let a later test skip the fetch.
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { retry: false } },
  }));
  return (
    <QueryClientProvider client={queryClient}>
      <PathwayCourseModal pathwayName={PATHWAY_NAME} course={course} onClose={onClose} />
    </QueryClientProvider>
  );
};

const renderModal = (onClose = jest.fn(), course?: PathwayCourse) => render(
  <IntlProvider locale="en">
    <MemoryRouter>
      <ModalWithQuery course={course} onClose={onClose} />
    </MemoryRouter>
  </IntlProvider>,
);

describe('PathwayCourseModal', () => {
  beforeEach(() => {
    // Production is what ships: a real LMS course key renders the fetched record.
    setSiteConfig({ ...realSiteConfig, environment: EnvironmentTypes.PRODUCTION });
    mockFetchCourseAboutData.mockReset();
    mockResolveRouteByRole.mockReset();
  });

  afterEach(() => {
    setSiteConfig(realSiteConfig);
  });

  it('keeps the dialog open and shows no course content when the fetched record is null', async () => {
    // React Query accepts null but not undefined, so this settles as successful data.
    mockFetchCourseAboutData.mockResolvedValue(null);
    const onClose = jest.fn();
    renderModal(onClose);

    const dialog = await screen.findByRole('dialog', { name: dialogName });

    await waitFor(() => {
      expect(within(dialog).queryByRole('status')).not.toBeInTheDocument();
    });

    expect(mockFetchCourseAboutData).toHaveBeenCalledTimes(1);
    expect(mockFetchCourseAboutData).toHaveBeenCalledWith(COURSE.id);
    expect(within(dialog).queryByRole('alert')).not.toBeInTheDocument();
    expect(within(dialog).queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
    expect(within(dialog).queryByText(mockCourseAboutResponse.shortDescription)).not.toBeInTheDocument();

    expect(screen.getByRole('dialog', { name: dialogName })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Close' })).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders the bundled fixture for a pathway fixture course ID in production without fetching', async () => {
    renderModal(jest.fn(), FIXTURE_COURSE);

    const dialog = await screen.findByRole('dialog', { name: dialogName });

    // The fixture course IDs are static slugs in every environment, so this
    // fixture must not depend on the environment mode, and it never fetches.
    expect(mockFetchCourseAboutData).not.toHaveBeenCalled();
    expect(within(dialog).getByRole('heading', { level: 1, name: mockCourseAboutResponse.name }))
      .toBeInTheDocument();
    expect(within(dialog).getByText(mockCourseAboutResponse.shortDescription)).toBeInTheDocument();
    expect(within(dialog).getByText('Course overview content')).toBeInTheDocument();
  });

  it('shares the exact external course About URL from the modal', async () => {
    const externalUrl = 'https://courses.example.com/courses/course-v1:openedx+123+2024/about';
    mockResolveRouteByRole.mockReturnValue({ url: externalUrl, isInternal: false });
    mockFetchCourseAboutData.mockResolvedValue(mockCourseAboutResponse);
    renderModal();

    const dialog = await screen.findByRole('dialog', { name: dialogName });
    await within(dialog).findByRole('heading', { level: 1, name: mockCourseAboutResponse.name });

    expect(mockResolveRouteByRole).toHaveBeenCalledWith(courseAboutRole, { courseId: COURSE.id });

    const shareLink = (label: string) => {
      const link = within(dialog).getByText(label).closest('a');
      expect(link).not.toBeNull();
      return new URL((link as HTMLAnchorElement).href);
    };

    // An external route is shared as-is, not re-based onto the site URL.
    const facebook = shareLink(sidebarSocialMessages.socialSharingFacebook.defaultMessage);
    expect(facebook.searchParams.get('u')).toBe(externalUrl);

    const tweetText = shareLink(sidebarSocialMessages.socialSharingTwitter.defaultMessage)
      .searchParams.get('text') ?? '';
    expect(tweetText).toContain(externalUrl);
    expect(tweetText).not.toContain(realSiteConfig.baseUrl);

    const emailBody = shareLink(sidebarSocialMessages.socialSharingEmail.defaultMessage)
      .searchParams.get('body') ?? '';
    expect(emailBody).toContain(externalUrl);
    expect(emailBody).not.toContain(realSiteConfig.baseUrl);
  });
});
