import { useMemo } from 'react';
import { Image, useToggle } from '@openedx/paragon';
import { getConfig } from '@edx/frontend-platform';

import noCourseImg from '@src/assets/images/no-course-image.svg';

import { CourseAboutIntroVideoModalSlot } from '@src/plugin-slots/CourseAboutIntroVideoSlots/CourseAboutIntroVideoModalSlot';
import { CourseAboutIntroVideoButtonSlot } from '@src/plugin-slots/CourseAboutIntroVideoSlots/CourseAboutIntroVideoButtonSlot';
import { extractYouTubeVideoId, getMediaUris } from './utils';
import { CourseMediaTypes } from './types';

const CourseMedia = ({ courseAboutData }: CourseMediaTypes) => {
  const [isOpenVideoModal, openVideoModal, closeVideoModal] = useToggle(false);
  const { imageUrl, videoUrl } = getMediaUris(courseAboutData);
  const videoId = useMemo(() => extractYouTubeVideoId(videoUrl), [videoUrl]);

  const imgSrc = imageUrl ? `${getConfig().LMS_BASE_URL}${imageUrl}` : noCourseImg;

  const courseImage = (
    <Image
      className="course-media-image shadow w-100"
      src={imgSrc}
      rounded
      alt={courseAboutData.name}
      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.src = noCourseImg;
      }}
    />
  );

  return (
    <>
      {videoId && (
        <CourseAboutIntroVideoModalSlot
          isOpen={isOpenVideoModal}
          close={closeVideoModal}
          videoId={videoId}
        />
      )}
      {videoId ? (
        <CourseAboutIntroVideoButtonSlot
          courseImage={courseImage}
          openVideoModal={openVideoModal}
        />
      ) : courseImage}
    </>
  );
};

export default CourseMedia;
