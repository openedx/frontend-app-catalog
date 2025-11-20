# Course about page sidebar slot

### Slot ID: `org.openedx.frontend.catalog.course_about_page.sidebar`

## Description

This slot is used to replace/modify/hide the entire Course about page sidebar.

## Examples

### Default content

![Course about page sidebar slot with default content](./images/screenshot_default.png)

### Replaced with custom component

![🦶 in Course about page sidebar slot](./images/screenshot_custom.png)

The following `env.config.tsx` will replace the Course about page sidebar entirely (in this case with a centered `h1` tag)

```tsx
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';

const config = {
  pluginSlots: {
    'org.openedx.frontend.catalog.course_about_page.sidebar': {
      keepDefault: false,
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'custom_course_about_page_sidebar_component',
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
