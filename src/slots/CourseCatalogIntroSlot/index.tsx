import classNames from 'classnames';
import { useIntl } from '@openedx/frontend-base';
import { breakpoints, useMediaQuery } from '@openedx/paragon';

import { getPageTitle } from '@src/catalog/utils';
import { SubHeader } from '@src/generic';
import type { CourseCatalogIntroSlotProps } from './types';

const CourseCatalogIntroSlot = ({
  searchString,
  courseDataResultsLength,
}: CourseCatalogIntroSlotProps) => {
  const intl = useIntl();
  const isMedium = useMediaQuery({ maxWidth: breakpoints.medium.maxWidth });

  return (
    <>
      <SubHeader
        title={getPageTitle({
          intl,
          searchString,
          courseDataResultsLength,
        })}
        className={classNames({ 'mx-2.5': isMedium })}
      />
    </>
  );
};

export default CourseCatalogIntroSlot;
