import type { IntlShape } from '@src/utils';

export interface GetPageTitleProps {
  intl: IntlShape;
  searchString: string;
  courseDataResultsLength?: number;
}
