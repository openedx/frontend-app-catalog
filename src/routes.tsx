import { catalogRole, coursesRole, courseAboutRole } from './constants';

const routes = [
  {
    id: 'org.openedx.frontend.route.catalog.main',
    path: '/catalog',
    handle: {
      roles: [catalogRole],
    },
    async lazy() {
      const module = await import(/* webpackChunkName: "catalog-main" */ './Main');
      return { Component: module.default };
    },
    children: [
      {
        index: true,
        async lazy() {
          const module = await import(/* webpackChunkName: "catalog-home" */ './home/HomePage');
          return { Component: module.default };
        },
      },
      {
        path: 'courses',
        handle: {
          roles: [coursesRole],
        },
        async lazy() {
          const module = await import(/* webpackChunkName: "catalog-courses" */ './catalog/CatalogPage');
          return { Component: module.default };
        },
      },
      {
        path: 'courses/:courseId/about',
        handle: {
          roles: [courseAboutRole],
        },
        async lazy() {
          const module = await import(/* webpackChunkName: "catalog-course-about" */ './course-about/CourseAboutPage');
          return { Component: module.default };
        },
      },
    ],
  },
];

export default routes;
