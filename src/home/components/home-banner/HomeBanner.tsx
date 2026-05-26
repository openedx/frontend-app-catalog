import { useState } from 'react';
import { useNavigate } from 'react-router';
import { getAppConfig, useIntl } from '@openedx/frontend-base';
import {
  Form, useToggle, SearchField, Container,
} from '@openedx/paragon';

import { appId, ROUTES } from '@src/constants';
import HomeOverlayHtmlSlot from '@src/slots/HomeOverlayHtmlSlot';
import { HomePromoVideoButtonSlot, HomePromoVideoModalSlot } from '@src/slots/HomePromoVideoSlots';

import messages from './messages';

const HomeBanner = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [isOpen, open, close] = useToggle(false);

  const handleSearch = () => navigate(`${ROUTES.COURSES}?search_query=${searchValue}`);

  const searchField = getAppConfig(appId).ENABLE_COURSE_DISCOVERY === true && (
    <Form.Group className="mt-4.5">
      <SearchField
        placeholder={intl.formatMessage(messages.searchPlaceholder)}
        value={searchValue}
        submitButtonLocation="external"
        onChange={(value: string) => setSearchValue(value)}
        onSubmit={handleSearch}
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
        videoId={(getAppConfig(appId).HOMEPAGE_PROMO_VIDEO_YOUTUBE_ID as string | undefined) || ''}
      />
    </section>
  );
};

export default HomeBanner;
