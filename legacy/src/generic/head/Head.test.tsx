import { getConfig } from '@edx/frontend-platform';

import { render, cleanup, waitFor } from '@src/setupTest';
import { Head } from '..';

jest.mock('@edx/frontend-platform', () => ({
  getConfig: jest.fn(),
}));

describe('Head component', () => {
  const originalTitle = document.title;
  const mockSiteName = process.env.SITE_NAME;

  beforeEach(() => {
    (getConfig as jest.Mock).mockReturnValue({
      SITE_NAME: mockSiteName,
    });
    document.title = '';
  });

  afterEach(() => {
    cleanup();
    (getConfig as jest.Mock).mockClear();
    document.title = originalTitle;
  });

  it('sets full title when title prop is provided', async () => {
    render(<Head title="TEST" />);

    await waitFor(() => {
      expect(document.title).toBe(`TEST | ${getConfig().SITE_NAME}`);
    });
  });

  it('sets site name when title prop is empty', async () => {
    render(<Head />);

    await waitFor(() => {
      expect(document.title).toBe(getConfig().SITE_NAME);
    });
  });
});
