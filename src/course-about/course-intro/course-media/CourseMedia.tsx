import { useMemo, FC } from 'react';
import {
  Icon, Image, useToggle, Button,
} from '@openedx/paragon';
import { PlayCircleFilledWhite as PlayCircleFilledWhiteIcon } from '@openedx/paragon/icons';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';

import { VideoModal } from '../../../generic/video-modal';
import { extractYouTubeVideoId, getMediaUris } from './utils';
import { CourseMediaTypes } from './types';
import messages from './messages';

import courseImagePlaceholder from '../../../assets/images/no-course-image.svg';

const CourseMedia: FC<CourseMediaTypes> = ({ courseAboutData }) => {
  const intl = useIntl();
  const [isOpenVideoModal, openVideoModal, closeVideoModal] = useToggle(false);
  const { imageUrl, videoUrl } = getMediaUris(courseAboutData);
  const videoId = useMemo(() => extractYouTubeVideoId(videoUrl), [videoUrl]);

  const imgSrc = imageUrl ? `${getConfig().LMS_BASE_URL}${imageUrl}` : courseImagePlaceholder;

  const courseImage = (
    <Image
      className="course-media-image"
      src={imgSrc}
      alt={courseAboutData.name}
      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.src = courseImagePlaceholder;
      }}
    />
  );

  return (
    <>
      {videoId && (
        <VideoModal isOpen={isOpenVideoModal} close={closeVideoModal} videoID={videoId} />
      )}
      <div className="course-media-wrapper">
        {videoId ? (
          <div className="course-media-video-container">
            <Button
              className="course-media-video-thumbnail"
              onClick={openVideoModal}
              aria-label={intl.formatMessage(messages.playCourseIntroductionVideo)}
            >
              {courseImage}
              <Icon
                className="course-media-play-btn"
                data-testid="play-course-introduction-video-icon"
                src={PlayCircleFilledWhiteIcon}
              />
            </Button>
          </div>
        ) : courseImage}
      </div>
    </>
  );
};

export default CourseMedia;
