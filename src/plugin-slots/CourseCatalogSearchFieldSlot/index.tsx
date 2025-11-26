import { PluginSlot } from '@openedx/frontend-plugin-framework';
import { breakpoints, SearchField, useMediaQuery } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import classNames from 'classnames';
import { getConfig } from '@edx/frontend-platform';

import messages from '@src/catalog/messages';
import type { CourseCatalogSearchFieldSlotProps } from './types';

const CourseCatalogSearchFieldSlot = ({
  setSearchInput,
  handleSearch,
}: CourseCatalogSearchFieldSlotProps) => {
  const intl = useIntl();
  const isMedium = useMediaQuery({ maxWidth: breakpoints.large.maxWidth });

  return (
    <PluginSlot
      id="org.openedx.frontend.catalog.course_catalog_page.search_field"
      slotOptions={{
        mergeProps: true,
      }}
      pluginProps={{
        setSearchInput,
        handleSearch,
      }}
    >
      {getConfig().ENABLE_COURSE_DISCOVERY && (
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
      )}
    </PluginSlot>
  );
};

export default CourseCatalogSearchFieldSlot;
