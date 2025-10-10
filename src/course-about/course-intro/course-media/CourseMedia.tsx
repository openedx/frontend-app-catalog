import { useMemo } from 'react';
import { useToggle } from '@openedx/paragon';
import { getConfig } from '@edx/frontend-platform';

import noCourseImg from '@src/assets/images/no-course-image.svg';

import { CourseAboutIntroVideoModalSlot } from '@src/plugin-slots/CourseAboutIntroVideoSlots/CourseAboutIntroVideoModalSlot';
import { CourseAboutIntroVideoButtonSlot } from '@src/plugin-slots/CourseAboutIntroVideoSlots/CourseAboutIntroVideoButtonSlot';
import CourseAboutCourseImageSlot from '@src/plugin-slots/CourseAboutCourseImageSlot';
import { extractYouTubeVideoId, getMediaUris } from './utils';
import type { CourseMediaTypes } from './types';

const CourseMedia = ({ courseAboutData }: CourseMediaTypes) => {
  const [isOpenVideoModal, openVideoModal, closeVideoModal] = useToggle(false);
  const { imageUrl, videoUrl } = getMediaUris(courseAboutData);
  const videoId = useMemo(() => extractYouTubeVideoId(videoUrl), [videoUrl]);

  const imgSrc = imageUrl ? `${getConfig().LMS_BASE_URL}${imageUrl}` : noCourseImg;

  const courseImage = (
    <CourseAboutCourseImageSlot imgSrc={imgSrc} altText={courseAboutData.name} />
  );

  return videoId ? (
    <>
      <CourseAboutIntroVideoModalSlot
        isOpen={isOpenVideoModal}
        close={closeVideoModal}
        videoId={videoId}
      />
      <CourseAboutIntroVideoButtonSlot
        courseImage={courseImage}
        openVideoModal={openVideoModal}
      />
    </>
  ) : courseImage;
};

export default CourseMedia;
