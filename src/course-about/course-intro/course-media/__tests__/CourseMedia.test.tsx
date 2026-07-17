import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getSiteConfig, IntlProvider } from '@openedx/frontend-base';

import noCourseImg from '@src/assets/images/no-course-image.svg';
import { mockCourseAboutResponse } from '@src/__mocks__';
import CourseMedia from '../CourseMedia';
import messages from '../messages';

const renderCourseMedia = (props: React.ComponentProps<typeof CourseMedia>) => render(
  <IntlProvider locale="en"><CourseMedia {...props} /></IntlProvider>,
);

describe('CourseMedia', () => {
  const mockCourseData = {
    name: mockCourseAboutResponse.name,
    media: mockCourseAboutResponse.media,
  };

  const defaultProps = {
    courseAboutData: mockCourseData,
  };

  it('renders course image with correct attributes', () => {
    renderCourseMedia(defaultProps);

    const image = screen.getByAltText(mockCourseData.name);
    expect(image).toHaveAttribute('src', `${getSiteConfig().lmsBaseUrl}${mockCourseAboutResponse.media.courseImage.uri}`);
    expect(image).toHaveClass('course-media-image');
  });

  it('renders video thumbnail when video is available', () => {
    renderCourseMedia(defaultProps);

    const videoButton = screen.getByRole('button', {
      name: messages.playCourseIntroductionVideo.defaultMessage,
    });
    expect(videoButton).toBeInTheDocument();
  });

  it('renders only image when no video is available', () => {
    const courseDataWithoutVideo = {
      ...mockCourseData,
      media: {
        ...mockCourseData.media,
        courseVideo: undefined,
      },
    };

    renderCourseMedia({ courseAboutData: courseDataWithoutVideo });

    expect(screen.getByAltText(mockCourseData.name)).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('opens video modal when clicking video thumbnail', async () => {
    const user = userEvent.setup();
    renderCourseMedia(defaultProps);

    const videoButton = screen.getByRole('button', {
      name: messages.playCourseIntroductionVideo.defaultMessage,
    });
    await user.click(videoButton);

    // Check if VideoModal is rendered
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('uses placeholder image when image fails to load', () => {
    renderCourseMedia(defaultProps);

    const image = screen.getByAltText(mockCourseData.name);
    fireEvent.error(image);

    expect(image).toHaveAttribute('src', noCourseImg);
  });

  it('uses placeholder image when no image URL is provided', () => {
    const courseDataWithoutImage = {
      ...mockCourseData,
      media: {
        ...mockCourseData.media,
        courseImage: {
          uri: null,
        },
      },
    };

    renderCourseMedia({ courseAboutData: courseDataWithoutImage });

    const image = screen.getByAltText(mockCourseData.name);
    expect(image).toHaveAttribute('src', noCourseImg);
  });

  it('renders play icon when video is available', () => {
    renderCourseMedia(defaultProps);

    const videoButton = screen.getByRole('button', {
      name: messages.playCourseIntroductionVideo.defaultMessage,
    });

    const playIcon = within(videoButton).getByRole('img');
    expect(playIcon).toBeInTheDocument();
  });

  it('constructs correct image URL with LMS base URL', () => {
    renderCourseMedia(defaultProps);

    const image = screen.getByAltText(mockCourseData.name);
    expect(image).toHaveAttribute('src', `${getSiteConfig().lmsBaseUrl}${mockCourseAboutResponse.media.courseImage.uri}`);
  });
});
