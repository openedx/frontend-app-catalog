# Home page course card slot

### Slot ID: `org.openedx.frontend.catalog.home_page.course_card`

## Description

This slot is used to replace/modify/hide the entire Home page course card.

## Examples

### Default content

![Home page course card with default content](./images/screenshot_default.png)

### Replaced with custom component

![🦶 in Home page course card slot](./images/screenshot_custom.png)

The following `env.config.tsx` will replace the Home page course card entirely (in this case with a centered `h1` tag)

```tsx
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';

const config = {
  pluginSlots: {
    'org.openedx.frontend.catalog.home_page.course_card': {
      keepDefault: false,
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'custom_home_page_course_card_component',
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
