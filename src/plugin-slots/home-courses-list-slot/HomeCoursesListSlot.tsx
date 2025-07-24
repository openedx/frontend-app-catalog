import React from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { PluginSlot } from '@openedx/frontend-plugin-framework';

import CoursesList from '../../home/components/courses-list/CoursesList';

const HomeCoursesListSlot = () => (
  <PluginSlot
    id="catalog.home_page.home_courses-list"
    idAliases={['home_courses-list']}
    slotOptions={{
      mergeProps: true,
    }}
  >
    <CoursesList />
  </PluginSlot>
);

export default HomeCoursesListSlot;
