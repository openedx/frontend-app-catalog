import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { PluginSlot } from '@openedx/frontend-plugin-framework';

import { CourseCard } from '../../generic';
import { CourseCardProps } from '../../generic/course-card/types';

const HomeCourseCardSlot = ({ course }: CourseCardProps) => (
  <PluginSlot
    id="catalog.home_page.home_course-card"
    idAliases={['home_course-card']}
    slotOptions={{
      mergeProps: true,
    }}
  >
    <CourseCard course={course} />
  </PluginSlot>
);

export default HomeCourseCardSlot;
