import { useState } from 'react';
import { useNavigate } from 'react-router';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import {
  Form, useToggle, SearchField, Container,
} from '@openedx/paragon';

import { ROUTES } from '@src/routes';
import HomeOverlayHtmlSlot from '@src/plugin-slots/HomeOverlayHtmlSlot';
import { HomePromoVideoButtonSlot, HomePromoVideoModalSlot } from '@src/plugin-slots/HomePromoVideoSlots';

import messages from './messages';

const HomeBanner = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [isOpen, open, close] = useToggle(false);

  const handleSearch = () => navigate(`${ROUTES.COURSES}?search_query=${searchValue}`);

  const searchField = getConfig().ENABLE_COURSE_DISCOVERY && (
    <Form.Group className="mt-4.5">
      <SearchField
        placeholder={intl.formatMessage(messages.searchPlaceholder)}
        value={searchValue}
        onChange={(value: string) => setSearchValue(value)}
        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch();
          }
        }}
        onSubmit={() => {}}
      />
    </Form.Group>
  );

  return (
    <section
      className="home-banner d-flex justify-content-center align-items-center position-relative overflow-hidden"
      data-testid="home-banner"
    >
      <div className="animation-wrapper d-flex justify-content-center align-items-center flex-column p-4 my-5">
        <HomeOverlayHtmlSlot />
        <HomePromoVideoButtonSlot onClick={open} />
        <Container size="sm">
          {searchField}
        </Container>
      </div>
      <HomePromoVideoModalSlot
        isOpen={isOpen}
        close={close}
        videoId={getConfig().HOMEPAGE_PROMO_VIDEO_YOUTUBE_ID || ''}
      />
    </section>
  );
};

export default HomeBanner;
