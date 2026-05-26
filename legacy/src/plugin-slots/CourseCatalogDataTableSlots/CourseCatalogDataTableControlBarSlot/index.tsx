import { PluginSlot } from '@openedx/frontend-plugin-framework';
import { DataTable } from '@openedx/paragon';

import type { CourseCatalogDataTableControlBarSlotProps } from './types';

const CourseCatalogDataTableControlBarSlot = ({
  currentPageResultsCount,
  totalResultsCount,
}: CourseCatalogDataTableControlBarSlotProps) => (
  <PluginSlot
    id="org.openedx.frontend.catalog.course_catalog_page.data_table.control_bar"
    slotOptions={{
      mergeProps: true,
    }}
    pluginProps={{
      currentPageResultsCount,
      totalResultsCount,
    }}
  >
    <DataTable.TableControlBar />
  </PluginSlot>
);

export default CourseCatalogDataTableControlBarSlot;
