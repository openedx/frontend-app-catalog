# Home page overlay HTML slot

### Slot ID: `org.openedx.frontend.catalog.home_page.overlay_html`

## Description

This slot is used to replace/modify/hide the entire Home page overlay HTML.

## Examples

### Default content

![Home page overlay HTML slot with default content](./images/screenshot_default.png)

### Replaced with custom component

![🦶 in Home page overlay HTML slot](./images/screenshot_custom.png)

The following `env.config.tsx` will replace the Home page overlay HTML entirely (in this case with a centered `h1` tag)

```tsx
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';

const config = {
  pluginSlots: {
    'org.openedx.frontend.catalog.home_page.overlay_html': {
      keepDefault: false,
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'custom_home_page_overlay_html_component',
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
