import { Stack, Container, Card } from '@openedx/paragon';
import { ListView as ListViewIcon } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Link } from 'react-router-dom';

import CourseAboutSidebarCoursePriceSlot from '@src/plugin-slots/CourseAboutSidebarCoursePriceSlot';
import { ROUTES } from '@src/routes';
import type { CourseAboutData } from '../../types';
import SidebarDetailsItem from './SidebarDetailsItem';
import { getSidebarDetails } from './utils';
import messages from './messages';

const SidebarDetails = ({ courseAboutData }: { courseAboutData: CourseAboutData }) => {
  const intl = useIntl();

  const renderPrerequisites = () => {
    if (!courseAboutData.preRequisiteCourses?.length) {
      return null;
    }

    const prerequisite = courseAboutData.preRequisiteCourses[0];
    const prerequisiteUrl = ROUTES.COURSE_ABOUT.replace(':courseId', prerequisite.key);

    return (
      <>
        <SidebarDetailsItem
          key="prerequisites"
          icon={ListViewIcon}
          label={intl.formatMessage(messages.prerequisites)}
          value={<Link to={prerequisiteUrl}>{prerequisite.display}</Link>}
        />
        <Container className="p-3">
          {intl.formatMessage(messages.prerequisitesCompletion, {
            prerequisite: <Link to={prerequisiteUrl}>{prerequisite.display}</Link>,
          })}
        </Container>
        <Card.Divider />
      </>
    );
  };

  const renderAboutSidebarHtml = () => {
    if (!courseAboutData.aboutSidebarHtml) {
      return null;
    }

    return (
      <Container className="p-3">
        {/* eslint-disable-next-line react/no-danger */}
        <div dangerouslySetInnerHTML={{ __html: courseAboutData.aboutSidebarHtml }} />
      </Container>
    );
  };

  return (
    <Stack>
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
      {courseAboutData.coursePrice && (
        <CourseAboutSidebarCoursePriceSlot coursePrice={courseAboutData.coursePrice} />
      )}
      {renderPrerequisites()}
      {renderAboutSidebarHtml()}
    </Stack>
  );
};

export default SidebarDetails;
