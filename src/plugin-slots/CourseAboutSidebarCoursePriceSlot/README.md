# Course about page sidebar course price slot

### Slot ID: `org.openedx.frontend.catalog.course_about_page.sidebar.details.course_price`

## Description

This slot is used to replace/modify/hide the entire Course about page course price sidebar block.

## Examples

### Default content

![Course about page sidebar course price slot with default content](./images/screenshot_default.png)

### Replaced with custom component

![🦶 in Course about page sidebar course price slot](./images/screenshot_custom.png)

The following `env.config.tsx` will replace the Course about page course price sidebar block entirely (in this case with a centered `h1` tag)

```tsx
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';

const config = {
  pluginSlots: {
    'org.openedx.frontend.catalog.course_about_page.sidebar.details.course_price': {
      keepDefault: false,
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'custom_course_about_page_course_price_component',
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

### Hide item

![Hide sidebar course price](./images/hidden_course_price_in_the_sidebar.png)

The following `env.config.jsx` will hide the sidebar course price section entirely.

```tsx
import { PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';

const config = {
  pluginSlots: {
    'org.openedx.frontend.catalog.course_about_page.sidebar.details.course_price': {
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Hide,
          widgetId: 'hidden_course_about_page_course_price_component',
        },
      ]
    }
  },
}

export default config;
```
