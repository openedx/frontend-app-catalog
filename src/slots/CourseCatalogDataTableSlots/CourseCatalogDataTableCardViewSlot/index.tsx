import { CardView } from '@openedx/paragon';
import { Slot } from '@openedx/frontend-base';

import { DEFAULT_PAGE_SIZE } from '@src/data/catalog-search/constants';
import type { CatalogSearchResponse, CatalogSearchResult } from '@src/data/catalog-search/types';
import CourseCatalogDataTableCourseCardSlot from './CourseCatalogDataTableCourseCardSlot';
import CourseCatalogDataTablePathwayCardSlot from './CourseCatalogDataTablePathwayCardSlot';

export interface CourseCatalogDataTableCardViewSlotProps {
  displayData?: CatalogSearchResponse;
}

interface CourseCatalogDataTableResultCardProps {
  original?: CatalogSearchResult;
  isLoading?: boolean;
}

/**
 * CardView renders a single CardComponent for every row, so this wrapper
 * dispatches each result to its course or pathway card slot (the same
 * pattern as CoursesList on the home page).
 */
const CourseCatalogDataTableResultCard = ({
  original, isLoading,
}: CourseCatalogDataTableResultCardProps) => (
  original?.type === 'pathway' ? (
    <CourseCatalogDataTablePathwayCardSlot original={original} isLoading={isLoading} />
  ) : (
    <CourseCatalogDataTableCourseCardSlot original={original} isLoading={isLoading} />
  )
);

const CourseCatalogDataTableCardViewSlot = ({
  displayData,
}: CourseCatalogDataTableCardViewSlotProps) => (
  <Slot
    id="org.openedx.frontend.slot.catalog.courseCatalogDataTableCardView.v1"
    displayData={displayData}
  >
    <CardView
      CardComponent={CourseCatalogDataTableResultCard}
      skeletonCardCount={Math.min(displayData?.total ?? DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE)}
    />
  </Slot>
);

export default CourseCatalogDataTableCardViewSlot;
export { CourseCatalogDataTableResultCard };
