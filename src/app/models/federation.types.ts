export type ModuleStatus = 'stable' | 'beta' | 'alpha' | 'deprecated';

export interface MenuItemMetadata {
  label: string;
  icon: string;
  order: number;
  parent?: string | null;
  badge?: string;
  permissions?: string[];
  visible?: boolean;
  dividerAfter?: boolean;
}

export interface RouteMetadata {
  path: string;
  component: string;
  exact?: boolean;
  title?: string;
  permissions?: string[];
  layout?: 'default' | 'minimal' | 'fullscreen';
}

export interface NavigationMetadata {
  showInMenu: boolean;
  showInSidebar: boolean;
  showInBreadcrumb?: boolean;
  category?: string;
}

export interface ThemeMetadata {
  primaryColor?: string;
  accentColor?: string;
  darkMode?: boolean;
}

export interface RemoteMetadata {
  displayName: string;
  description: string;
  icon: string;
  basePath: string;
  menuItem?: MenuItemMetadata;
  routes?: RouteMetadata[];
  navigation: NavigationMetadata;
  theme?: ThemeMetadata;
  features?: string[];
  dependencies?: Record<string, string>;
  status: ModuleStatus;
  maintainer?: string;
  documentation?: string;
  healthCheck?: string;
}

export interface RemoteConfig {
  url: string;
  version: string;
  fallbackUrl?: string;
  metadata: RemoteMetadata;
}

export interface FederationManifest {
  remotes: Record<string, RemoteConfig>;
  globalSettings?: {
    defaultTheme?: ThemeMetadata;
    allowedFeatures?: string[];
  };
}

export interface MenuItem {
  name: string;
  label: string;
  icon: string;
  basePath: string;
  order: number;
  category: string;
  badge?: string;
  permissions: string[];
  dividerAfter?: boolean;
  description?: string;
  visible: boolean;
  parent?: string | null;
  children?: MenuItem[];
}
