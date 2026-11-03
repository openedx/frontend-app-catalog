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
  id: 'introduction-to-data-pipelines',
  title: 'Introduction to Data Pipelines',
  duration: '2 weeks',
  pace: 'Self-paced',
  credential: { kind: 'certificate', count: 1 },
  shortDescription: 'A short path from raw data to a reliable pipeline.',
};

const PATHWAY_NAME = 'Data Engineering Fundamentals';
const dialogName = `Learn more about ${COURSE.title}`;

const realSiteConfig = getSiteConfig();

const ModalWithQuery = ({ onClose }: { onClose: () => void }) => {
  // A client per render: a shared cache would let a later test skip the fetch.
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { retry: false } },
  }));
  return (
    <QueryClientProvider client={queryClient}>
      <PathwayCourseModal pathwayName={PATHWAY_NAME} course={COURSE} onClose={onClose} />
    </QueryClientProvider>
  );
};

const renderModal = (onClose = jest.fn()) => render(
  <IntlProvider locale="en">
    <MemoryRouter>
      <ModalWithQuery onClose={onClose} />
    </MemoryRouter>
  </IntlProvider>,
);

describe('PathwayCourseModal', () => {
  beforeEach(() => {
    // Non-development renders the fetched record instead of the bundled fixture.
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
