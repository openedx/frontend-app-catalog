import { breakpoints, SearchField, useMediaQuery } from '@openedx/paragon';
import { getAppConfig, Slot, useIntl } from '@openedx/frontend-base';
import classNames from 'classnames';

import { appId } from '@src/constants';
import messages from '@src/catalog/messages';

export interface CourseCatalogSearchFieldSlotProps {
  setSearchInput: (value: string) => void,
  handleSearch: (value: string) => void,
  initialSearchValue?: string,
}

const CourseCatalogSearchFieldSlot = ({
  setSearchInput,
  handleSearch,
  initialSearchValue,
}: CourseCatalogSearchFieldSlotProps) => {
  const intl = useIntl();
  const isMedium = useMediaQuery({ maxWidth: breakpoints.large.maxWidth });

  return (
    <Slot
      id="org.openedx.frontend.slot.catalog.courseCatalogSearchField.v1"
      setSearchInput={setSearchInput}
      handleSearch={handleSearch}
      initialSearchValue={initialSearchValue}
    >
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
    </Slot>
  );
};

export default CourseCatalogSearchFieldSlot;
