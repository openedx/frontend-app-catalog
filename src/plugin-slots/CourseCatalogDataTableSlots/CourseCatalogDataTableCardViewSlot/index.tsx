import { PluginSlot } from '@openedx/frontend-plugin-framework';
import { CardView } from '@openedx/paragon';

import { DEFAULT_PAGE_SIZE } from '@src/data/course-list-search/constants';
import type { CatalogListSearchMixedResponse, CatalogListSearchMixedResult } from '@src/data/course-list-search/types';
import CourseCatalogDataTableCourseCardSlot from './CourseCatalogDataTableCourseCardSlot';
import CourseCatalogDataTablePathwayCardSlot from './CourseCatalogDataTablePathwayCardSlot';

interface CourseCatalogDataTableCardSlotProps {
  original?: CatalogListSearchMixedResult;
  isLoading?: boolean;
}

/**
 * CardView renders a single CardComponent for every row, so this wrapper
 * dispatches each result to its course or pathway card slot (the same
 * pattern as CoursesList on the home page).
 */
const CourseCatalogDataTableCardSlot = ({
  original, isLoading,
}: CourseCatalogDataTableCardSlotProps) => (
  original?.type === 'pathway' ? (
    <CourseCatalogDataTablePathwayCardSlot original={original} isLoading={isLoading} />
  ) : (
    <CourseCatalogDataTableCourseCardSlot original={original} isLoading={isLoading} />
  )
);

const CourseCatalogDataTableCardViewSlot = ({ displayData }: { displayData?: CatalogListSearchMixedResponse }) => (
  <PluginSlot
    id="org.openedx.frontend.catalog.course_catalog_page.data_table.card_view"
    slotOptions={{
      mergeProps: true,
    }}
    pluginProps={{
      displayData,
    }}
  >
    <CardView
      CardComponent={CourseCatalogDataTableCardSlot}
      skeletonCardCount={Math.min(displayData?.total ?? DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE)}
    />
  </PluginSlot>
);

export default CourseCatalogDataTableCardViewSlot;
export { CourseCatalogDataTableCardSlot };
