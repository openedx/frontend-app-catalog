import classNames from 'classnames';
import { Slot, useIntl } from '@openedx/frontend-base';
import { breakpoints, useMediaQuery } from '@openedx/paragon';

import { getPageTitle } from '@src/catalog/utils';
import { SubHeader } from '@src/generic';

export interface CatalogIntroSlotProps {
  searchString: string;
  resultsCount?: number;
}

/** @deprecated Use `CatalogIntroSlotProps` and `org.openedx.frontend.slot.catalog.catalogIntro.v1`. */
export interface CourseCatalogIntroSlotProps {
  searchString: string;
  courseDataResultsLength?: number;
}

const CatalogIntroSlot = ({
  searchString,
  resultsCount,
}: CatalogIntroSlotProps) => {
  const intl = useIntl();
  const isMedium = useMediaQuery({ maxWidth: breakpoints.medium.maxWidth });

  return (
    <Slot
      id="org.openedx.frontend.slot.catalog.catalogIntro.v1"
      searchString={searchString}
      resultsCount={resultsCount}
    >
      <Slot
        id="org.openedx.frontend.slot.catalog.courseCatalogIntro.v1"
        searchString={searchString}
        courseDataResultsLength={resultsCount}
      >
        <SubHeader
          title={getPageTitle({
            intl,
            searchString,
            resultsCount,
          })}
          className={classNames({ 'mx-2.5': isMedium })}
        />
      </Slot>
    </Slot>
  );
};

export default CatalogIntroSlot;
