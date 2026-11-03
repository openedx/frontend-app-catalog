import { getSiteConfig } from '@openedx/frontend-base';

import noCourseImg from '@src/assets/images/no-course-image.svg';

import { processOverviewContent } from '../utils';

describe('processOverviewContent', () => {
  it('rewrites the LMS image paths course authors use', () => {
    expect(processOverviewContent('<img src="/static/images/course.png">')).toBe(
      `<img src="${getSiteConfig().lmsBaseUrl}/static/images/course.png">`,
    );
    expect(processOverviewContent('<img src="/asset-v1:edX+Demo+2024+type@asset+block/course.png">')).toBe(
      `<img src="${getSiteConfig().lmsBaseUrl}/asset-v1:edX+Demo+2024+type@asset+block/course.png">`,
    );
  });

  it('leaves sources it cannot resolve untouched', () => {
    const html = [
      '<img src="data:image/png;base64,AAAA">',
      '<img src="blob:https://example.com/0c1f">',
      '<img src="//cdn.example.com/course.png">',
      '<img src="images/relative.png">',
    ].join('');

    expect(processOverviewContent(html)).toBe(html);
  });

  it('keeps absolute http(s) sources', () => {
    const html = '<img src="https://cdn.example.com/course.png">';

    expect(processOverviewContent(html)).toBe(html);
  });

  it('falls back to the placeholder for an empty source', () => {
    expect(processOverviewContent('<img src="" alt="Empty">')).toBe(
      `<img src="${noCourseImg}" alt="Empty">`,
    );
  });

  it('returns empty content unchanged', () => {
    expect(processOverviewContent('')).toBe('');
  });
});
