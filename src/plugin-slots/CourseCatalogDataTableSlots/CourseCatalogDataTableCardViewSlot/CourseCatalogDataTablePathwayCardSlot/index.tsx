import { PluginSlot } from '@openedx/frontend-plugin-framework';

import { PathwayCard } from '@src/generic';
import type { CourseCatalogDataTablePathwayCardSlotProps } from './types';

const CourseCatalogDataTablePathwayCardSlot = ({
  original: pathwayData, isLoading,
}: CourseCatalogDataTablePathwayCardSlotProps) => {
  const pathwayCardProps = {
    isLoading,
    pathwayId: pathwayData?.id,
    name: pathwayData?.data.content.displayName,
    org: pathwayData?.data.org,
    courseCount: pathwayData?.data.courseCount,
    imageUrl: pathwayData?.data.imageUrl,
    startDate: pathwayData?.data.start,
    advertisedStart: pathwayData?.data.advertisedStart,
    category: pathwayData?.data.category,
    categoryLabel: pathwayData?.data.categoryLabel,
    categoryBackgroundColor: pathwayData?.data.categoryBackgroundColor,
    categoryTextColor: pathwayData?.data.categoryTextColor,
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
};

export default CourseCatalogDataTablePathwayCardSlot;
