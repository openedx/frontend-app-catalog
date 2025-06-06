import { Spinner } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';

import messages from './messages';
import { LoadingSpinnerProps } from './types';

export const LoadingSpinner = ({ size = 'lg' }: LoadingSpinnerProps) => {
  const intl = useIntl();

  return (
    <Spinner
      animation="border"
      role="status"
      size={size}
      screenReaderText={intl.formatMessage(messages.screenReaderText)}
    />
  );
};

export const Loading = () => (
  <div className="d-flex justify-content-center align-items-center flex-column vh-100">
    <LoadingSpinner />
  </div>
);
