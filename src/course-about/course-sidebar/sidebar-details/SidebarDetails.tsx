import { Stack } from '@openedx/paragon';
import { ListView as ListViewIcon, Link as LinkIcon } from '@openedx/paragon/icons';
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

  // TODO: clarify about ocw links and prerequisites (https://openedx.slack.com/archives/C08QR8K7K38/p1750850752472279)
  const renderOcwLinks = () => {
    // if (!courseAboutData.ocwLinks?.length) { return null; }
    const ocwLinks = [
      '<a href="https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/">Introduction to Algorithms</a>',
      '<a href="https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/">Introduction to Algorithms</a>',
    ];

    const htmlString = ocwLinks.join('');
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    const links = doc.querySelectorAll('a');

    return (
      <>
        <SidebarDetailsItem
          key="ocw-links"
          icon={LinkIcon}
          label="Additional Resources"
        />
        <div>
          <span className="px-3 m-0 mb-3 border-bottom-0 border-top-0">
            {/* "MITOpenCourseware" should *not* be translated */}
            MITOpenCourseware
          </span>
          {Array.from(links).map((link) => (
            <p key={link.href} className="course-sidebar-course-details-prerequisites m-0 mb-3 border-bottom-0 border-top-0">
              <a href={link.href} target="_blank" rel="noopener noreferrer">
                {link.textContent}
              </a>
            </p>
          ))}
        </div>
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
      {renderOcwLinks()}
    </Stack>
  );
};

export default SidebarDetails;
