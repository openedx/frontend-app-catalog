# Course about page course media slot

### Slot ID: `org.openedx.frontend.catalog.course_about_page.course_media`

## Description

This slot is used to replace/modify/hide the entire Course about page course media section.

## Examples

### Default content

![Course about page course media slot with default content](./images/screenshot_default.png)

### Replaced with custom component

![🦶 in Course about page course media slot](./images/screenshot_custom.png)

The following `env.config.tsx` will replace the Course about page course media section entirely (in this case with a centered `h1` tag)

```tsx
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';

const config = {
  pluginSlots: {
    'org.openedx.frontend.catalog.course_about_page.course_media': {
      keepDefault: false,
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'custom_course_about_page_course_media_component',
            type: DIRECT_PLUGIN,
            RenderWidget: () => (
              <h1 style={{textAlign: 'center'}}>🦶</h1>
            ),
          },
        },
      ]
    }
  },
}

export default config;
```
