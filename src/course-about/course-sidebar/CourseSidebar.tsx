import { Card } from '@openedx/paragon';

import SidebarSocial from './sidebar-social/SidebarSocial';
import SidebarDetails from './sidebar-details/SidebarDetails';

const CourseSidebar = ({ courseAboutData, frontendConfigData }) => (
  <Card className="course-sidebar">
    <Card.Section className="p-0">
      {frontendConfigData.courseAboutShowSocialLinks && (
        <SidebarSocial
          courseAboutData={courseAboutData}
          frontendConfigData={frontendConfigData}
        />
      )}
      <SidebarDetails courseAboutData={courseAboutData} frontendConfigData={frontendConfigData} />
    </Card.Section>
  </Card>
);

export default CourseSidebar;
