import { Container } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from './messages';

const NotFoundPage = () => {
  const intl = useIntl();

  return (
    <Container size="sm">
      <p className="my-0 py-5 text-muted text-center mx-auto" data-testid="not-found-page">
        {intl.formatMessage(messages.title)}
      </p>
    </Container>
  );
};

export default NotFoundPage;
