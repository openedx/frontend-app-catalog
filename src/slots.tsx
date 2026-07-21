import { SlotOperation } from '@openedx/frontend-base';

import { catalogHeaderApp } from './widgets/CatalogHeader';

const slots: SlotOperation[] = [
  ...(catalogHeaderApp.slots ?? []),
];

export default slots;
