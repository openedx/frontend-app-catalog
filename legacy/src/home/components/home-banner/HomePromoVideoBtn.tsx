import { Button } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import type { HomePromoVideoBtnProps } from './types';
import messages from './messages';

const HomePromoVideoBtn = ({ onClick }: HomePromoVideoBtnProps) => {
  const intl = useIntl();

  return (
    <Button variant="brand" className="mb-3" onClick={onClick}>
      {intl.formatMessage(messages.videoButton)}
    </Button>
  );
};

export default HomePromoVideoBtn;
