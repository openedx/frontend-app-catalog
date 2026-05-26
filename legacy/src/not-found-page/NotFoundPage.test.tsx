import { render } from '../setupTest';
import NotFoundPage from './NotFoundPage';

import messages from './messages';

describe('<NotFoundPage />', () => {
  it('render component correctly', () => {
    const { getByText } = render(<NotFoundPage />);

    expect(getByText(messages.title.defaultMessage)).toBeInTheDocument();
  });
});
