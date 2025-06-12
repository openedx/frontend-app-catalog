import { AppProvider } from '@edx/frontend-platform/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Routes } from 'react-router-dom';
import { Container } from '@openedx/paragon';
import { FooterSlot } from '@edx/frontend-component-footer';
import Header from '@edx/frontend-component-header';

import HomePage from './home/HomePage';
import CatalogPage from './сatalog/CatalogPage';
import CourseAboutPage from './course-about/CourseAboutPage';
import NotFoundPage from './not-found-page/NotFoundPage';
import { ROUTES } from './routes';

const queryClient = new QueryClient();

const App = () => (
  <AppProvider>
    <QueryClientProvider client={queryClient}>
      <Header />
      <main className="d-flex flex-column flex-grow-1">
        <Container className="container-xl">
          <Routes>
            <Route path={ROUTES.HOME} element={<HomePage />} />
            <Route path={ROUTES.COURSES} element={<CatalogPage />} />
            <Route path={ROUTES.COURSE_ABOUT} element={<CourseAboutPage />} />
            <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
          </Routes>
        </Container>
      </main>
      <FooterSlot />
    </QueryClientProvider>
  </AppProvider>
);

export default App;
