import { useState } from 'react';
import { useNavigate } from 'react-router';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Search as SearchIcon } from '@openedx/paragon/icons';
import {
  Button, Form, IconButton, useToggle,
} from '@openedx/paragon';

import { ROUTES } from '../../../routes';
import { VideoModal } from '../../../generic';
import { HomeBannerProps } from './types';

import messages from './messages';

const HomeBanner = ({
  homepageOverlayHtml,
  showHomepagePromoVideo,
  homepagePromoVideoYoutubeId,
  enableCourseDiscovery,
}: HomeBannerProps) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const [isOpen, open, close] = useToggle(false);

  const { SITE_NAME } = getConfig();

  const handleSearch = () => navigate(`${ROUTES.COURSES}?search_query=${searchValue}`);

  const heading = homepageOverlayHtml ? (
    // eslint-disable-next-line react/no-danger
    <div className="banner-title" dangerouslySetInnerHTML={{ __html: homepageOverlayHtml }} />
  ) : (
    <>
      <h1 className="display-1 text-white text-center">
        {intl.formatMessage(messages.title, { siteName: SITE_NAME })}
      </h1>
      <p className="heading-label text-white text-center">{intl.formatMessage(messages.subtitle)}</p>
    </>
  );

  const videoButton = showHomepagePromoVideo && (
    <Button
      variant="brand"
      className="video-button"
      onClick={open}
    >
      {intl.formatMessage(messages.videoButton)}
    </Button>
  );

  const searchField = enableCourseDiscovery && (
    <Form.Group className="w-100 mb-0 mt-4.5">
      <Form.Control
        trailingElement={(
          <IconButton
            className="search-button"
            iconAs={SearchIcon}
            size="md"
            alt={intl.formatMessage(messages.videoButtonAlt)}
            onClick={handleSearch}
          />
        )}
        placeholder={intl.formatMessage(messages.searchPlaceholder)}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch();
          }
        }}
      />
    </Form.Group>
  );

  return (
    <section
      className="home-banner d-flex justify-content-center align-items-center position-relative overflow-hidden"
      data-testid="home-banner"
    >
      <div className="outer-wrapper d-flex justify-content-center align-items-center flex-column mx-auto mt-0 p-4">
        {heading}
        {videoButton}
        {searchField}
      </div>
      {showHomepagePromoVideo && (
        <VideoModal
          isOpen={isOpen}
          close={close}
          videoID={homepagePromoVideoYoutubeId || ''}
        />
      )}
    </section>
  );
};

export default HomeBanner;
