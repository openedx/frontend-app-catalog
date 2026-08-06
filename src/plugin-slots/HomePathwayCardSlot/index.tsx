import { PluginSlot } from '@openedx/frontend-plugin-framework';

import { PathwayCard } from '@src/generic';
import type { HomePathwayCardSlotProps } from './types';

const HomePathwayCardSlot = ({ original: pathwayData, isLoading }: HomePathwayCardSlotProps) => {
  const pathwayCardProps = {
    isLoading,
    pathwayId: pathwayData?.id,
    pathwayName: pathwayData?.data.content.displayName,
    pathwayOrg: pathwayData?.data.org,
    pathwayCourseCount: pathwayData?.data.courseCount,
    pathwayImageUrl: pathwayData?.data.imageUrl,
    pathwayStartDate: pathwayData?.data.start,
    pathwayAdvertisedStart: pathwayData?.data.advertisedStart,
    pathwayType: pathwayData?.data.type,
    pathwayTypeBackgroundColor: pathwayData?.data.typeBackgroundColor,
    pathwayTypeTextColor: pathwayData?.data.typeTextColor,
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
