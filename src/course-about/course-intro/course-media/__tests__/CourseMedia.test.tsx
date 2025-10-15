import { getConfig } from '@edx/frontend-platform';
// Import fireEvent directly for simulating browser events that userEvent cannot handle
import { fireEvent } from '@testing-library/react';

import noCourseImg from '@src/assets/images/no-course-image.svg';

import {
  userEvent, render, screen, within,
} from '@src/setupTest';
import { mockCourseAboutResponse } from '@src/__mocks__';
import CourseMedia from '../CourseMedia';
import messages from '../messages';

describe('CourseMedia', () => {
  const mockCourseData = {
    name: mockCourseAboutResponse.name,
    media: mockCourseAboutResponse.media,
  };

  const defaultProps = {
    courseAboutData: mockCourseData,
  };

  it('renders course image with correct attributes', () => {
    render(<CourseMedia {...defaultProps} />);

    const image = screen.getByAltText(mockCourseData.name);
    expect(image).toHaveAttribute('src', `${getConfig().LMS_BASE_URL}${mockCourseAboutResponse.media.courseImage.uri}`);
    expect(image).toHaveClass('course-media-image');
  });

  it('renders video thumbnail when video is available', () => {
    render(<CourseMedia {...defaultProps} />);

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

    render(<CourseMedia courseAboutData={courseDataWithoutVideo} />);

    expect(screen.getByAltText(mockCourseData.name)).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('opens video modal when clicking video thumbnail', async () => {
    const user = userEvent.setup();
    render(<CourseMedia {...defaultProps} />);

    const videoButton = screen.getByRole('button', {
      name: messages.playCourseIntroductionVideo.defaultMessage,
    });
    await user.click(videoButton);

    // Check if VideoModal is rendered
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('uses placeholder image when image fails to load', () => {
    render(<CourseMedia {...defaultProps} />);

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

    render(<CourseMedia courseAboutData={courseDataWithoutImage} />);

    const image = screen.getByAltText(mockCourseData.name);
    expect(image).toHaveAttribute('src', noCourseImg);
  });

  it('renders play icon when video is available', () => {
    render(<CourseMedia {...defaultProps} />);

    const videoButton = screen.getByRole('button', {
      name: messages.playCourseIntroductionVideo.defaultMessage,
    });

    const playIcon = within(videoButton).getByRole('img');
    expect(playIcon).toBeInTheDocument();
  });

  it('constructs correct image URL with LMS base URL', () => {
    render(<CourseMedia {...defaultProps} />);

    const image = screen.getByAltText(mockCourseData.name);
    expect(image).toHaveAttribute('src', `${getConfig().LMS_BASE_URL}${mockCourseAboutResponse.media.courseImage.uri}`);
  });
});
