import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getConfig } from '@edx/frontend-platform';

import { fetchCourseAboutData, changeCourseEnrolment } from './api';
import type { EnrollmentFunctionTypes, UseEnrollmentParamsTypes, HttpError } from './types';

/**
 * A React Query hook that fetches course about data.
 */
export const useCourseAboutData = (courseId: string) => useQuery({
  queryKey: ['courseAboutData', courseId],
  queryFn: () => fetchCourseAboutData(courseId),
});

/**
 * Custom hook for handling course enrollment and redirection.
 */
export function useEnrollment({ onError, errorMessage }: UseEnrollmentParamsTypes): EnrollmentFunctionTypes {
  return useCallback(async (courseId, redirectUrl) => {
    try {
      await changeCourseEnrolment(courseId);
      window.location.href = redirectUrl;
    } catch (error) {
      if ((error as HttpError)?.customAttributes?.httpErrorStatus === 403) {
        const nextPath = `/courses/${courseId}/about`;
        window.location.href = `${getConfig().LOGIN_URL}?next=${encodeURIComponent(nextPath)}`;
        return;
      }
      onError(errorMessage);
    }
  }, [onError, errorMessage]);
}
