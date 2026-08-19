import { PluginSlot } from '@openedx/frontend-plugin-framework';

import { CourseCard } from '@src/generic';
import CourseCatalogDataTablePathwayCardSlot from '../CourseCatalogDataTablePathwayCardSlot';
import type { CourseCatalogDataTableCourseCardSlotProps } from './types';

const CourseCatalogDataTableCourseCardSlot = ({
  original, isLoading,
}: CourseCatalogDataTableCourseCardSlotProps) => {
  if (original?.type === 'pathway') {
    return <CourseCatalogDataTablePathwayCardSlot original={original} isLoading={isLoading} />;
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
