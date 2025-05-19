import { getConfig } from '@edx/frontend-platform';

import { fireEvent, userEvent, render } from '../../../../setupTest';
import { extractYouTubeVideoId, getMediaUris } from '../utils';
import CourseMedia from '../CourseMedia';
import messages from '../messages';

import courseImagePlaceholder from '../../../../assets/images/no-course-image.svg';

jest.mock('@edx/frontend-platform', () => ({
  getConfig: jest.fn(),
}));

jest.mock('../utils', () => ({
  extractYouTubeVideoId: jest.fn(),
  getMediaUris: jest.fn(),
}));

describe('CourseMedia', () => {
  const mockCourseData = {
    name: 'Test Course',
    media: {
      courseImage: { uri: '/test-image.jpg' },
      courseVideo: { uri: 'https://youtube.com/watch?v=test123' },
    },
  };

  const defaultProps = {
    courseAboutData: mockCourseData,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (getConfig as jest.Mock).mockReturnValue({ LMS_BASE_URL: 'http://test-lms.com' });
    (getMediaUris as jest.Mock).mockReturnValue({
      imageUrl: '/test-image.jpg',
      videoUrl: 'https://youtube.com/watch?v=test123',
    });
    (extractYouTubeVideoId as jest.Mock).mockReturnValue('test123');
  });

  it('renders course image with correct attributes', () => {
    const { getByAltText } = render(<CourseMedia {...defaultProps} />);

    const image = getByAltText(mockCourseData.name);
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'http://test-lms.com/test-image.jpg');
    expect(image).toHaveClass('course-media-image');
  });

  it('renders video thumbnail when video is available', () => {
    const { getByRole } = render(<CourseMedia {...defaultProps} />);

    const videoButton = getByRole('button', {
      name: messages.playCourseIntroductionVideo.defaultMessage,
    });
    expect(videoButton).toBeInTheDocument();
    expect(videoButton).toHaveClass('course-media-video-thumbnail');
  });

  it('renders only image when no video is available', () => {
    (getMediaUris as jest.Mock).mockReturnValue({
      imageUrl: '/test-image.jpg',
      videoUrl: null,
    });
    (extractYouTubeVideoId as jest.Mock).mockReturnValue(null);

    const { getByAltText, queryByRole } = render(<CourseMedia {...defaultProps} />);

    expect(getByAltText(mockCourseData.name)).toBeInTheDocument();
    expect(queryByRole('button')).not.toBeInTheDocument();
  });

  it('opens video modal when clicking video thumbnail', async () => {
    const user = userEvent.setup();
    const { getByRole } = render(<CourseMedia {...defaultProps} />);

    const videoButton = getByRole('button', {
      name: messages.playCourseIntroductionVideo.defaultMessage,
    });
    await user.click(videoButton);

    // Check if VideoModal is rendered
    expect(getByRole('dialog')).toBeInTheDocument();
  });

  it('uses placeholder image when image fails to load', () => {
    const { getByAltText } = render(<CourseMedia {...defaultProps} />);

    const image = getByAltText(mockCourseData.name);
    fireEvent.error(image);

    expect(image).toHaveAttribute('src', courseImagePlaceholder);
  });

  it('uses placeholder image when no image URL is provided', () => {
    (getMediaUris as jest.Mock).mockReturnValue({
      imageUrl: null,
      videoUrl: null,
    });

    const { getByAltText } = render(<CourseMedia {...defaultProps} />);

    const image = getByAltText(mockCourseData.name);
    expect(image).toHaveAttribute('src', courseImagePlaceholder);
  });

  it('renders play button icon when video is available', () => {
    const { getByTestId } = render(<CourseMedia {...defaultProps} />);

    const playButton = getByTestId('play-course-introduction-video-icon');
    expect(playButton).toHaveClass('course-media-play-btn');
  });

  it('constructs correct image URL with LMS base URL', () => {
    const { getByAltText } = render(<CourseMedia {...defaultProps} />);

    const image = getByAltText(mockCourseData.name);
    expect(image).toHaveAttribute('src', 'http://test-lms.com/test-image.jpg');
  });
});
