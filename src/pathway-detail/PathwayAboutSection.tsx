import { useState } from 'react';
import {
  Button, Collapsible, Icon, Stack,
} from '@openedx/paragon';
import {
  AccessTimeFilled as AccessTimeFilledIcon,
  Add as AddIcon,
  CardMembership as CardMembershipIcon,
  Remove as RemoveIcon,
  Shuffle,
  WorkspacePremium,
} from '@openedx/paragon/icons';
import { useIntl } from '@openedx/frontend-base';

import type { IntlShape } from '@src/utils';

import { PathwayCourseModal } from './PathwayCourseModal';
import { INITIAL_VISIBLE_COUNT } from './sections';
import messages from './messages';
import type { PathwayCourse, PathwayDetailData } from './types';

const renderCourseTitle = (course: PathwayCourse, intl: IntlShape) => {
  const { kind, count } = course.credential;
  const isBadge = kind === 'badge';

  return (
    <span className="pathway-detail-course-title d-flex flex-column">
      <strong>{course.title}</strong>
      <span className="pathway-detail-course-meta d-flex align-items-center flex-wrap text-muted small">
        <span className="d-inline-flex align-items-center">
          <Icon src={AccessTimeFilledIcon} size="sm" className="text-info-800" />
          {course.duration}
        </span>
        <span className="d-inline-flex align-items-center">{course.pace}</span>
        <span className="d-inline-flex align-items-center">
          <Icon src={isBadge ? WorkspacePremium : CardMembershipIcon} size="sm" className="text-info-800" />
          {intl.formatMessage(isBadge ? messages.badgeCount : messages.certificateCount, { count })}
        </span>
      </span>
    </span>
  );
};

interface PathwayAboutSectionProps {
  pathway: PathwayDetailData;
}

export const PathwayAboutSection = ({ pathway }: PathwayAboutSectionProps) => {
  const intl = useIntl();
  const [showAllCourses, setShowAllCourses] = useState(false);
  // The course whose Learn-more modal is open; null keeps the dialog closed.
  // Deliberately section-local state: the modal never touches the URL or history.
  const [selectedCourse, setSelectedCourse] = useState<PathwayCourse | null>(null);

  const visibleCourses = pathway.courses.slice(0, showAllCourses ? undefined : INITIAL_VISIBLE_COUNT);

  return (
    <>
      <section id="about" className="pathway-detail-section d-flex flex-column gap-3">
        <h2 className="h3 mb-2">{intl.formatMessage(messages.aboutHeading)}</h2>
        {pathway.about.map(paragraph => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        <Stack direction="horizontal" gap={2}>
          <Icon className="bg-info-200 text-info-800" src={Shuffle} size="sm" />
          {intl.formatMessage(messages.completeCoursesNote, { count: pathway.courses.length })}
        </Stack>
        <Stack id="pathway-courses-list" direction="vertical" gap={2}>
          {visibleCourses.map((course) => (
            <Collapsible
              className="py-2 px-3"
              key={course.id}
              styling="card"
              iconWhenClosed={<Icon src={AddIcon} />}
              iconWhenOpen={<Icon src={RemoveIcon} />}
              title={renderCourseTitle(course, intl)}
            >
              <p className="mb-2">{course.courseAboutData.shortDescription}</p>
              <Button variant="primary" size="sm" onClick={() => setSelectedCourse(course)}>
                {intl.formatMessage(messages.learnMoreBtn)}
              </Button>
            </Collapsible>
          ))}
        </Stack>
        {pathway.courses.length > INITIAL_VISIBLE_COUNT && (
          <div>
            <Button
              variant="link"
              aria-expanded={showAllCourses}
              aria-controls="pathway-courses-list"
              onClick={() => setShowAllCourses((current) => !current)}
            >
              {intl.formatMessage(showAllCourses ? messages.seeLessBtn : messages.seeMoreBtn)}
            </Button>
          </div>
        )}
      </section>
      <PathwayCourseModal
        pathwayName={pathway.name}
        course={selectedCourse}
        onClose={() => setSelectedCourse(null)}
      />
    </>
  );
};
