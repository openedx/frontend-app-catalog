import { Image } from '@openedx/paragon';
import { Slot } from '@openedx/frontend-base';

import noCourseImg from '@src/assets/images/no-course-image.svg';

export interface CourseAboutCourseImageSlotProps {
  imgSrc: string,
  altText: string,
}

const CourseAboutCourseImageSlot = ({ imgSrc, altText }: CourseAboutCourseImageSlotProps) => (
  <Slot
    id="org.openedx.frontend.slot.catalog.courseAboutCourseImage.v1"
    imgSrc={imgSrc}
    altText={altText}
  >
    <Image
      className="course-media-image shadow w-100"
      src={imgSrc}
      rounded
      alt={altText}
      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.src = noCourseImg;
      }}
    />
  </Slot>
);

export default CourseAboutCourseImageSlot;
