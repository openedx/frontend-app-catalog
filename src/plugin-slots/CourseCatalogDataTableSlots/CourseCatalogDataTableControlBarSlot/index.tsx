import { PluginSlot } from '@openedx/frontend-plugin-framework';
import { DataTable } from '@openedx/paragon';

const CourseCatalogDataTableControlBarSlot = () => (
  <PluginSlot
    id="org.openedx.frontend.catalog.course_catalog_page.data_table.control_bar"
    slotOptions={{
      mergeProps: true,
    }}
  >
    <DataTable.TableControlBar />
  </PluginSlot>
);

export default CourseCatalogDataTableControlBarSlot;
