import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSiteConfig } from '@openedx/frontend-base';

import { fetchCourseAboutData, changeCourseEnrolment } from './api';
import type { EnrollmentFunctionTypes, UseEnrollmentParamsTypes, HttpError } from './types';

export const useCourseAboutData = (courseId: string) => useQuery({
  queryKey: ['courseAboutData', courseId],
  queryFn: () => fetchCourseAboutData(courseId),
});

export function useEnrollment({ onError, errorMessage }: UseEnrollmentParamsTypes): EnrollmentFunctionTypes {
  return useCallback(async (courseId, redirectUrl) => {
    try {
      await changeCourseEnrolment(courseId);
      window.location.href = redirectUrl;
    } catch (error) {
      if ((error as HttpError)?.customAttributes?.httpErrorStatus === 403) {
        const nextPath = `/courses/${courseId}/about`;
        window.location.href = `${getSiteConfig().loginUrl}?next=${encodeURIComponent(nextPath)}`;
        return;
      }
      onError(errorMessage);
    }
  }, [onError, errorMessage]);
}
