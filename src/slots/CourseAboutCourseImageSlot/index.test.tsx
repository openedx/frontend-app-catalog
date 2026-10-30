import { fireEvent, render, screen } from '@testing-library/react';
import { IntlProvider } from '@openedx/frontend-base';

import noCourseImg from '@src/assets/images/no-course-image.svg';

import CourseAboutCourseImageSlot from '.';

describe('CourseAboutCourseImageSlot', () => {
  it('shows the placeholder exactly once across repeated image errors', () => {
    render(
      <IntlProvider locale="en">
        <CourseAboutCourseImageSlot imgSrc="http://example.com/broken.jpg" altText="Course image" />
      </IntlProvider>,
    );
    const image = screen.getByAltText('Course image');
    const setSrc = jest.spyOn(HTMLImageElement.prototype, 'src', 'set');

    fireEvent.error(image);
    fireEvent.error(image);
    fireEvent.error(image);

    expect(setSrc).toHaveBeenCalledTimes(1);
    expect(image).toHaveAttribute('src', noCourseImg);
    setSrc.mockRestore();
  });
});
