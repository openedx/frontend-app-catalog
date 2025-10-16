import { Card } from '@openedx/paragon';

import CourseAboutSidebarSocialSlot from '@src/plugin-slots/CourseAboutSidebarSocialSlot';
import SidebarDetails from './sidebar-details/SidebarDetails';
import type { CourseAboutData } from '../types';

const CourseSidebar = ({ courseAboutData }: { courseAboutData: CourseAboutData }) => (
  <Card>
    <Card.Section className="p-0">
      <CourseAboutSidebarSocialSlot courseAboutData={courseAboutData} />
      <SidebarDetails courseAboutData={courseAboutData} />
    </Card.Section>
  </Card>
);

export default CourseSidebar;
