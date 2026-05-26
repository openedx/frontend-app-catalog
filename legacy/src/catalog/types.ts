import { IntlShape } from '@edx/frontend-platform/i18n';

export interface GetPageTitleProps {
  intl: IntlShape;
  searchString: string;
  courseDataResultsLength?: number;
}
