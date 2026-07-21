import routes from './routes';
import { catalogRole, coursesRole, courseAboutRole } from './constants';

describe('routes', () => {
  it('exports one top-level catalog route', () => {
    expect(routes).toHaveLength(1);
    expect(routes[0].id).toBe('org.openedx.frontend.route.catalog.main');
    expect(routes[0].path).toBe('/catalog');
    expect(routes[0].handle.roles).toEqual([catalogRole]);
  });

  it('lazy-loads the Main component for the top-level catalog route', async () => {
    const { Component } = await routes[0].lazy();
    expect(Component).toBeDefined();
  });

  it('declares the three child routes with the expected paths and roles', () => {
    const children = routes[0].children;
    expect(children).toHaveLength(3);

    const [indexRoute, coursesRoute, courseAboutRoute] = children;

    expect(indexRoute.index).toBe(true);

    expect(coursesRoute.path).toBe('courses');
    expect(coursesRoute.handle?.roles).toEqual([coursesRole]);

    expect(courseAboutRoute.path).toBe('courses/:courseId/about');
    expect(courseAboutRoute.handle?.roles).toEqual([courseAboutRole]);
  });

  it('lazy-loads each child route to a Component', async () => {
    const children = routes[0].children;
    const loaded = await Promise.all(children.map(child => child.lazy()));
    loaded.forEach(({ Component }) => {
      expect(Component).toBeDefined();
    });
  });
});
