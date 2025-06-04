import NotFoundPage from './NotFoundPage';
import messages from './messages';
import { render } from '../setupTest';

const renderComponent = () => render(
  <NotFoundPage />,
);

describe('<NotFoundPage />', () => {
  it('render component correctly', () => {
    const { getByText } = renderComponent();

    expect(getByText(messages.title.defaultMessage)).toBeInTheDocument();
  });
});
