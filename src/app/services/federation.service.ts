import { inject, Injectable } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';
import { FederationManifest, RemoteConfig } from '../models/federation.types';

@Injectable({ providedIn: 'root' })
export class FederationService {
  private readonly router = inject(Router);
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

    const routes: Routes = [];

    Object.entries(this.manifest.remotes).forEach(([remoteName, config]) => {
      const remoteRoutes = config.metadata.routes || [];

      remoteRoutes.forEach(route => {
        routes.push({
          path: route.path.replace(/^\//, ''), // Remove leading slash
          loadChildren: () =>
            loadRemoteModule({
              remoteName,
              exposedModule: route.component
            }).then(m => m.default || m)
        });
      });
    });

    // Add routes dynamically
    this.router.resetConfig([
      ...this.router.config,
      ...routes,
      { path: '**', redirectTo: '' }
    ]);

    this.routesRegistered = true;
  }

  getRemoteMetadata(remoteName: string): RemoteConfig['metadata'] | null {
    return this.manifest?.remotes[remoteName]?.metadata || null;
  }

  getAllRemotes(): Record<string, RemoteConfig> {
    return this.manifest?.remotes || {};
  }
}
