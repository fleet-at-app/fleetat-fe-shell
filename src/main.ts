import { initFederation } from '@angular-architects/native-federation';
import { environment } from './environments/environment';

// Point this to your Discovery API endpoint provided by your fleetat-fe-server
const DISCOVERY_URL = environment.discoveryUrl;

fetch(DISCOVERY_URL)
  .then(res => {
    if (!res.ok) throw new Error('Network response was not ok');
    return res.json();
  })
  .then(manifest => {
    // Transform to Record<string, string> for Native Federation
    const remotes = Object.entries(manifest.remotes).reduce((acc: any, [name, config]: [string, any]) => {
      acc[name] = config.url;
      return acc;
    }, {});

    // Store the full manifest for the FederationService
    (window as any).federationManifest = manifest;

    return initFederation(remotes);
  })
  .catch(err => {
    console.error('Failed to load dynamic manifest, falling back to local defaults', err);
    // Optional: Fallback to a local file if the server is unreachable
    return initFederation('federation.manifest.json');
  })
  .then(_ => import('./bootstrap'))
  .catch(err => console.error('Bootstrap error:', err));
