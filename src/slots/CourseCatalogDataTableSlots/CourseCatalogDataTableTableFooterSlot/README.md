# Course Catalog Data Table Table Footer Slot

### Slot ID: `org.openedx.frontend.slot.catalog.courseCatalogDataTableTableFooter.v1`

## Description

This slot is used to replace/modify/hide the entire Course catalog page data table footer.

## Examples

### Default content

![Course catalog page data table footer slot with default content](./images/screenshot_default.png)

### Wrapped with a red border (custom layout)

![Table footer wrapped in a dashed red border](./images/screenshot_custom_wrap.png)

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
+          slotId: 'org.openedx.frontend.slot.catalog.courseCatalogDataTableTableFooter.v1',
+          op: LayoutOperationTypes.REPLACE,
+          component: BorderedLayout,
+        },
+      ],
     },
   ],
 };
```

### Replaced with a simple custom component

![🦶 in Course catalog page data table footer slot](./images/screenshot_custom_simple.png)

Add the following to your site config to replace the Course catalog data table footer entirely (in this case with a centered "🦶" `h1` tag).

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
+          slotId: 'org.openedx.frontend.slot.catalog.courseCatalogDataTableTableFooter.v1',
+          id: 'customCourseCatalogDataTableTableFooter',
+          op: WidgetOperationTypes.REPLACE,
+          relatedId: 'defaultContent',
+          element: <h1 className="p-4" style={{ textAlign: 'center' }}>🦶</h1>,
+        },
+      ],
     },
   ],
 };
```
