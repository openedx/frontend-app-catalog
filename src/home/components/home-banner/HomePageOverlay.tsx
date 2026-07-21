import { getSiteConfig, useIntl } from '@openedx/frontend-base';

import messages from './messages';

const HomePageOverlay = () => {
  const intl = useIntl();
  const { siteName } = getSiteConfig();

  return (
    <>
      <h1 className="display-1 text-white text-center">
        {intl.formatMessage(messages.title, { siteName })}
      </h1>
      <p className="lead text-white text-center mb-3">
        {intl.formatMessage(messages.subtitle)}
      </p>
    </>
  );
};

export default HomePageOverlay;
