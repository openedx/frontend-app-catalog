import 'core-js/stable';
import 'regenerator-runtime/runtime';

import {
  APP_INIT_ERROR, APP_READY, subscribe, initialize,
} from '@edx/frontend-platform';
import { AppProvider, ErrorPage } from '@edx/frontend-platform/react';
import { createRoot } from 'react-dom/client';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { FooterSlot } from '@edx/frontend-component-footer';
import { Routes, Route } from 'react-router-dom';

import HomePage from './home/HomePage';
import CatalogPage from './сatalog/CatalogPage';
import CourseAboutPage from './course-about/CourseAboutPage';
import NotFoundPage from './not-found-page/NotFoundPage';
import CatalogHeader from './header/CatalogHeader';
import { ROUTES } from './routes';

import messages from './i18n';

import './index.scss';

const queryClient = new QueryClient();
const container = document.getElementById('root');
const root = createRoot(container!);

subscribe(APP_READY, () => {
  root.render(
    <AppProvider>
      <QueryClientProvider client={queryClient}>
        <CatalogHeader />
        <main className="d-flex flex-column flex-grow-1">
          <Routes>
            <Route path={ROUTES.HOME} element={<HomePage />} />
            <Route path={ROUTES.COURSES} element={<CatalogPage />} />
            <Route path={ROUTES.COURSE_ABOUT} element={<CourseAboutPage />} />
            <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
          </Routes>
        </main>
        <FooterSlot />
      </QueryClientProvider>
    </AppProvider>,
  );
});

subscribe(APP_INIT_ERROR, (error: { message: any; }) => {
  root.render(<ErrorPage message={error.message} />);
});

initialize({
  messages,
});
