import { render } from '../../setupTest';

import { SubHeader } from '.';

describe('SubHeader', () => {
  it('renders without crashing', () => {
    const { getByRole } = render(<SubHeader title="Test Title" />);
    expect(getByRole('banner')).toBeInTheDocument();
  });

  it('displays the provided title', () => {
    const testTitle = 'My Test Title';
    const { getByRole } = render(<SubHeader title={testTitle} />);
    expect(getByRole('heading', { level: 1 })).toHaveTextContent(testTitle);
  });

  it('has correct CSS classes', () => {
    const { getByRole } = render(<SubHeader title="Test Title" />);
    const header = getByRole('banner');
    expect(header).toHaveClass('sub-header', 'd-flex', 'justify-content-between');
    expect(getByRole('heading', { level: 1 })).toHaveClass('mb-0');
  });
});
