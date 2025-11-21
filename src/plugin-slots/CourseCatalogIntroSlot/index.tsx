import classNames from 'classnames';
import { useIntl } from '@edx/frontend-platform/i18n';
import { PluginSlot } from '@openedx/frontend-plugin-framework';
import { breakpoints, useMediaQuery } from '@openedx/paragon';

import { getPageTitle } from '@src/catalog/utils';
import { SubHeader } from '@src/generic';
import type { CourseCatalogIntroSlotProps } from './types';

const CourseCatalogIntroSlot = ({
  searchString,
  courseData,
}: CourseCatalogIntroSlotProps) => {
  const intl = useIntl();
  const isMedium = useMediaQuery({ maxWidth: breakpoints.medium.maxWidth });

  return (
    <PluginSlot
      id="org.openedx.frontend.catalog.course_catalog_page.intro"
      slotOptions={{
        mergeProps: true,
      }}
      pluginProps={{ searchString, courseData }}
    >
      <SubHeader
        title={getPageTitle({
          intl,
          searchString,
          courseData,
        })}
        className={classNames({ 'mx-2.5': isMedium })}
      />
    </PluginSlot>
  );
};

export default CourseCatalogIntroSlot;
