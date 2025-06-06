import { getConfig } from '@edx/frontend-platform';

import { mockCourseResponse } from '../../__mocks__';
import { render } from '../../setupTest';
import { CourseCard } from '.';

import messages from './messages';

describe('CourseCard', () => {
  const renderComponent = (course = mockCourseResponse) => render(
    <CourseCard course={course} />,
  );

  it('renders course information correctly', () => {
    const { getByText } = renderComponent();

    expect(getByText(mockCourseResponse.data.content.displayName)).toBeInTheDocument();
    expect(getByText(mockCourseResponse.data.org)).toBeInTheDocument();
    expect(getByText('Starts: Apr 1, 2024')).toBeInTheDocument();
  });

  it('renders course image with correct src and fallback', () => {
    const { getByAltText } = renderComponent();

    const image = getByAltText(mockCourseResponse.data.content.displayName);
    expect(image).toHaveAttribute('src', `${getConfig().LMS_BASE_URL}${mockCourseResponse.data.imageUrl}`);
  });

  it('renders organization logo with correct src and fallback', () => {
    const { getByAltText } = renderComponent();

    const logo = getByAltText(mockCourseResponse.data.org);
    expect(logo).toHaveAttribute('src', `${getConfig().LMS_BASE_URL}${mockCourseResponse.data.orgImg}`);
  });

  it('formats the link destination correctly', () => {
    const { getByRole } = renderComponent();

    const link = getByRole('link');
    expect(link).toHaveAttribute('href', `/courses/${mockCourseResponse.id}/about`);
  });

  it('handles missing start date gracefully', () => {
    const courseWithoutStart = {
      ...mockCourseResponse,
      data: {
        ...mockCourseResponse.data,
        start: '',
      },
    };
    const { queryByText } = renderComponent(courseWithoutStart);

    expect(queryByText(messages.startDate.defaultMessage.replace('{startDate}', courseWithoutStart.data.start))).not.toBeInTheDocument();
  });
});
