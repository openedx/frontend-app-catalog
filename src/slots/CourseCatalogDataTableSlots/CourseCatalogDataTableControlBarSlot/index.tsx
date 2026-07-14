import { DataTable } from '@openedx/paragon';
import { Slot } from '@openedx/frontend-base';

export interface CourseCatalogDataTableControlBarSlotProps {
  currentPageResultsCount: number,
  totalResultsCount: number,
}

const CourseCatalogDataTableControlBarSlot = ({
  currentPageResultsCount,
  totalResultsCount,
}: CourseCatalogDataTableControlBarSlotProps) => (
  <Slot
    id="org.openedx.frontend.slot.catalog.courseCatalogDataTableControlBar.v1"
    currentPageResultsCount={currentPageResultsCount}
    totalResultsCount={totalResultsCount}
  >
    <DataTable.TableControlBar />
  </Slot>
);

export default CourseCatalogDataTableControlBarSlot;
