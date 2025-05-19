import { render } from '../../../../setupTest';
import messages from '../../messages';
import { ALERT_VARIANTS } from '../../constants';
import { EnrolledStatus } from '../EnrolledStatus';

describe('EnrolledStatus', () => {
  const defaultProps = {
    showCoursewareLink: false,
    courseId: 'test-course-123',
  };

  it('renders enrollment success alert', () => {
    const { getByText } = render(<EnrolledStatus {...defaultProps} />);
    expect(getByText(messages.statusAlertEnrolled.defaultMessage)).toBeInTheDocument();
  });

  it('does not render courseware link button when showCoursewareLink is false', () => {
    const { queryByText } = render(<EnrolledStatus {...defaultProps} />);
    expect(queryByText(messages.viewCourseBtn.defaultMessage)).not.toBeInTheDocument();
  });

  it('renders courseware link button when showCoursewareLink is true', () => {
    const { getByRole } = render(<EnrolledStatus {...defaultProps} showCoursewareLink />);

    const button = getByRole('link', { name: messages.viewCourseBtn.defaultMessage });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('href', expect.stringContaining(defaultProps.courseId));
  });

  it('renders alert with success variant', () => {
    const { getByRole } = render(<EnrolledStatus {...defaultProps} />);

    const alert = getByRole('alert');
    expect(alert.closest('div')).toHaveClass(`alert-${ALERT_VARIANTS.SUCCESS}`);
  });

  it('renders both alert and button when showCoursewareLink is true', () => {
    const { getByText, getByRole } = render(<EnrolledStatus {...defaultProps} showCoursewareLink />);

    expect(getByText(messages.statusAlertEnrolled.defaultMessage)).toBeInTheDocument();

    const button = getByRole('link', { name: messages.viewCourseBtn.defaultMessage });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('href', expect.stringContaining(defaultProps.courseId));
  });
});
