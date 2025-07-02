interface AuthenticatedUserTypes {
  email: string;
  userId: number;
  username: string;
  roles: string[];
  administrator: boolean;
  name: string;
}

export interface ConfigTypes {
  [key: string]: string | boolean | number | Record<string, any>;
}

export interface AppContextTypes {
  authenticatedUser: AuthenticatedUserTypes | null;
  config: ConfigTypes;
}

export interface MenuItem {
  type: 'item';
  href: string;
  content: string;
  isActive?: boolean;
}
