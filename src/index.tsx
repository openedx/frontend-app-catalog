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
import Header from '@edx/frontend-component-header';
import { FooterSlot } from '@edx/frontend-component-footer';
import { Routes, Route } from 'react-router-dom';
import { Container } from '@openedx/paragon';

import HomePage from './home/HomePage';
import CatalogPage from './сatalog/CatalogPage';
import CourseAboutPage from './course-about/CourseAboutPage';

import messages from './i18n';
import './index.scss';

const queryClient = new QueryClient();
const container = document.getElementById('root');
const root = createRoot(container!);

subscribe(APP_READY, () => {
  root.render(
    <AppProvider>
      <QueryClientProvider client={queryClient}>
        <Header />
        <main className="d-flex flex-column flex-grow-1">
          <Container className="container-xl">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/courses" element={<CatalogPage />} />
              <Route path="/courses/:courseId/about" element={<CourseAboutPage />} />
            </Routes>
          </Container>
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
