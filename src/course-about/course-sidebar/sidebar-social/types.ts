import type { Icon } from '@openedx/paragon';

export interface SocialLink {
  id: string;
  destination: string;
  icon: typeof Icon;
  screenReaderText: string;
}
