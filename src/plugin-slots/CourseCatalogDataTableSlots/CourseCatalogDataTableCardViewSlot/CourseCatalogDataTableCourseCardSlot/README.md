# Course catalog page data table course card slot

### Slot ID: `org.openedx.frontend.catalog.course_catalog_page.data_table.course_card`

## Description

This slot is used to replace/modify/hide the entire Course catalog page data table course card.

### Plugin Props:

* `courseData` - Object. The course object containing course information such as id, display name, organization, number, image URL, and other course metadata.
* `isLoading` - Boolean. Indicates whether the course card is currently in a loading state.

## Examples

### Default content

![Course catalog page data table course card slot with default content](./images/screenshot_default.png)

### Replaced with custom component

![🦶 in Course catalog page data table course card slot](./images/screenshot_custom.png)

The following `env.config.tsx` will replace the Course catalog page data table course card entirely (in this case with a centered `h1` tag)

```tsx
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';

const config = {
  pluginSlots: {
    'org.openedx.frontend.catalog.course_catalog_page.data_table.course_card': {
      keepDefault: false,
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'custom_course_catalog_page_data_table_course_card_component',
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

### Custom component with plugin props

![Custom course card component in Course catalog page data table course card slot](./images/screenshot_custom_with_card.png)

The following `env.config.tsx` example demonstrates how to replace the Course catalog page data table course card slot with a custom component that uses the plugin props (`original` and `isLoading`). In this case, it creates a custom card component that displays course information in a different format.

```tsx
import { DIRECT_PLUGIN, PLUGIN_OPERATIONS } from '@openedx/frontend-plugin-framework';
import { Card, Badge } from '@openedx/paragon';
import { Link } from 'react-router-dom';

const config = {
  pluginSlots: {
    'org.openedx.frontend.catalog.course_catalog_page.data_table.course_card': {
      keepDefault: false,
      plugins: [
        {
          op: PLUGIN_OPERATIONS.Insert,
          widget: {
            id: 'custom_course_catalog_page_data_table_course_card_component',
            type: DIRECT_PLUGIN,
            RenderWidget: ({ courseData, isLoading }) => {
              if (isLoading) {
                return <Card isLoading />;
              }

              if (!courseData) {
                return null;
              }

              return (
                <Card
                  as={Link}
                  to={`/courses/${courseData.id}/about`}
                  isClickable
                >
                  <Card.Header
                    title={courseData.data.content.displayName}
                    subtitle={
                      <Badge>{courseData.data.org}</Badge>
                    }
                  />
                  <Card.Section>
                    {courseData.data.content.overview && (
                      <p className="text-muted font-size-sm">
                        {courseData.data.content.overview.substring(0, 150)}...
                      </p>
                    )}
                  </Card.Section>
                  <Card.Footer textElement={`Language: ${courseData.data.language}`} />
                </Card>
              );
            },
          },
        },
      ]
    }
  },
}

export default config;
```
