import { Helmet } from 'react-helmet';
import { getConfig } from '@edx/frontend-platform';

import type { HeadProps } from './types';

export const Head = ({ title = '' }: HeadProps) => {
  const siteName = String(getConfig().SITE_NAME || '');
  const fullTitle = title ? `${title} | ${siteName}` : siteName;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <link rel="shortcut icon" href={getConfig().FAVICON_URL} type="image/x-icon" />
    </Helmet>
  );
};
