import { PluginSlot } from '@openedx/frontend-plugin-framework';

import { CourseCard } from '@src/generic';
import type { HomeCourseCardSlotProps } from './types';

const HomeCourseCardSlot = ({ original: courseData, isLoading }: HomeCourseCardSlotProps) => {
  const courseCardProps = {
    isLoading,
    courseId: courseData?.id,
    courseOrg: courseData?.data.org,
    courseName: courseData?.data.content.displayName,
    courseNumber: courseData?.data.number,
    courseImageUrl: courseData?.data.imageUrl,
    courseStartDate: courseData?.data.start,
    courseAdvertisedStart: courseData?.data.advertisedStart,
  };

  return (
    <PluginSlot
      id="org.openedx.frontend.catalog.home_page.course_card"
      slotOptions={{
        mergeProps: true,
      }}
      pluginProps={courseCardProps}
    >
      <CourseCard {...courseCardProps} />
    </PluginSlot>
  );
};

export default HomeCourseCardSlot;
