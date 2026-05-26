import { Card } from '@openedx/paragon';

import SidebarSocial from './sidebar-social/SidebarSocial';
import SidebarDetails from './sidebar-details/SidebarDetails';
import type { CourseAboutData } from '../types';

const CourseSidebar = ({ courseAboutData }: { courseAboutData: CourseAboutData }) => (
  <Card>
    <Card.Section className="p-0">
      <SidebarSocial courseAboutData={courseAboutData} />
      <SidebarDetails courseAboutData={courseAboutData} />
    </Card.Section>
  </Card>
);

export default CourseSidebar;
