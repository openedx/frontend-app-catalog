import { Alert, ModalDialog } from '@openedx/paragon';
import { getSiteConfig, resolveRouteByRole, useIntl } from '@openedx/frontend-base';

import CourseAboutBody from '@src/course-about/CourseAboutBody';
import { useCourseAboutData } from '@src/course-about/data/hooks';
import courseAboutMessages from '@src/course-about/messages';
import { getStringConfig } from '@src/config';
import { courseAboutRole } from '@src/constants';
import { LoadingSpinner } from '@src/generic';

import messages from './messages';
import type { PathwayCourse } from './types';

/**
 * Absolute URL of a course's About page, or null when the site does not
 * register the route. The course modal uses it as the share target; a missing
 * route hides the modal's share controls instead of sharing the pathway URL.
 */
const getCourseAboutUrl = (course: PathwayCourse): string | null => {
  const resolved = resolveRouteByRole(courseAboutRole, { courseId: course.id });
  if (!resolved) {
    return null;
  }
  return resolved.isInternal ? new URL(resolved.url, getSiteConfig().baseUrl).href : resolved.url;
};

interface PathwayCourseModalContentProps {
  course: PathwayCourse;
  shareUrl: string | null;
}

/**
 * Course About content for the selected course. Mounted only while the dialog
 * is open, so a closed dialog issues no request and the fetch never sees an
 * empty course ID.
 */
const PathwayCourseModalContent = ({ course, shareUrl }: PathwayCourseModalContentProps) => {
  const intl = useIntl();
  const { data: courseAboutData, isPending, isError } = useCourseAboutData(course.id);

  // Pending, not isLoading: a query that cannot start yet (e.g. offline) has no
  // data and no error, and must not render an empty dialog body.
  if (isPending) {
    return <LoadingSpinner />;
  }

  // A failed background refetch keeps the cached record; only a failure with
  // nothing to show replaces the body with the error.
  if (isError && !courseAboutData) {
    return (
      <Alert variant="danger">
        {intl.formatMessage(courseAboutMessages.errorMessage, {
          supportEmail: getStringConfig('INFO_EMAIL'),
        })}
      </Alert>
    );
  }

  if (!courseAboutData) {
    return null;
  }

  return <CourseAboutBody courseAboutData={courseAboutData} hideActions shareUrl={shareUrl} />;
};

interface PathwayCourseModalProps {
  pathwayName: string;
  /** The course shown in the dialog; null keeps it closed. */
  course: PathwayCourse | null;
  onClose: () => void;
}

export const PathwayCourseModal = ({ pathwayName, course, onClose }: PathwayCourseModalProps) => {
  const intl = useIntl();
  const courseShareUrl = course ? getCourseAboutUrl(course) : null;

  return (
    <ModalDialog
      title={course
        ? intl.formatMessage(messages.courseModalTitle, { courseTitle: course.title })
        : ''}
      isOpen={course !== null}
      onClose={onClose}
      size="xl"
      // Dark variant styles the header with white text and inverts the
      // close button to white; only the header tint is overridden in
      // PathwayDetailPage.scss, the dialog body stays white.
      variant="dark"
      isOverflowVisible={false}
      // Near-full-screen below the md breakpoint while keeping the close
      // control; the default 80vh cap plus the internally scrollable
      // ModalDialog.Body bounds the dialog on larger screens.
      isFullscreenOnMobile
      className="pathway-detail-course-modal"
    >
      {course && (
        <>
          <ModalDialog.Header>
            {/* Non-heading element: the banner is a compact bar, not a page heading. */}
            <ModalDialog.Title as="p">
              {intl.formatMessage(messages.courseModalContextBanner, {
                pathwayName: <strong>{pathwayName}</strong>,
              })}
            </ModalDialog.Title>
          </ModalDialog.Header>
          <ModalDialog.Body>
            <PathwayCourseModalContent course={course} shareUrl={courseShareUrl} />
          </ModalDialog.Body>
        </>
      )}
    </ModalDialog>
  );
};
