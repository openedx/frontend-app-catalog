# Course about overview slot

### Slot ID: `org.openedx.frontend.catalog.course_about_page.overview`

## Description

This slot is used to replace/modify/hide the entire course about overview section on the Course about page.

## Examples

### Default content

![Course overview slot with default content](./images/screenshot_default.png)

### Replaced with custom component

![🦶 in Course About page overview slot](./images/screenshot_custom.png)

The following `env.config.tsx` will replace the Course About page overview slot entirely (in this case with a centered `h1` tag)

```tsx
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';

const config = {
  pluginSlots: {
    'org.openedx.frontend.catalog.course_about_page.overview': {
      keepDefault: false,
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'custom_about_page_overview_component',
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
