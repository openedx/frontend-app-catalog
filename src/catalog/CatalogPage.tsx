import { Helmet } from 'react-helmet';
import { getSiteConfig, useIntl } from '@openedx/frontend-base';

import messages from './messages';

const CatalogPage = () => {
  const { formatMessage } = useIntl();

  return (
    <>
      <Helmet>
        <title>
          {formatMessage(messages.pageTitle, {
            siteName: getSiteConfig().siteName,
          })}
        </title>
      </Helmet>
      <div data-testid="catalog-page-placeholder">
        Catalog (placeholder)
      </div>
    </>
  );
};

export default CatalogPage;
