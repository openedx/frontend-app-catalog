import { CardView } from '@openedx/paragon';
import { Slot } from '@openedx/frontend-base';

import { DEFAULT_PAGE_SIZE } from '@src/data/course-list-search/constants';
import type { CourseListSearchResponse } from '@src/data/course-list-search/types';
import CourseCatalogDataTableCourseCardSlot from './CourseCatalogDataTableCourseCardSlot';

export interface CourseCatalogDataTableCardViewSlotProps {
  displayData?: CourseListSearchResponse,
}

const CourseCatalogDataTableCardViewSlot = ({ displayData }: CourseCatalogDataTableCardViewSlotProps) => (
  <Slot
    id="org.openedx.frontend.slot.catalog.courseCatalogDataTableCardView.v1"
    displayData={displayData}
  >
    <CardView
      CardComponent={CourseCatalogDataTableCourseCardSlot}
      skeletonCardCount={Math.min(displayData?.total ?? DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE)}
    />
  </Slot>
);

export default CourseCatalogDataTableCardViewSlot;
