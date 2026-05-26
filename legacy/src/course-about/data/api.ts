import { camelCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { getChangeEnrollmentUrl, getCourseAboutDataUrl } from './urls';

/**
 * Fetches course about data from the API.
 * @async
 */
export const fetchCourseAboutData = async (courseId: string) => {
  const { data } = await getAuthenticatedHttpClient().get(getCourseAboutDataUrl(courseId));
  return camelCaseObject(data);
};

/**
 * Changes the enrollment status for a course.
 * @async
 */
export const changeCourseEnrolment = async (courseId: string) => {
  const { data } = await getAuthenticatedHttpClient().post(
    getChangeEnrollmentUrl(),
    {
      course_id: courseId,
      enrollment_action: 'enroll',
    },
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
    },
  );
  return camelCaseObject(data);
};
