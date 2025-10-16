import { Info as InfoIcon } from '@openedx/paragon/icons';

import { render, screen } from '@src/setupTest';
import SidebarDetailsItem from '../SidebarDetailsItem';

describe('SidebarDetailsItem', () => {
  const defaultProps = {
    icon: InfoIcon,
    label: 'Test Label',
    value: 'Test Value',
  };

  it('renders icon, label and value', () => {
    render(<SidebarDetailsItem {...defaultProps} />);

    expect(screen.getByText(defaultProps.label)).toBeInTheDocument();
    expect(screen.getByText(defaultProps.value)).toBeInTheDocument();
    // Icon is rendered as SVG with aria-hidden="true", so we check for the icon container
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  it('renders with different label', () => {
    render(<SidebarDetailsItem {...defaultProps} label="Custom Label" />);

    expect(screen.getByText('Custom Label')).toBeInTheDocument();
    expect(screen.queryByText(defaultProps.label)).not.toBeInTheDocument();
  });

  it('renders with different value', () => {
    render(<SidebarDetailsItem {...defaultProps} value="Custom Value" />);

    expect(screen.getByText('Custom Value')).toBeInTheDocument();
    expect(screen.queryByText(defaultProps.value)).not.toBeInTheDocument();
  });

  it('renders with React node as value', () => {
    const ReactNodeValue = <span data-testid="custom-value">React Node</span>;
    render(<SidebarDetailsItem {...defaultProps} value={ReactNodeValue} />);

    expect(screen.getByTestId('custom-value')).toBeInTheDocument();
    expect(screen.getByText('React Node')).toBeInTheDocument();
  });

  it('renders with link as value', () => {
    const LinkValue = <a href="/test-link">Link Text</a>;
    render(<SidebarDetailsItem {...defaultProps} value={LinkValue} />);

    const link = screen.getByRole('link', { name: 'Link Text' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/test-link');
  });

  it('renders value with correct font weight', () => {
    const { container } = render(<SidebarDetailsItem {...defaultProps} />);

    const valueElement = container.querySelector('.font-weight-bolder');
    expect(valueElement).toBeInTheDocument();
    expect(valueElement).toHaveTextContent(defaultProps.value);
  });

  it('renders Card.Divider after content', () => {
    const { container } = render(<SidebarDetailsItem {...defaultProps} />);

    const divider = container.querySelector('.pgn__card-divider');
    expect(divider).toBeInTheDocument();
  });

  it('handles empty string value', () => {
    render(<SidebarDetailsItem {...defaultProps} value="" />);

    expect(screen.getByText(defaultProps.label)).toBeInTheDocument();
    const valueSpan = screen.getByTestId('sidebar-details-item-value');
    expect(valueSpan).toBeInTheDocument();
    expect(valueSpan).toHaveTextContent(''); // empty string should render empty span
  });

  it('handles null value', () => {
    render(<SidebarDetailsItem {...defaultProps} value={null} />);

    expect(screen.getByText(defaultProps.label)).toBeInTheDocument();
    const valueSpan = screen.getByTestId('sidebar-details-item-value');
    expect(valueSpan).toBeInTheDocument();
    expect(valueSpan).toHaveTextContent(''); // null value should render empty span
  });

  it('renders with number value', () => {
    render(<SidebarDetailsItem {...defaultProps} value={42} />);

    expect(screen.getByText('42')).toBeInTheDocument();
  });
});
