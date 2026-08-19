# Course catalog page data table pathway card slot

### Slot ID: `org.openedx.frontend.catalog.course_catalog_page.data_table.pathway_card`

## Description

This slot is used to replace/modify/hide the pathway card rendered in the Course catalog page data table card view.

## Default content

The default content is the [`PathwayCard`](../../../../generic/pathway-card/) component.

### Plugin Props

* `isLoading` - Boolean. Indicates whether the pathway card is currently in a loading state.
* `pathwayId` - String. The unique identifier of the pathway.
* `name` - String. The display name of the pathway.
* `org` - String. The organization that offers the pathway.
* `courseCount` - Number. The number of courses in the pathway.
* `imageUrl` - String. The URL path to the pathway image.
* `startDate` - String. The start date of the pathway in ISO format.
* `advertisedStart` - String. The advertised start date of the pathway.
* `categoryLabel` - String. The pathway category label.
