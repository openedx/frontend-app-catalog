import { IntlShape } from '@edx/frontend-platform/i18n';

import type { CourseListSearchResponse } from '@src/data/course-list-search/types';

export interface GetPageTitleProps {
  intl: IntlShape;
  searchString: string;
  courseData: CourseListSearchResponse | undefined;
}
