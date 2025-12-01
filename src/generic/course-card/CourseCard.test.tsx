import { getConfig } from '@edx/frontend-platform';

import { mockCourseResponse } from '@src/__mocks__';
import { render, screen } from '@src/setupTest';
import { DATE_FORMAT_OPTIONS } from '@src/constants';
import { CourseCard } from '.';

import messages from './messages';

describe('CourseCard', () => {
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
  });

  it('displays advertisedStart when available', () => {
    renderComponent();

    expect(screen.getByText(
      messages.startDate.defaultMessage.replace('{startDate}', mockCourseResponse.data.advertisedStart),
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

    const expectedDate = new Intl.DateTimeFormat(
      'en-US',
      DATE_FORMAT_OPTIONS,
    ).format(new Date(courseWithoutAdvertisedStart.data.start));

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

    const expectedDate = new Intl.DateTimeFormat(
      'en-US',
      DATE_FORMAT_OPTIONS,
    ).format(new Date(courseWithEmptyAdvertisedStart.data.start));

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

    const formattedStartDate = new Intl.DateTimeFormat(
      'en-US',
      DATE_FORMAT_OPTIONS,
    ).format(new Date(courseWithBothDates.data.start));
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
