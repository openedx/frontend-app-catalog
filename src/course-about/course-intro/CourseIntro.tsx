import { Card } from '@openedx/paragon';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import { CourseIntroTypes } from './types';

import { useEnrollmentActions, useEnrollmentStatus } from './hooks';

export const CourseIntro = ({ courseAboutData }: CourseIntroTypes) => {
  const authenticatedUser = getAuthenticatedUser();

  const {
    id: courseId,
    org: courseOrg,
    name: courseName,
    shortDescription,
    ecommerceCheckoutLink,
  } = courseAboutData;

  const {
    enrollmentError,
    isEnrollmentPending,
    handleChangeEnrollment,
    handleEcommerceCheckout,
  } = useEnrollmentActions({ courseId, ecommerceCheckoutLink });

  const { renderStatusContent } = useEnrollmentStatus({
    courseAboutData,
    enrollmentError,
    authenticatedUser,
    isEnrollmentPending,
    handleChangeEnrollment,
    handleEcommerceCheckout,
  });

  return (
    <section className="course-about-intro">
      <Card>
        <Card.Header
          title={<h1 className="course-about-intro-heading m-0">{courseName}</h1>}
          subtitle={courseOrg}
        />
        <Card.Section>
          {shortDescription}
        </Card.Section>
        <Card.Footer className="justify-content-start">
          {renderStatusContent()}
        </Card.Footer>
      </Card>
    </section>
  );
};
