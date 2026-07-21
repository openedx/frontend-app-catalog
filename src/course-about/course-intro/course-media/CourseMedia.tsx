import { useMemo } from 'react';
import { useToggle } from '@openedx/paragon';
import { getSiteConfig } from '@openedx/frontend-base';

import noCourseImg from '@src/assets/images/no-course-image.svg';

import { CourseAboutIntroVideoModalSlot, CourseAboutIntroVideoButtonSlot } from '@src/slots/CourseAboutIntroVideoSlots';
import CourseAboutCourseImageSlot from '@src/slots/CourseAboutCourseImageSlot';
import { extractYouTubeVideoId, getMediaUris } from './utils';
import type { CourseMediaTypes } from './types';

const CourseMedia = ({ courseAboutData }: CourseMediaTypes) => {
  const [isOpenVideoModal, openVideoModal, closeVideoModal] = useToggle(false);
  const { imageUrl, videoUrl } = getMediaUris(courseAboutData);
  const videoId = useMemo(() => extractYouTubeVideoId(videoUrl), [videoUrl]);

  const imgSrc = imageUrl ? `${getSiteConfig().lmsBaseUrl}${imageUrl}` : noCourseImg;

  return videoId ? (
    <>
      <CourseAboutIntroVideoModalSlot
        isOpen={isOpenVideoModal}
        close={closeVideoModal}
        videoId={videoId}
      />
      <CourseAboutIntroVideoButtonSlot
        courseImageSrc={imgSrc}
        courseImageAltText={courseAboutData.name}
        openVideoModal={openVideoModal}
      />
    </>
  ) : <CourseAboutCourseImageSlot imgSrc={imgSrc} altText={courseAboutData.name} />;
};

export default CourseMedia;
