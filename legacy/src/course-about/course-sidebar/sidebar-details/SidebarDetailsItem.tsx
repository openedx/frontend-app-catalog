import { Icon, Stack, Card } from '@openedx/paragon';

import type { SidebarDetailsItemProps } from './types';

const SidebarDetailsItem = ({ icon, label, value }: SidebarDetailsItemProps) => (
  <>
    <Stack className="justify-content-between flex-wrap p-3" gap={2} direction="horizontal">
      <Stack direction="horizontal" gap={2}>
        <Icon src={icon} />
        <span data-testid="sidebar-details-item-label">{label}</span>
      </Stack>
      <span className="font-weight-bolder" data-testid="sidebar-details-item-value">{value}</span>
    </Stack>
    <Card.Divider />
  </>
);

export default SidebarDetailsItem;
