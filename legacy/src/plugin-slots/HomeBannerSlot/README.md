# Home page banner slot

### Slot ID: `org.openedx.frontend.catalog.home_page.banner`

## Description

This slot is used to replace/modify/hide the entire Home page banner.

## Examples

### Default content

![Home page banner slot with default content](./images/screenshot_default.png)

### Replaced with custom component

![🦶 in Home page banner slot](./images/screenshot_custom.png)

The following `env.config.tsx` will replace the Home page banner entirely (in this case with a centered `h1` tag)

```tsx
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';

const config = {
  pluginSlots: {
    'org.openedx.frontend.catalog.home_page.banner': {
      keepDefault: false,
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'custom_home_page_banner_component',
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
