# Course Catalog Data Table Pathway Card Slot

### Slot ID: `org.openedx.frontend.slot.catalog.courseCatalogDataTablePathwayCard.v1`

### Slot Props

* `isLoading?: boolean` — whether the card is in a loading state.
* `pathwayId?: string` — the pathway's unique identifier.
* `name?: string` — the pathway's display name.
* `org?: string` — the organization offering the pathway.
* `itemCount?: number` — how many items the pathway contains.
* `imageUrl?: string` — URL of the pathway image.
* `startDate?: string` — the pathway's start date in ISO format.
* `advertisedStart?: string` — the pathway's advertised start date.
* `category?: string` — the pathway's category slug.
* `categoryLabel?: string` — the pathway's category label, shown as a badge when set.
* `categoryBackgroundColor?: string` — optional CSS color for the badge background.
* `categoryTextColor?: string` — optional CSS color for the badge text.

## Description

This slot is used to replace/modify/hide an entire Course catalog page data table
pathway card.

The catalog's card view renders one card per search result, so only pathway
results reach this slot; courses go to
[`courseCatalogDataTableCourseCard`](../CourseCatalogDataTableCourseCardSlot/).
The card and its style follow the shared badge styling, and nothing is rendered
while ``ENABLE_PATHWAY_PILOT_UI`` is unset or not exactly ``true``.

## Examples

### Replaced with a simple custom component

Add the following to your site config to replace the pathway card entirely (in this case with a large "🛤️" `div`). The diff below is against this app's `site.config.dev.tsx`.

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
+          slotId: 'org.openedx.frontend.slot.catalog.courseCatalogDataTablePathwayCard.v1',
+          id: 'customDataTablePathwayCard',
+          op: WidgetOperationTypes.REPLACE,
+          relatedId: 'defaultContent',
+          element: <div className="display-4">🛤️</div>,
+        },
+      ],
     },
   ],
 };
```

### Replaced with a custom component using the slot's props

```diff
-import { catalogApp } from './src';
+import { catalogApp, type CourseCatalogDataTablePathwayCardSlotProps } from './src';

+import { Badge, Card } from '@openedx/paragon';
+
 import '@openedx/frontend-base/shell/style';

+const customPathwayCard = ({
+  isLoading,
+  pathwayId,
+  name,
+  org,
+  itemCount,
+  categoryLabel,
+}: CourseCatalogDataTablePathwayCardSlotProps) => {
+  if (isLoading) { return <Card isLoading />; }
+  if (!pathwayId) { return null; }
+
+  return (
+    <Card data-testid="custom-pathway-card">
+      <Card.Header
+        title={name}
+        subtitle={<Badge variant="light">{org}</Badge>}
+        size="sm"
+      />
+      <Card.Section>
+        <p className="text-muted small">{itemCount} courses ({categoryLabel})</p>
+      </Card.Section>
+    </Card>
+  );
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
+          slotId: 'org.openedx.frontend.slot.catalog.courseCatalogDataTablePathwayCard.v1',
+          id: 'customDataTablePathwayCard',
+          op: WidgetOperationTypes.REPLACE,
+          relatedId: 'defaultContent',
+          component: customPathwayCard,
+        },
+      ],
     },
   ],
 };
```
