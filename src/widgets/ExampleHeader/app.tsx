import { App, LinkMenuItem, WidgetOperationTypes } from '@openedx/frontend-base';

import { catalogRole } from '../../constants';

const app: App = {
  appId: 'org.openedx.frontend.app.catalog.exampleHeader',
  slots: [
    {
      slotId: 'org.openedx.frontend.slot.header.primaryLinks.v1',
      id: 'org.openedx.frontend.widget.catalog.exampleHeaderLink.v1',
      op: WidgetOperationTypes.APPEND,
      element: (
        <LinkMenuItem
          label="Example Menu"
          role={catalogRole}
          variant="navLink"
        />
      ),
      condition: {
        active: [catalogRole],
      },
    },
  ],
};

export default app;
