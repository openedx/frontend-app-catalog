import { PluginSlot } from '@openedx/frontend-plugin-framework';

import { CourseCard, PathwayCard } from '@src/generic';
import type { CourseCatalogDataTableCourseCardSlotProps } from './types';

const CourseCatalogDataTableCourseCardSlot = ({
  original, isLoading,
}: CourseCatalogDataTableCourseCardSlotProps) => {
  if (original?.type === 'pathway') {
    const pathwayCardProps = {
      isLoading,
      pathwayId: original.id,
      name: original.data.content.displayName,
      org: original.data.org,
      courseCount: original.data.courseCount,
      imageUrl: original.data.imageUrl,
      startDate: original.data.start,
      advertisedStart: original.data.advertisedStart,
      type: original.data.type,
      typeBackgroundColor: original.data.typeBackgroundColor,
      typeTextColor: original.data.typeTextColor,
    };

    return (
      <PluginSlot
        id="org.openedx.frontend.catalog.course_catalog_page.data_table.pathway_card"
        slotOptions={{
          mergeProps: true,
        }}
        pluginProps={pathwayCardProps}
      >
        <PathwayCard {...pathwayCardProps} />
      </PluginSlot>
    );
  }

  const courseCardProps = {
    isLoading,
    courseId: original?.id,
    courseOrg: original?.data?.org,
    courseName: original?.data?.content?.displayName,
    courseNumber: original?.data?.number,
    courseImageUrl: original?.data?.imageUrl,
    courseStartDate: original?.data?.start,
    courseAdvertisedStart: original?.data?.advertisedStart,
  };

  return (
    <PluginSlot
      id="org.openedx.frontend.catalog.course_catalog_page.data_table.course_card"
      slotOptions={{
        mergeProps: true,
      }}
      pluginProps={courseCardProps}
    >
      <CourseCard {...courseCardProps} />
    </PluginSlot>
  );
};

export default CourseCatalogDataTableCourseCardSlot;
