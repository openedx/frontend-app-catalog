# Home Promo Video Modal Slot

### Slot ID: `org.openedx.frontend.slot.catalog.homePromoVideoModal.v1`

### Slot Props

* `isOpen: boolean` — whether the modal is open.
* `close: () => void` — handler that closes the modal.
* `videoId: string` — the YouTube video ID to embed.

## Description

This slot is used to replace/modify/hide the entire Home page promo video modal.

## Examples

### Default content

![Home page promo video modal slot with default content](./images/screenshot_default.png)

### Replaced with a custom modal using the slot's props

![Custom modal in Home page promo video modal slot](./images/screenshot_custom.png)

Add the following to your site config to replace the Home page promo video modal with a custom modal that consumes the slot's `isOpen`, `close`, and `videoId` props. The diff below is against this app's `site.config.dev.tsx`.

```diff
-import { EnvironmentTypes, SiteConfig, ... } from '@openedx/frontend-base';
+import { EnvironmentTypes, WidgetOperationTypes, SiteConfig, ... } from '@openedx/frontend-base';

-import { catalogApp } from './src';
+import { catalogApp, type HomePromoVideoModalSlotProps } from './src';

+import { Button } from '@openedx/paragon';
+
 import '@openedx/frontend-base/shell/style';

+const customVideoModal = ({ isOpen, close, videoId }: HomePromoVideoModalSlotProps) => {
+  if (!isOpen) return null;
+  return (
+    <div className="custom-video-modal-wrapper">
+      <iframe
+        src={`https://www.youtube.com/embed/${videoId}`}
+        width="100%"
+        height="100%"
+        frameBorder="0"
+        allowFullScreen
+      />
+      <Button onClick={close}>Close</Button>
+    </div>
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
+          slotId: 'org.openedx.frontend.slot.catalog.homePromoVideoModal.v1',
+          id: 'customHomePromoVideoModal',
+          op: WidgetOperationTypes.REPLACE,
+          relatedId: 'defaultContent',
+          component: customVideoModal,
+        },
+      ],
     },
   ],
 };
```
