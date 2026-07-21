# Slots

Slots this app _offers_ to consumers. Each subdirectory is one slot, with
its component, its ID export, and a README describing what consumers are
expected to supply.

For slot operations the app _applies_ to the shell (header, footer, etc.),
see `src/slots.tsx` instead.

See the [frontend-base slots
documentation](https://github.com/openedx/frontend-base/blob/main/docs/decisions/0009-slot-naming-and-lifecycle.rst)
for naming conventions and lifecycle details.

## Ported slots

### Home page

- [`org.openedx.frontend.slot.catalog.homeBanner.v1`](./HomeBannerSlot/)
- [`org.openedx.frontend.slot.catalog.homeOverlayHtml.v1`](./HomeOverlayHtmlSlot/)
- [`org.openedx.frontend.slot.catalog.homeCoursesList.v1`](./HomeCoursesListSlot/)
- [`org.openedx.frontend.slot.catalog.homeCourseCard.v1`](./HomeCourseCardSlot/)
- [`org.openedx.frontend.slot.catalog.homePromoVideoButton.v1`](./HomePromoVideoSlots/HomePromoVideoButtonSlot/)
- [`org.openedx.frontend.slot.catalog.homePromoVideoModal.v1`](./HomePromoVideoSlots/HomePromoVideoModalSlot/)
- [`org.openedx.frontend.slot.catalog.homePromoVideoModalContent.v1`](./HomePromoVideoSlots/HomePromoVideoModalContentSlot/)

### Course About page

- [`org.openedx.frontend.slot.catalog.courseAboutIntro.v1`](./CourseAboutIntroSlot/)
- [`org.openedx.frontend.slot.catalog.courseAboutCourseMedia.v1`](./CourseAboutCourseMediaSlot/)
- [`org.openedx.frontend.slot.catalog.courseAboutOverview.v1`](./CourseAboutOverviewSlot/)
- [`org.openedx.frontend.slot.catalog.courseAboutSidebar.v1`](./CourseAboutSidebarSlot/)
- [`org.openedx.frontend.slot.catalog.courseAboutSidebarSocial.v1`](./CourseAboutSidebarSocialSlot/)
- [`org.openedx.frontend.slot.catalog.courseAboutSidebarCoursePrice.v1`](./CourseAboutSidebarCoursePriceSlot/)
- [`org.openedx.frontend.slot.catalog.courseAboutIntroVideoButton.v1`](./CourseAboutIntroVideoSlots/CourseAboutIntroVideoButtonSlot/)
- [`org.openedx.frontend.slot.catalog.courseAboutIntroVideoModal.v1`](./CourseAboutIntroVideoSlots/CourseAboutIntroVideoModalSlot/)
- [`org.openedx.frontend.slot.catalog.courseAboutIntroVideoModalContent.v1`](./CourseAboutIntroVideoSlots/CourseAboutIntroVideoModalContentSlot/)

### Generic

- [`org.openedx.frontend.slot.catalog.loader.v1`](./LoaderSlot/)

## Not yet ported

These slots still use the placeholder `<>{children}</>` shape from the
bulk port; their `Slot` API port and READMEs are pending.

- `CourseAboutCourseImageSlot`
- `CourseAboutEnrollmentButtonSlot`
- `CourseCatalogIntroSlot`
- `CourseCatalogSearchFieldSlot`
- `CourseCatalogDataTableSlots/CourseCatalogDataTableSlot`
- `CourseCatalogDataTableSlots/CourseCatalogDataTableCardViewSlot`
- `CourseCatalogDataTableSlots/CourseCatalogDataTableControlBarSlot`
- `CourseCatalogDataTableSlots/CourseCatalogDataTableCardViewSlot/CourseCatalogDataTableCourseCardSlot`
- `CourseCatalogDataTableSlots/CourseCatalogDataTableTableFooterSlot`
