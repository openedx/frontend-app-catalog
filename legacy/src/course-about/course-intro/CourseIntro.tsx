import { Card, Container } from '@openedx/paragon';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import type { CourseAboutDataPartial } from '../types';
import { useEnrollmentActions, useEnrollmentStatus } from './hooks';

export const CourseIntro = ({ courseAboutData }: { courseAboutData: CourseAboutDataPartial }) => {
  const authenticatedUser = getAuthenticatedUser();

  const {
    id: courseId,
    displayOrgWithDefault: courseOrg,
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
    <Container className="course-about-intro px-0">
      <Card>
        <Card.Header
          title={<h1 className="my-0">{courseName}</h1>}
          subtitle={courseOrg}
        />
        <Card.Section>
          {shortDescription}
        </Card.Section>
        <Card.Footer className="justify-content-start">
          {renderStatusContent()}
        </Card.Footer>
      </Card>
    </Container>
  );
};
