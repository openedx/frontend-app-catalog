import { DataTable } from '@openedx/paragon';
import { Slot } from '@openedx/frontend-base';

const CatalogDataTableTableFooterSlot = () => (
  <Slot
    id="org.openedx.frontend.slot.catalog.catalogDataTableTableFooter.v1"
    idAliases={['org.openedx.frontend.slot.catalog.courseCatalogDataTableTableFooter.v1']}
  >
    <DataTable.TableFooter />
  </Slot>
);

export default CatalogDataTableTableFooterSlot;
