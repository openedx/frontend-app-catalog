# ExampleSlot

A demonstration slot, rendered inside `ExamplePage`, showing how this app
exposes an extension point consumers can fill via `site.config.*.tsx`.

## Slot ID

`org.openedx.frontend.slot.catalog.example.v1`

## Example: appending a widget from site config

```tsx
import { WidgetOperationTypes } from '@openedx/frontend-base';
import { exampleSlotId } from '@openedx/frontend-app-catalog/src/slots/ExampleSlot/ExampleSlot';

const siteConfig: SiteConfig = {
  // ...
  apps: [
    {
      ...catalogApp,
      slots: [
        {
          slotId: exampleSlotId,
          id: 'org.openedx.frontend.widget.catalog.example.hello',
          op: WidgetOperationTypes.APPEND,
          element: <p>Hello from a site-supplied widget!</p>,
        },
      ],
    },
  ],
};
```
