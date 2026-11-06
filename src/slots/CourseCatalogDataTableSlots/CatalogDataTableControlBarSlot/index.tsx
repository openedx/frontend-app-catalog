import { DataTable } from '@openedx/paragon';
import { Slot } from '@openedx/frontend-base';

export interface CatalogDataTableControlBarSlotProps {
  currentPageResultsCount: number;
  totalResultsCount: number;
}

/** @deprecated Use `CatalogDataTableControlBarSlotProps` and `org.openedx.frontend.slot.catalog.catalogDataTableControlBar.v1`. */
export type CourseCatalogDataTableControlBarSlotProps = CatalogDataTableControlBarSlotProps;

const CatalogDataTableControlBarSlot = ({
  currentPageResultsCount,
  totalResultsCount,
}: CatalogDataTableControlBarSlotProps) => (
  <Slot
    id="org.openedx.frontend.slot.catalog.catalogDataTableControlBar.v1"
    currentPageResultsCount={currentPageResultsCount}
    totalResultsCount={totalResultsCount}
  >
    <Slot
      id="org.openedx.frontend.slot.catalog.courseCatalogDataTableControlBar.v1"
      currentPageResultsCount={currentPageResultsCount}
      totalResultsCount={totalResultsCount}
    >
      <DataTable.TableControlBar />
    </Slot>
  </Slot>
);

export default CatalogDataTableControlBarSlot;
