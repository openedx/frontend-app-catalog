import classNames from 'classnames';
import { Slot, useIntl } from '@openedx/frontend-base';
import { breakpoints, useMediaQuery } from '@openedx/paragon';

import { getPageTitle } from '@src/catalog/utils';
import { SubHeader } from '@src/generic';

export interface CourseCatalogIntroSlotProps {
  searchString: string;
  courseDataResultsLength?: number;
}

const CourseCatalogIntroSlot = ({
  searchString,
  courseDataResultsLength,
}: CourseCatalogIntroSlotProps) => {
  const intl = useIntl();
  const isMedium = useMediaQuery({ maxWidth: breakpoints.medium.maxWidth });

  return (
    <Slot
      id="org.openedx.frontend.slot.catalog.courseCatalogIntro.v1"
      searchString={searchString}
      courseDataResultsLength={courseDataResultsLength}
    >
      <SubHeader
        title={getPageTitle({
          intl,
          searchString,
          courseDataResultsLength,
        })}
        className={classNames({ 'mx-2.5': isMedium })}
      />
    </Slot>
  );
};

export default CourseCatalogIntroSlot;
