import { render, screen, within } from '@testing-library/react';
import { IntlProvider } from '@openedx/frontend-base';
import {
  BsFacebook as BsFacebookIcon,
  BsTwitterX as BsTwitterXIcon,
} from '@openedx/paragon/icons';

import SocialLinks from '../SocialLinks';

const socialLinks = [
  {
    id: 'twitter',
    destination: 'https://twitter.com/intent/tweet?text=Hello',
    icon: BsTwitterXIcon,
    screenReaderText: 'Share on X',
  },
  {
    id: 'facebook',
    destination: 'https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fexample.com%2Fcourses%2F1',
    icon: BsFacebookIcon,
    screenReaderText: 'Share on Facebook',
  },
];

/** The deprecated Course About path must keep rendering its links through the shared Module. */
describe('SocialLinks', () => {
  it('delegates every supplied social link to ShareLinks, in order', () => {
    render(<IntlProvider locale="en"><SocialLinks socialLinks={socialLinks} /></IntlProvider>);

    const links = screen.getAllByRole('link');

    expect(links.map((link) => link.getAttribute('href'))).toEqual(
      socialLinks.map((link) => link.destination),
    );
    socialLinks.forEach((socialLink, index) => {
      expect(within(links[index]).getByText(socialLink.screenReaderText)).toBeInTheDocument();
    });
  });
});
