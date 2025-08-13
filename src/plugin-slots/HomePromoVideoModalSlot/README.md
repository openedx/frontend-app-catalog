# Home page promo video modal slot

### Slot ID: `org.openedx.frontend.catalog.home_page.promo_video_modal`

### Slot ID Aliases
* `home_page_promo_video_modal_slot`

## Description

This slot is used to replace/modify/hide the entire Home page promo video modal.

## Examples

### Default content
![Home page promo video modal slot with default content](./images/screenshot_default.png)

### Replaced with custom component
![Dashed border around Home page promo video modal slot](./images/screenshot_custom.png)

The following `env.config.tsx` will wrap the Home page promo video modal entirely (in this case with a dashed border)

```tsx
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';

const config = {
  pluginSlots: {
    'org.openedx.frontend.catalog.home_page.promo_video_modal': {
      keepDefault: true,
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Wrap,
          widgetId: 'custom_home_page_promo_video_modal_component',
          wrapper: ({ component }) => {
            if (component.props.isOpen) {
              return (
                <div className="position-fixed zindex-9" style={{ inset: 0, border: 'thick dashed red' }}>
                  {component}
                </div>
              )
            }

            return component;
          },
        },
      ],
    },
  }
};

export default config;
```
