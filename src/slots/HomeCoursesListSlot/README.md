# Home Courses List Slot

### Slot ID: `org.openedx.frontend.slot.catalog.homeCoursesList.v1`

## Description

This slot is used to replace/modify/hide the entire Home page courses list.

Each result is dispatched to the card slot for its type: pathway results to
[`homePathwayCard`](../HomePathwayCardSlot/) and everything else to
[`homeCourseCard`](../HomeCourseCardSlot/).

## Examples

### Default content

![Home page courses list slot with default content](./images/screenshot_default.png)

### Wrapped with a red border (custom layout)

![Home page courses list wrapped in a dashed red border](./images/screenshot_custom_wrap.png)

To keep the default content but wrap it in extra markup, replace the slot's **layout**.

```diff
-import { EnvironmentTypes, SiteConfig, ... } from '@openedx/frontend-base';
+import { EnvironmentTypes, LayoutOperationTypes, SiteConfig, useWidgets, ... } from '@openedx/frontend-base';

 import { catalogApp } from './src';

 import '@openedx/frontend-base/shell/style';

+const BorderedLayout = () => {
+  const widgets = useWidgets();
+  return <div style={{ border: 'thick dashed red' }}>{widgets}</div>;
+};
+
 const siteConfig: SiteConfig = {
   // ...
   apps: [
     // ...
     {
       ...catalogApp,
+      slots: [
+        {
+          slotId: 'org.openedx.frontend.slot.catalog.homeCoursesList.v1',
+          op: LayoutOperationTypes.REPLACE,
+          component: BorderedLayout,
+        },
+      ],
     },
   ],
 };
```

### Replaced with a custom component

![📋 in Home page courses list slot](./images/screenshot_custom.png)

Add the following to your site config to replace the Home page courses list entirely (in this case with a centered "📋" `h1` tag). The diff below is against this app's `site.config.dev.tsx`.

```diff
-import { EnvironmentTypes, SiteConfig, ... } from '@openedx/frontend-base';
+import { EnvironmentTypes, WidgetOperationTypes, SiteConfig, ... } from '@openedx/frontend-base';

 const siteConfig: SiteConfig = {
   // ...
   apps: [
     // ...
     {
       ...catalogApp,
+      slots: [
+        {
+          slotId: 'org.openedx.frontend.slot.catalog.homeCoursesList.v1',
+          id: 'customHomeCoursesList',
+          op: WidgetOperationTypes.REPLACE,
+          relatedId: 'defaultContent',
+          element: <h1 style={{ textAlign: 'center' }}>📋</h1>,
+        },
+      ],
     },
   ],
 };
```
