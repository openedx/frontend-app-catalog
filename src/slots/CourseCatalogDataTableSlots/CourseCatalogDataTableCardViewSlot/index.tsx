import { CardView } from '@openedx/paragon';

import { DEFAULT_PAGE_SIZE } from '@src/data/course-list-search/constants';
import { CourseListSearchResponse } from '@src/data/course-list-search/types';
import CourseCatalogDataTableCourseCardSlot from './CourseCatalogDataTableCourseCardSlot';

const CourseCatalogDataTableCardViewSlot = ({ displayData }: { displayData?: CourseListSearchResponse }) => (
  <>
    <CardView
      CardComponent={CourseCatalogDataTableCourseCardSlot}
      skeletonCardCount={Math.min(displayData?.total ?? DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE)}
    />
  </>
);

export default CourseCatalogDataTableCardViewSlot;
