import { Slot } from '@openedx/frontend-base';

import CoursesList from '@src/home/components/courses-list/CoursesList';

const HomeCoursesListSlot = () => (
  <Slot id="org.openedx.frontend.slot.catalog.homeCoursesList.v1">
    <CoursesList />
  </Slot>
);

export default HomeCoursesListSlot;
