# Home Course Card Slot

### Slot ID: `org.openedx.frontend.slot.catalog.homeCourseCard.v1`

### Slot Props

* `isLoading?: boolean` — whether the card is in a loading state.
* `courseId?: string` — the course's unique identifier.
* `courseOrg?: string` — the organization offering the course.
* `courseName?: string` — the course's display name.
* `courseNumber?: string` — the course number.
* `courseImageUrl?: string` — URL of the course image.
* `courseStartDate?: string` — the course's start date in ISO format.
* `courseAdvertisedStart?: string` — the course's advertised start date.

## Description

This slot is used to replace/modify/hide the entire Home page course card.

## Examples

### Default content

![Home page course card slot with default content](./images/screenshot_default.png)

### Replaced with a simple custom component

![🃏 in Home page course card slot](./images/screenshot_custom_simple.png)

Add the following to your site config to replace the Home page course card entirely (in this case with a large "🃏" `div`). The diff below is against this app's `site.config.dev.tsx`.

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
+          slotId: 'org.openedx.frontend.slot.catalog.homeCourseCard.v1',
+          id: 'customHomeCourseCard',
+          op: WidgetOperationTypes.REPLACE,
+          relatedId: 'defaultContent',
+          element: <div className="display-4">🃏</div>,
+        },
+      ],
     },
   ],
 };
```

### Replaced with a custom component using the slot's props

![Custom card in Home page course card slot](./images/screenshot_custom_with_props.png)

Add the following to your site config to replace the Home page course card with a custom card component that uses the slot's props. The diff below is against this app's `site.config.dev.tsx`.

```diff
-import { EnvironmentTypes, SiteConfig, ... } from '@openedx/frontend-base';
+import { EnvironmentTypes, WidgetOperationTypes, SiteConfig, ... } from '@openedx/frontend-base';

-import { catalogApp } from './src';
+import { catalogApp, type HomeCourseCardSlotProps } from './src';

+import { Card, Badge } from '@openedx/paragon';
+import { Link } from 'react-router-dom';
+
 import '@openedx/frontend-base/shell/style';

+const customCourseCard = ({
+  isLoading,
+  courseId,
+  courseOrg,
+  courseName,
+  courseNumber,
+  courseStartDate,
+}: HomeCourseCardSlotProps) => {
+  if (isLoading) { return <Card isLoading />; }
+  if (!courseId) { return null; }
+
+  return (
+    <Card as={Link} to={`/catalog/courses/${courseId}/about`} isClickable>
+      <Card.Header
+        title={courseName}
+        subtitle={<Badge>{courseOrg}</Badge>}
+      />
+      <Card.Section>
+        <p className="text-muted small">Course Number: {courseNumber}</p>
+      </Card.Section>
+      <Card.Footer textElement={courseStartDate ? `Starts: ${courseStartDate}` : ''} />
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
+          slotId: 'org.openedx.frontend.slot.catalog.homeCourseCard.v1',
+          id: 'customHomeCourseCard',
+          op: WidgetOperationTypes.REPLACE,
+          relatedId: 'defaultContent',
+          component: customCourseCard,
+        },
+      ],
     },
   ],
 };
```
