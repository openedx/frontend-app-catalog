import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppProvider } from '@edx/frontend-platform/react';

import HomePage from './home/HomePage';
import CatalogPage from './сatalog/CatalogPage';
import CourseAboutPage from './course-about/CourseAboutPage';
import { render } from './setupTest';

jest.mock('@edx/frontend-platform', () => ({
  ...jest.requireActual('@edx/frontend-platform'),
  getAuthenticatedUser: () => ({ username: 'test_user', roles: [] }),
}));

jest.mock('@edx/frontend-platform/react', () => {
  const original = jest.requireActual('@edx/frontend-platform/react');
  return {
    ...original,
    useAuthenticatedUser: () => ({ username: 'test_user', roles: [] }),
    // eslint-disable-next-line react/prop-types
    AppProvider: ({ children }) => <div>{children}</div>,
  };
});

jest.mock('@edx/frontend-component-header', () => (
  <header>Header</header>
));

jest.mock('@edx/frontend-component-footer', () => ({
  FooterSlot: () => <footer>Footer</footer>,
}));

const renderWithProviders = (path = '/') => {
  // eslint-disable-next-line no-underscore-dangle
  window._testHistory = [path];

  return render(
    <AppProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<CatalogPage />} />
        <Route path="/courses/:courseId/about" element={<CourseAboutPage />} />
      </Routes>
    </AppProvider>,
  );
};

describe('App routing', () => {
  it('renders HomePage at route /', () => {
    const { getByTestId } = renderWithProviders('/');

    expect(getByTestId('home-page')).toBeInTheDocument();
  });

  it('renders CatalogPage at route /courses', () => {
    const { getByTestId } = renderWithProviders('/courses');

    expect(getByTestId('catalog-page')).toBeInTheDocument();
  });

  it('renders CourseAboutPage at route /courses/123/about', () => {
    const { getByTestId } = renderWithProviders('/courses/123/about');

    expect(getByTestId('course-about-page')).toBeInTheDocument();
  });
});
