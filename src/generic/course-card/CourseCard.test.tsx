import { getConfig } from '@edx/frontend-platform';

import { mockCourseResponse } from '@src/__mocks__';
import { render, screen } from '@src/setupTest';
import { DATE_FORMAT_OPTIONS } from '@src/constants';
import { CourseCard } from '.';

import messages from './messages';

describe('CourseCard', () => {
  const renderComponent = (course = mockCourseResponse) => render(
    <CourseCard course={course} />,
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
});
