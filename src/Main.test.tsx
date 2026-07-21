import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

import Main from './Main';

describe('Main', () => {
  it('renders a <main> that hosts the nested route Outlet', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<Main />}>
            <Route index element={<div data-testid="child">child content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );

    const mainEl = screen.getByRole('main');
    expect(mainEl).toHaveClass('d-flex', 'flex-column', 'flex-grow-1');
    expect(mainEl).toContainElement(screen.getByTestId('child'));
  });
});
