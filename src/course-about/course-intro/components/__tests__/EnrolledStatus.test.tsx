import { render, screen } from '@testing-library/react';
import { IntlProvider } from '@openedx/frontend-base';

import messages from '../../messages';
import { STATUS_MESSAGE_VARIANTS } from '../../constants';
import { EnrolledStatus as ActualEnrolledStatus } from '../EnrolledStatus';

type Props = React.ComponentProps<typeof ActualEnrolledStatus>;

const EnrolledStatus = (props: Props) => (
  <IntlProvider locale="en"><ActualEnrolledStatus {...props} /></IntlProvider>
);

describe('EnrolledStatus', () => {
  const defaultProps: Props = {
    showCoursewareLink: false,
    courseId: 'test-course-123',
  };

  it('renders enrollment success status message', () => {
    render(<EnrolledStatus {...defaultProps} />);
    expect(screen.getByText(messages.statusMessageEnrolled.defaultMessage)).toBeInTheDocument();
  });

  it('does not render courseware link button when showCoursewareLink is false', () => {
    render(<EnrolledStatus {...defaultProps} />);
    expect(screen.queryByRole('link', {
      name: messages.viewCourseBtn.defaultMessage,
    })).not.toBeInTheDocument();
  });

  it('renders courseware link button when showCoursewareLink is true', () => {
    render(<EnrolledStatus {...defaultProps} showCoursewareLink />);

    const viewCourseBtnLink = screen.getByRole('link', {
      name: messages.viewCourseBtn.defaultMessage,
    });
    expect(viewCourseBtnLink).toHaveAttribute('href', expect.stringContaining(defaultProps.courseId));
  });

  it('renders status message with success variant', () => {
    render(<EnrolledStatus {...defaultProps} />);

    const statusMessage = screen.getByRole('status');
    expect(statusMessage).toHaveClass(`text-${STATUS_MESSAGE_VARIANTS.SUCCESS}-500`);
  });

  it('renders both status message and button when showCoursewareLink is true', () => {
    render(<EnrolledStatus {...defaultProps} showCoursewareLink />);

    expect(screen.getByText(messages.statusMessageEnrolled.defaultMessage)).toBeInTheDocument();

    const viewCourseBtnLink = screen.getByRole('link', {
      name: messages.viewCourseBtn.defaultMessage,
    });
    expect(viewCourseBtnLink).toHaveAttribute('href', expect.stringContaining(defaultProps.courseId));
  });
});
