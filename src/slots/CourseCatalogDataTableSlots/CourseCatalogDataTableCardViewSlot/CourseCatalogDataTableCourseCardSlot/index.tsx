import { CourseCard } from '@src/generic';
import type { CourseCatalogDataTableCourseCardSlotProps } from './types';

const CourseCatalogDataTableCourseCardSlot = ({
  original: courseData, isLoading,
}: CourseCatalogDataTableCourseCardSlotProps) => {
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

export default CourseCatalogDataTableCourseCardSlot;
