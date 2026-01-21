import { computed, inject, Injectable, signal } from '@angular/core';
import { FederationService } from './federation.service';
import { FederationManifest, MenuItem } from '../models/federation.types';

@Injectable({ providedIn: 'root' })
export class MenuService {
  private readonly federationService = inject(FederationService);

  private readonly _menuItems = signal<MenuItem[]>([]);
  readonly menuItems = this._menuItems.asReadonly();

  readonly menuCategories = computed(() =>
    [...new Set(this.menuItems().map(item => item.category))]
  );

  async initializeMenu() {
    try {
      const manifest = await this.federationService.loadManifest();
      this.buildMenuFromManifest(manifest);
    } catch (err) {
      console.error('Error loading manifest in MenuService', err);
    }
  }

  private buildMenuFromManifest(manifest: FederationManifest) {
    const items: MenuItem[] = Object.entries(manifest.remotes)
      .filter(([_, config]) => config.metadata.navigation.showInMenu)
      .map(([name, config]) => ({
        name,
        label: config.metadata.menuItem?.label || config.metadata.displayName,
        icon: config.metadata.menuItem?.icon || config.metadata.icon,
        basePath: config.metadata.basePath,
        order: config.metadata.menuItem?.order || 999,
        category: config.metadata.navigation.category || 'Other',
        badge: config.metadata.menuItem?.badge,
        permissions: config.metadata.menuItem?.permissions || [],
        dividerAfter: config.metadata.menuItem?.dividerAfter
      }))
      .sort((a, b) => a.order - b.order);

    this._menuItems.set(items);
  }

  getMenuItemsByCategory(category: string): MenuItem[] {
    return this.menuItems().filter(item => item.category === category);
  }
}
