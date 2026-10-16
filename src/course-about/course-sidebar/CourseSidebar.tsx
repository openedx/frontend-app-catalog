import { Card } from '@openedx/paragon';

import SidebarSocial from './sidebar-social/SidebarSocial';
import SidebarDetails from './sidebar-details/SidebarDetails';
import type { CourseAboutData } from '../types';

const CourseSidebar = ({ courseAboutData, shareUrl }: {
  courseAboutData: CourseAboutData;
  shareUrl?: string | null;
}) => (
  <Card>
    <Card.Section className="p-0">
      {/* An explicit null means no share target is available, so hide sharing
          rather than falling back to the current (pathway) URL. */}
      {shareUrl !== null && <SidebarSocial courseAboutData={courseAboutData} shareUrl={shareUrl} />}
      <SidebarDetails courseAboutData={courseAboutData} />
    </Card.Section>
  </Card>
);

export default CourseSidebar;
