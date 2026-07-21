import app from './app';
import slots from './slots';
import routes from './routes';
import { appId } from './constants';
import { catalogHeaderApp } from './widgets/CatalogHeader';

describe('catalogApp', () => {
  it('declares the catalog appId, routes, slots, and config', () => {
    expect(app.appId).toBe(appId);
    expect(app.routes).toBe(routes);
    expect(app.slots).toBe(slots);
    expect(app.config).toBeDefined();
  });
});

describe('slots', () => {
  it('re-exports the catalog header widget slot operations', () => {
    expect(slots).toEqual(catalogHeaderApp.slots ?? []);
  });
});
