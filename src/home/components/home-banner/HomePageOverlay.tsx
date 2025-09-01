import { useIntl } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';

import messages from './messages';

const HomePageOverlay = () => {
  const intl = useIntl();
  const { SITE_NAME } = getConfig();

  return (
    <>
      <h1 className="display-1 text-white text-center">
        {intl.formatMessage(messages.title, { siteName: SITE_NAME })}
      </h1>
      <p className="lead text-white text-center mb-3">
        {intl.formatMessage(messages.subtitle)}
      </p>
    </>
  );
};

export default HomePageOverlay;
