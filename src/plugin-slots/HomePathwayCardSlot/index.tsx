import { getConfig } from '@edx/frontend-platform';
import { PluginSlot } from '@openedx/frontend-plugin-framework';

import { PathwayCard } from '@src/generic';
import type { HomePathwayCardSlotProps } from './types';

const HomePathwayCardSlot = ({ original: pathwayData, isLoading }: HomePathwayCardSlotProps) => {
  if (!getConfig().ENABLE_PATHWAY_PILOT_UI) {
    return null;
  }

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
      id="org.openedx.frontend.catalog.home_page.pathway_card"
      slotOptions={{
        mergeProps: true,
      }}
      pluginProps={pathwayCardProps}
    >
      <PathwayCard {...pathwayCardProps} />
    </PluginSlot>
  );
};

export default HomePathwayCardSlot;
