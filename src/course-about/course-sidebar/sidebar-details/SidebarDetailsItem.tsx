import { Icon, Stack } from '@openedx/paragon';

import type { SidebarDetailsItemProps } from './types';

const SidebarDetailsItem = ({ icon, label, value }: SidebarDetailsItemProps) => (
  <Stack className="course-sidebar-course-details justify-content-between border-bottom-0" direction="horizontal">
    <Stack direction="horizontal" gap={2}>
      <Icon src={icon} />
      <span className="course-sidebar-course-details-label">{label}</span>
    </Stack>
    <span className="font-weight-bolder course-sidebar-course-details-value">{value}</span>
  </Stack>
);

export default SidebarDetailsItem;
