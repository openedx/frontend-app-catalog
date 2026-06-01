import { Image } from '@openedx/paragon';

import noCourseImg from '@src/assets/images/no-course-image.svg';
import type { CourseAboutCourseImageSlotProps } from './types';

const CourseAboutCourseImageSlot = ({ imgSrc, altText }: CourseAboutCourseImageSlotProps) => (
  <>
    <Image
      className="course-media-image shadow w-100"
      src={imgSrc}
      rounded
      alt={altText}
      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.src = noCourseImg;
      }}
    />
  </>
);

export default CourseAboutCourseImageSlot;
