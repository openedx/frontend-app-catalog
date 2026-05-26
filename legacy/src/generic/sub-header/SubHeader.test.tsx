import { render, screen } from '../../setupTest';

import { SubHeader } from '.';

describe('SubHeader', () => {
  it('renders without crashing', () => {
    render(<SubHeader title="Test Title" />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('displays the provided title', () => {
    const testTitle = 'My Test Title';
    render(<SubHeader title={testTitle} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(testTitle);
  });

  it('has correct CSS classes', () => {
    render(<SubHeader title="Test Title" />);
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('mb-5', 'd-flex', 'justify-content-between');
    expect(screen.getByRole('heading', { level: 1 })).toHaveClass('mb-0');
  });

  it('applies custom className when provided', () => {
    const customClass = 'custom-header-class';
    render(<SubHeader title="Test Title" className={customClass} />);
    const header = screen.getByRole('banner');
    expect(header).toHaveClass(customClass);
  });

  it('merges custom className with default classes', () => {
    const customClass = 'my-custom-class';
    render(<SubHeader title="Test Title" className={customClass} />);
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('mb-5', 'd-flex', 'justify-content-between', customClass);
  });
});
