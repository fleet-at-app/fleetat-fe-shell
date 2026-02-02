import {inject, Injectable, Injector} from '@angular/core';
import { Router, Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { FederationManifest, RemoteConfig } from '../models/federation.types';

@Injectable({ providedIn: 'root' })
export class FederationService {
  private readonly injector = inject(Injector);
  private manifest: FederationManifest | null = (window as any).federationManifest || null;
  private routesRegistered = false;

  async loadManifest(): Promise<FederationManifest> {
    if (this.manifest) {
      if (!this.routesRegistered) {
        this.registerRemoteRoutes();
      }
      return this.manifest;
    }

    try {
      const response = await fetch('federation.manifest.json');
      if (response.ok) {
        this.manifest = await response.json();
        this.registerRemoteRoutes();
      }
    } catch (err) {
      console.error('Failed to load fallback manifest', err);
    }

    if (!this.manifest) {
      throw new Error('Federation manifest not loaded');
    }

    return this.manifest;
  }

  private registerRemoteRoutes() {
    if (!this.manifest || this.routesRegistered) return;

    const router = this.injector.get(Router);

    const remoteRoutes: Routes = Object.entries(this.manifest.remotes)
      .filter(([_, config]) => config.metadata.basePath)
      .map(([remoteName, config]) => ({
        path: config.metadata.basePath.replace(/^\//, ''),
        loadChildren: () =>
          loadRemoteModule({
            remoteName,
            exposedModule: config.metadata.exposedModule || './routes',
          }).then((m) => m.default || m.routes || m),
      }));

    const currentConfig = router.config;
    const wildcardIndex = currentConfig.findIndex((r) => r.path === '**');

    let newConfig: Routes;
    if (wildcardIndex !== -1) {
      newConfig = [
        ...currentConfig.slice(0, wildcardIndex),
        ...remoteRoutes,
        ...currentConfig.slice(wildcardIndex),
      ];
    } else {
      newConfig = [...currentConfig, ...remoteRoutes];
    }

    router.resetConfig(newConfig);
    this.routesRegistered = true;
  }

  getRemoteMetadata(remoteName: string): RemoteConfig['metadata'] | null {
    return this.manifest?.remotes[remoteName]?.metadata || null;
  }

  getAllRemotes(): Record<string, RemoteConfig> {
    return this.manifest?.remotes || {};
  }
}
