# Home Banner Slot

### Slot ID: `catalog.home_page.home_banner`

### Slot ID Aliases
* `home_banner`

## Description

This slot is used to replace/modify/hide the entire home panner.

## Examples

### Custom Component

The following `env.config.tsx` will replace the home banner entirely (in this case with a centered 🗺️ `h1`)

![Screenshot of custom component](./images/desktop_header_custom_component.png)

```tsx
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';

const config = {
  pluginSlots: {
    'catalog.home_page.home_banner': {
      keepDefault: false,
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'custom_home_banner_component',
            type: DIRECT_PLUGIN,
            RenderWidget: () => (
              <h1 style={{textAlign: 'center'}}>Home banner</h1>
            ),
          },
        },
      ]
    }
  },
}

export default config;
```
