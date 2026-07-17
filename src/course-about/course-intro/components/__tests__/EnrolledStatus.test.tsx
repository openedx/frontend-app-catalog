import { render, screen } from '@testing-library/react';
import { IntlProvider } from '@openedx/frontend-base';

import messages from '../../messages';
import { STATUS_MESSAGE_VARIANTS } from '../../constants';
import { EnrolledStatus } from '../EnrolledStatus';

type Props = React.ComponentProps<typeof EnrolledStatus>;

const renderEnrolledStatus = (props: Props) => render(
  <IntlProvider locale="en">
    <EnrolledStatus {...props} />
  </IntlProvider>,
);

describe('EnrolledStatus', () => {
  const defaultProps: Props = {
    showCoursewareLink: false,
    courseId: 'test-course-123',
  };

  it('renders enrollment success status message', () => {
    renderEnrolledStatus(defaultProps);
    expect(screen.getByText(messages.statusMessageEnrolled.defaultMessage)).toBeInTheDocument();
  });

  it('does not render courseware link button when showCoursewareLink is false', () => {
    renderEnrolledStatus(defaultProps);
    expect(screen.queryByRole('link', {
      name: messages.viewCourseBtn.defaultMessage,
    })).not.toBeInTheDocument();
  });

  it('renders courseware link button when showCoursewareLink is true', () => {
    renderEnrolledStatus({ ...defaultProps, showCoursewareLink: true });

    const viewCourseBtnLink = screen.getByRole('link', {
      name: messages.viewCourseBtn.defaultMessage,
    });
    expect(viewCourseBtnLink).toHaveAttribute('href', expect.stringContaining(defaultProps.courseId));
  });

  it('renders status message with success variant', () => {
    renderEnrolledStatus(defaultProps);

    const statusMessage = screen.getByRole('status');
    expect(statusMessage).toHaveClass(`text-${STATUS_MESSAGE_VARIANTS.SUCCESS}-500`);
  });

  it('renders both status message and button when showCoursewareLink is true', () => {
    renderEnrolledStatus({ ...defaultProps, showCoursewareLink: true });

    expect(screen.getByText(messages.statusMessageEnrolled.defaultMessage)).toBeInTheDocument();

    const viewCourseBtnLink = screen.getByRole('link', {
      name: messages.viewCourseBtn.defaultMessage,
    });
    expect(viewCourseBtnLink).toHaveAttribute('href', expect.stringContaining(defaultProps.courseId));
  });
});
