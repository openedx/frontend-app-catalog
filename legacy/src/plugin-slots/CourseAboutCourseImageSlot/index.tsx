import { PluginSlot } from '@openedx/frontend-plugin-framework';
import { Image } from '@openedx/paragon';

import noCourseImg from '@src/assets/images/no-course-image.svg';
import type { CourseAboutCourseImageSlotProps } from './types';

const CourseAboutCourseImageSlot = ({ imgSrc, altText }: CourseAboutCourseImageSlotProps) => (
  <PluginSlot
    id="org.openedx.frontend.catalog.course_about_page.course_image"
    slotOptions={{
      mergeProps: true,
    }}
    pluginProps={{ imgSrc, altText }}
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
  </PluginSlot>
);

export default CourseAboutCourseImageSlot;
