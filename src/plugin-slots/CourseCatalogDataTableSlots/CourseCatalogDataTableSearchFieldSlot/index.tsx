import { PluginSlot } from '@openedx/frontend-plugin-framework';
import { breakpoints, SearchField, useMediaQuery } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import classNames from 'classnames';

import messages from '@src/catalog/messages';
import type { CourseCatalogDataTableSearchFieldSlotProps } from './types';

const CourseCatalogDataTableSearchFieldSlot = ({
  setSearchInput,
  handleSearch,
}: CourseCatalogDataTableSearchFieldSlotProps) => {
  const intl = useIntl();
  const isMedium = useMediaQuery({ maxWidth: breakpoints.large.maxWidth });

  return (
    <PluginSlot
      id="org.openedx.frontend.catalog.course_catalog_page.data_table.search_field"
      slotOptions={{
        mergeProps: true,
      }}
      pluginProps={{
        setSearchInput,
        handleSearch,
      }}
    >
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
      />
    </PluginSlot>
  );
};

export default CourseCatalogDataTableSearchFieldSlot;
