import { catalogRole } from './constants';

const routes = [
  {
    id: 'org.openedx.frontend.route.catalog.main',
    path: 'catalog',
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
    ],
  },
];

export default routes;
