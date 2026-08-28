import app from './app';
import slots from './slots';
import routes from './routes';
import { appId } from './constants';
import { catalogHeaderApp } from './widgets/CatalogHeader';

describe('catalogApp', () => {
  it('declares the catalog appId, routes, and slots', () => {
    expect(app.appId).toBe(appId);
    expect(app.routes).toBe(routes);
    expect(app.slots).toBe(slots);
  });

  it('bundles the homepage course maximum as its only default', () => {
    expect(app.defaultConfig).toEqual({ HOMEPAGE_COURSE_MAX: 9 });
  });

  it('leaves config to the operator', () => {
    expect(app.config).toBeUndefined();
  });
});

describe('slots', () => {
  it('re-exports the catalog header widget slot operations', () => {
    expect(slots).toEqual(catalogHeaderApp.slots ?? []);
  });
});
