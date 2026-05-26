import { PluginSlot } from '@openedx/frontend-plugin-framework';
import { DataTable } from '@openedx/paragon';

const CourseCatalogDataTableTableFooterSlot = () => (
  <PluginSlot
    id="org.openedx.frontend.catalog.course_catalog_page.data_table.table_footer"
    slotOptions={{
      mergeProps: true,
    }}
  >
    <DataTable.TableFooter />
  </PluginSlot>
);

export default CourseCatalogDataTableTableFooterSlot;
