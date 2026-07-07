import { Slot } from '@openedx/frontend-base';

import { CourseCard } from '@src/generic';
import type { Course } from '@src/generic/course-card/types';

export interface HomeCourseCardSlotProps {
  isLoading?: boolean,
  courseId?: string,
  courseOrg?: string,
  courseName?: string,
  courseNumber?: string,
  courseImageUrl?: string,
  courseStartDate?: string,
  courseAdvertisedStart?: string,
}

const HomeCourseCardSlot = ({
  original: courseData,
  isLoading,
}: {
  original?: Course,
  isLoading?: boolean,
}) => {
  const slotProps: HomeCourseCardSlotProps = {
    isLoading,
    courseId: courseData?.id,
    courseOrg: courseData?.data.org,
    courseName: courseData?.data.content.displayName,
    courseNumber: courseData?.data.number,
    courseImageUrl: courseData?.data.imageUrl,
    courseStartDate: courseData?.data.start,
    courseAdvertisedStart: courseData?.data.advertisedStart,
  };

  return (
    <Slot
      id="org.openedx.frontend.slot.catalog.homeCourseCard.v1"
      {...slotProps}
    >
      <CourseCard {...slotProps} />
    </Slot>
  );
};

export default HomeCourseCardSlot;
