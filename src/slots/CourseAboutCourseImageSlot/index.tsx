import { Image } from '@openedx/paragon';
import { Slot } from '@openedx/frontend-base';

import { onImageLoadError } from '@src/generic/course-image';

export interface CourseAboutCourseImageSlotProps {
  imgSrc: string;
  altText: string;
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
      onError={onImageLoadError}
    />
  </Slot>
);

export default CourseAboutCourseImageSlot;
