import { breakpoints, SearchField, useMediaQuery } from '@openedx/paragon';
import { getAppConfig, useIntl } from '@openedx/frontend-base';
import classNames from 'classnames';

import { appId } from '@src/constants';
import messages from '@src/catalog/messages';
import type { CourseCatalogSearchFieldSlotProps } from './types';

const CourseCatalogSearchFieldSlot = ({
  setSearchInput,
  handleSearch,
  initialSearchValue,
}: CourseCatalogSearchFieldSlotProps) => {
  const intl = useIntl();
  const isMedium = useMediaQuery({ maxWidth: breakpoints.large.maxWidth });

  return (
    <>
      {getAppConfig(appId).ENABLE_COURSE_DISCOVERY === true && (
        <SearchField
          key="search-field"
          className={classNames({
            'w-auto mx-2.5 mb-0': isMedium,
            'mb-4 w-25': !isMedium,
          })}
          placeholder={intl.formatMessage(messages.searchPlaceholder)}
          onChange={(value: string) => {
            setSearchInput(value);
          }}
          onSubmit={(value: string) => {
            setSearchInput(value);
            handleSearch(value);
          }}
          value={initialSearchValue}
        />
      )}
    </>
  );
};

export default CourseCatalogSearchFieldSlot;
