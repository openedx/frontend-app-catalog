import { Card } from '@openedx/paragon';

import SidebarSocial from './sidebar-social/SidebarSocial';
import SidebarDetails from './sidebar-details/SidebarDetails';

const CourseSidebar = ({ courseAboutData }) => (
  <Card className="course-sidebar">
    <Card.Section className="p-0">
      <SidebarSocial courseAboutData={courseAboutData} />
      <SidebarDetails courseAboutData={courseAboutData} />
    </Card.Section>
  </Card>
);

export default CourseSidebar;
