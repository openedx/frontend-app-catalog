# Slots

Slots this app _offers_ to consumers. Each leaf subdirectory is one slot,
with its component, its ID export, and a README describing what consumers
are expected to supply. Related slots are grouped under a parent directory
whose `index.tsx` re-exports its children (e.g., `HomePromoVideoSlots/`,
`CourseAboutIntroVideoSlots/`, `CourseCatalogDataTableSlots/`).

For slot operations the app _applies_ to the shell (header, footer, etc.),
see `src/slots.tsx` instead.

See the [frontend-base slots
documentation](https://github.com/openedx/frontend-base/blob/main/docs/decisions/0009-slot-naming-and-lifecycle.rst)
for naming conventions and lifecycle details.

## Home page

- [`org.openedx.frontend.slot.catalog.homeBanner.v1`](./HomeBannerSlot/)
- [`org.openedx.frontend.slot.catalog.homeOverlayHtml.v1`](./HomeOverlayHtmlSlot/)
- [`org.openedx.frontend.slot.catalog.homeCoursesList.v1`](./HomeCoursesListSlot/)
- [`org.openedx.frontend.slot.catalog.homeCourseCard.v1`](./HomeCourseCardSlot/)
- [`org.openedx.frontend.slot.catalog.homePromoVideoButton.v1`](./HomePromoVideoSlots/HomePromoVideoButtonSlot/)
- [`org.openedx.frontend.slot.catalog.homePromoVideoModal.v1`](./HomePromoVideoSlots/HomePromoVideoModalSlot/)
- [`org.openedx.frontend.slot.catalog.homePromoVideoModalContent.v1`](./HomePromoVideoSlots/HomePromoVideoModalContentSlot/)

## Course Catalog page

- [`org.openedx.frontend.slot.catalog.courseCatalogIntro.v1`](./CourseCatalogIntroSlot/)
- [`org.openedx.frontend.slot.catalog.courseCatalogSearchField.v1`](./CourseCatalogSearchFieldSlot/)
- [`org.openedx.frontend.slot.catalog.courseCatalogDataTable.v1`](./CourseCatalogDataTableSlots/CourseCatalogDataTableSlot/)
- [`org.openedx.frontend.slot.catalog.courseCatalogDataTableControlBar.v1`](./CourseCatalogDataTableSlots/CourseCatalogDataTableControlBarSlot/)
- [`org.openedx.frontend.slot.catalog.courseCatalogDataTableCardView.v1`](./CourseCatalogDataTableSlots/CourseCatalogDataTableCardViewSlot/)
- [`org.openedx.frontend.slot.catalog.courseCatalogDataTableCourseCard.v1`](./CourseCatalogDataTableSlots/CourseCatalogDataTableCardViewSlot/CourseCatalogDataTableCourseCardSlot/)
- [`org.openedx.frontend.slot.catalog.courseCatalogDataTableTableFooter.v1`](./CourseCatalogDataTableSlots/CourseCatalogDataTableTableFooterSlot/)

## Course About page

- [`org.openedx.frontend.slot.catalog.courseAboutIntro.v1`](./CourseAboutIntroSlot/)
- [`org.openedx.frontend.slot.catalog.courseAboutEnrollmentButton.v1`](./CourseAboutEnrollmentButtonSlot/)
- [`org.openedx.frontend.slot.catalog.courseAboutCourseImage.v1`](./CourseAboutCourseImageSlot/)
- [`org.openedx.frontend.slot.catalog.courseAboutCourseMedia.v1`](./CourseAboutCourseMediaSlot/)
- [`org.openedx.frontend.slot.catalog.courseAboutOverview.v1`](./CourseAboutOverviewSlot/)
- [`org.openedx.frontend.slot.catalog.courseAboutSidebar.v1`](./CourseAboutSidebarSlot/)
- [`org.openedx.frontend.slot.catalog.courseAboutSidebarSocial.v1`](./CourseAboutSidebarSocialSlot/)
- [`org.openedx.frontend.slot.catalog.courseAboutSidebarCoursePrice.v1`](./CourseAboutSidebarCoursePriceSlot/)
- [`org.openedx.frontend.slot.catalog.courseAboutIntroVideoButton.v1`](./CourseAboutIntroVideoSlots/CourseAboutIntroVideoButtonSlot/)
- [`org.openedx.frontend.slot.catalog.courseAboutIntroVideoModal.v1`](./CourseAboutIntroVideoSlots/CourseAboutIntroVideoModalSlot/)
- [`org.openedx.frontend.slot.catalog.courseAboutIntroVideoModalContent.v1`](./CourseAboutIntroVideoSlots/CourseAboutIntroVideoModalContentSlot/)

## Generic

- [`org.openedx.frontend.slot.catalog.loader.v1`](./LoaderSlot/)
