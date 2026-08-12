import { PluginSlot } from '@openedx/frontend-plugin-framework';
import { CardView } from '@openedx/paragon';

import { DEFAULT_PAGE_SIZE } from '@src/data/course-list-search/constants';
import { CatalogListSearchMixedResponse } from '@src/data/course-list-search/types';
import CourseCatalogDataTableCourseCardSlot from './CourseCatalogDataTableCourseCardSlot';

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
      CardComponent={CourseCatalogDataTableCourseCardSlot}
      skeletonCardCount={Math.min(displayData?.total ?? DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE)}
    />
  </PluginSlot>
);

export default CourseCatalogDataTableCardViewSlot;
