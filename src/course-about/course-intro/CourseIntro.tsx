import { Card, Container } from '@openedx/paragon';
import { getAuthenticatedUser } from '@openedx/frontend-base';

import type { CourseAboutDataPartial } from '../types';
import { useEnrollmentActions, useEnrollmentStatus } from './hooks';

interface CourseIntroProps {
  courseAboutData: CourseAboutDataPartial;
  hideActions?: boolean;
}

export const CourseIntroActions = ({ courseAboutData }: { courseAboutData: CourseAboutDataPartial }) => {
  const authenticatedUser = getAuthenticatedUser();
  const { id: courseId, ecommerceCheckoutLink } = courseAboutData;

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
    <Card.Footer className="justify-content-start">
      {renderStatusContent()}
    </Card.Footer>
  );
};

export const CourseIntro = ({ courseAboutData, hideActions = false }: CourseIntroProps) => {
  const {
    displayOrgWithDefault: courseOrg,
    name: courseName,
    shortDescription,
  } = courseAboutData;

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
        {!hideActions && <CourseIntroActions courseAboutData={courseAboutData} />}
      </Card>
    </Container>
  );
};
