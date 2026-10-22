import { useState } from 'react';
import {
  Button, Collapsible, Icon, Stack,
} from '@openedx/paragon';
import {
  AccessTimeFilled as AccessTimeFilledIcon,
  Add as AddIcon,
  CardMembership as CardMembershipIcon,
  ExpandLess,
  ExpandMore,
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
    <span className="pathway-detail-course-title d-flex flex-column mx-3">
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
          {/* One flex item: the rich-text result is an array of pieces, and a bare
              array would let the Stack gap space out the sentence itself. */}
          <span>
            {intl.formatMessage(messages.completeCoursesNote, {
              count: pathway.courses.length,
              b: (chunks) => <strong>{chunks}</strong>,
            })}
          </span>
        </Stack>
        <Stack id="pathway-courses-list" direction="vertical" gap={2}>
          {visibleCourses.map((course) => (
            <Collapsible
              // No side padding here: the trigger's expanded border-bottom is the
              // card-wide divider, so it must reach both edges of the card.
              className="py-2"
              key={course.id}
              styling="card"
              iconWhenClosed={<Icon src={AddIcon} />}
              iconWhenOpen={<Icon src={RemoveIcon} />}
              title={renderCourseTitle(course, intl)}
            >
              <p className="m-3">{course.shortDescription}</p>
              <Button className="m-3" variant="primary" size="sm" onClick={() => setSelectedCourse(course)}>
                {intl.formatMessage(messages.learnMoreBtn)}
              </Button>
            </Collapsible>
          ))}
        </Stack>
        {pathway.courses.length > INITIAL_VISIBLE_COUNT && (
          <div className="d-flex justify-content-center">
            <Button
              variant="link"
              className="text-body"
              aria-expanded={showAllCourses}
              aria-controls="pathway-courses-list"
              iconAfter={showAllCourses ? ExpandLess : ExpandMore}
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
