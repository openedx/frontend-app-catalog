import { getConfig } from '@edx/frontend-platform';

import { mockCourseResponse } from '@src/__mocks__';
import { render, screen, formatDateForTest } from '@src/setupTest';
import { CourseCard } from '.';

import messages from './messages';

jest.mock('@edx/frontend-platform', () => {
  const actual = jest.requireActual('@edx/frontend-platform');
  return {
    ...actual,
    getConfig: jest.fn(actual.getConfig),
  };
});

const defaultConfig = getConfig();
const mockGetConfig = getConfig as jest.Mock;

describe('CourseCard', () => {
  beforeEach(() => {
    mockGetConfig.mockReturnValue({ ...defaultConfig, ENABLE_PATHWAY_PILOT_UI: true });
  });

  const renderComponent = (course = mockCourseResponse) => render(
    <CourseCard
      courseId={course.id}
      courseOrg={course.data.org}
      courseName={course.data.content.displayName}
      courseNumber={course.data.number}
      courseImageUrl={course.data.imageUrl}
      courseStartDate={course.data.start}
      courseAdvertisedStart={course.data.advertisedStart}
      isLoading={false}
    />,
  );

  it('renders course information correctly', () => {
    renderComponent();

    expect(screen.getByText(mockCourseResponse.data.content.displayName)).toBeInTheDocument();
    expect(screen.getByText(mockCourseResponse.data.org)).toBeInTheDocument();
    expect(screen.getByText(mockCourseResponse.data.number)).toBeInTheDocument();
    expect(screen.getByText(messages.course.defaultMessage)).toHaveClass(
      'catalog-card-badge',
      'course-card-badge',
    );
  });

  it('does not render the badge when disabled', () => {
    mockGetConfig.mockReturnValue({ ...defaultConfig, ENABLE_PATHWAY_PILOT_UI: false });

    renderComponent();

    expect(screen.queryByText(messages.course.defaultMessage)).not.toBeInTheDocument();
  });

  it('displays advertisedStart when available', () => {
    renderComponent();

    expect(screen.getByText(
      messages.startDate.defaultMessage.replace('{startDate}', mockCourseResponse.data.advertisedStart ?? ''),
    )).toBeInTheDocument();
  });

  it('displays formatted start date when advertisedStart is not available', () => {
    const courseWithoutAdvertisedStart = {
      ...mockCourseResponse,
      data: {
        ...mockCourseResponse.data,
        advertisedStart: undefined,
      },
    };

    renderComponent(courseWithoutAdvertisedStart);

    const expectedDate = formatDateForTest(courseWithoutAdvertisedStart.data.start);

    expect(screen.getByText(
      messages.startDate.defaultMessage.replace('{startDate}', expectedDate),
    )).toBeInTheDocument();
  });

  it('displays formatted start date when advertisedStart is empty string', () => {
    const courseWithEmptyAdvertisedStart = {
      ...mockCourseResponse,
      data: {
        ...mockCourseResponse.data,
        advertisedStart: '',
      },
    };

    renderComponent(courseWithEmptyAdvertisedStart);

    const expectedDate = formatDateForTest(courseWithEmptyAdvertisedStart.data.start);

    expect(screen.getByText(
      messages.startDate.defaultMessage.replace('{startDate}', expectedDate),
    )).toBeInTheDocument();
  });

  it('renders course image with correct src and fallback', () => {
    renderComponent();

    const image = screen.getByAltText(`${mockCourseResponse.data.content.displayName} ${mockCourseResponse.data.number}`);
    expect(image).toHaveAttribute('src', `${getConfig().LMS_BASE_URL}${mockCourseResponse.data.imageUrl}`);
  });

  it('formats the link destination correctly', () => {
    renderComponent();

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', `/courses/${mockCourseResponse.id}/about`);
  });

  it('handles missing start date gracefully', () => {
    const courseWithoutStart = {
      ...mockCourseResponse,
      data: {
        ...mockCourseResponse.data,
        start: '',
        advertisedStart: undefined,
      },
    };
    renderComponent(courseWithoutStart);

    expect(screen.queryByText(/Starts:/)).not.toBeInTheDocument();
  });

  it('prioritizes advertisedStart over start date', () => {
    const courseWithBothDates = {
      ...mockCourseResponse,
      data: {
        ...mockCourseResponse.data,
        start: '2024-04-01T00:00:00Z',
        advertisedStart: 'Spring 2024',
      },
    };
    renderComponent(courseWithBothDates);

    expect(screen.getByText(
      messages.startDate.defaultMessage.replace('{startDate}', 'Spring 2024'),
    )).toBeInTheDocument();

    const formattedStartDate = formatDateForTest(courseWithBothDates.data.start);
    expect(screen.queryByText(
      messages.startDate.defaultMessage.replace('{startDate}', formattedStartDate),
    )).not.toBeInTheDocument();
  });

  describe('when isLoading is true', () => {
    const renderLoadingComponent = () => render(
      <CourseCard isLoading />,
    );

    it('renders skeleton elements when loading', () => {
      renderLoadingComponent();

      // Each CourseCard creates 4 skeleton elements (image, header, section, footer)
      // So 1 card × 4 skeletons = 4 total skeleton elements
      expect(document.querySelectorAll('.react-loading-skeleton')).toHaveLength(4);
    });

    it('does not render as a link', () => {
      renderLoadingComponent();

      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('renders as a div instead of Link', () => {
      renderLoadingComponent();

      const cardElement = screen.getByTestId('course-card');
      expect(cardElement).toBeInTheDocument();
    });

    it('does not display course information when loading', () => {
      renderLoadingComponent();

      expect(screen.queryByText(mockCourseResponse.data.content.displayName)).not.toBeInTheDocument();
      expect(screen.queryByText(mockCourseResponse.data.org)).not.toBeInTheDocument();
      expect(screen.queryByText(mockCourseResponse.data.number)).not.toBeInTheDocument();
      expect(screen.queryByText(messages.course.defaultMessage)).not.toBeInTheDocument();
    });

    it('does not display start date when loading', () => {
      renderLoadingComponent();

      expect(screen.queryByText(messages.startDate.defaultMessage.replace('{startDate}', ''))).not.toBeInTheDocument();
    });

    it('does not display course image when loading', () => {
      renderLoadingComponent();

      const imageAlt = `${mockCourseResponse.data.content.displayName} ${mockCourseResponse.data.number}`;
      expect(screen.queryByAltText(imageAlt)).not.toBeInTheDocument();
    });
  });
});
