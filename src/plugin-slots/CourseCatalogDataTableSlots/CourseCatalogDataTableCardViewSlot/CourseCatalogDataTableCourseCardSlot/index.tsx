import { PluginSlot } from '@openedx/frontend-plugin-framework';

import { CourseCard } from '@src/generic';
import { CourseCardProps } from '@src/generic/course-card/types';

const CourseCatalogDataTableCourseCardSlot = ({ original: courseData, isLoading }: CourseCardProps) => (
  <PluginSlot
    id="org.openedx.frontend.catalog.course_catalog_page.data_table.course_card"
    slotOptions={{
      mergeProps: true,
    }}
    pluginProps={{
      courseData,
      isLoading,
    }}
  >
    <CourseCard original={courseData} isLoading={isLoading} />
  </PluginSlot>
);

export default CourseCatalogDataTableCourseCardSlot;
