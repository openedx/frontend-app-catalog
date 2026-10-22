import { Card } from '@openedx/paragon';

import type { ShareTarget } from '@src/generic/share-links';

import SidebarSocial from './sidebar-social/SidebarSocial';
import SidebarDetails from './sidebar-details/SidebarDetails';
import type { CourseAboutData } from '../types';

const CourseSidebar = ({ courseAboutData, shareTarget }: {
  courseAboutData: CourseAboutData;
  shareTarget?: ShareTarget;
}) => (
  <Card>
    <Card.Section className="p-0">
      {/* A hidden policy means no share target is available, so the social
          controls and their Slot are not rendered at all. */}
      {shareTarget?.kind !== 'hidden' && (
        <SidebarSocial courseAboutData={courseAboutData} shareTarget={shareTarget} />
      )}
      <SidebarDetails courseAboutData={courseAboutData} />
    </Card.Section>
  </Card>
);

export default CourseSidebar;
