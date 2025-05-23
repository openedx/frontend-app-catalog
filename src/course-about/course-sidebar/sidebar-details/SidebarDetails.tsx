import { Stack } from '@openedx/paragon';
import { ListView as ListViewIcon } from '@openedx/paragon/icons';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';

import SidebarDetailsItem from './SidebarDetailsItem';
import { SidebarDetailsProps } from './types';
import { getSidebarDetails } from './utils';
import messages from './messages';

const SidebarDetails = ({ courseAboutData }: SidebarDetailsProps) => {
  const intl = useIntl();

  const renderPrerequisites = () => {
    if (!courseAboutData.preRequisiteCourses.length) { return null; }

    const prerequisite = courseAboutData.preRequisiteCourses[0];
    const prerequisiteUrl = `${getConfig().LMS_BASE_URL}/courses/${prerequisite.key}/about`;

    return (
      <>
        <SidebarDetailsItem
          key="prerequisites"
          icon={ListViewIcon}
          label={intl.formatMessage(messages.prerequisites)}
          value={<a href={prerequisiteUrl}>{prerequisite.display}</a>}
        />
        <p className="course-sidebar-course-details-prerequisites m-0 mb-3 border-bottom-0 border-top-0">
          {intl.formatMessage(messages.prerequisitesCompletion, {
            prerequisite: <a href={prerequisiteUrl}>{prerequisite.display}</a>,
          })}
        </p>
      </>
    );
  };

  return (
    <Stack direction="vertical">
      {getSidebarDetails(intl, courseAboutData)
        .filter(detail => detail.show)
        .map(detail => (
          <SidebarDetailsItem
            key={detail.key}
            icon={detail.icon}
            label={detail.label}
            value={detail.value}
          />
        ))}
      {renderPrerequisites()}
    </Stack>
  );
};

export default SidebarDetails;
