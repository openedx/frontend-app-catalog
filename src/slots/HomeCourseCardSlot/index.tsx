import { CourseCard } from '@src/generic';
import type { HomeCourseCardSlotProps } from './types';

const HomeCourseCardSlot = ({ original: courseData, isLoading }: HomeCourseCardSlotProps) => {
  const courseCardProps = {
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
    <>
      <CourseCard {...courseCardProps} />
    </>
  );
};

export default HomeCourseCardSlot;
