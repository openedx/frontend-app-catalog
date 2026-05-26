# Course catalog page data table footer slot

### Slot ID: `org.openedx.frontend.catalog.course_catalog_page.data_table.table_footer`

## Description

This slot is used to replace/modify/hide the entire Course catalog page data table footer.

## Examples

### Default content

![Course catalog page data table footer slot with default content](./images/screenshot_default.png)

### Replaced with custom component

![🦶 in Course catalog page data table footer slot](./images/screenshot_custom.png)

The following `env.config.tsx` will replace the Course catalog page data table footer entirely (in this case with a centered `h1` tag)

```tsx
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';

const config = {
  pluginSlots: {
    'org.openedx.frontend.catalog.course_catalog_page.data_table.table_footer': {
      keepDefault: false,
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'custom_course_catalog_page_data_table_footer_component',
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
