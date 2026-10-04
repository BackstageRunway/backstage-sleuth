import { doraFrontendPlugin } from './plugin';
import {
  doraLegacyPlugin,
  DoraELTPage,
  DoraLeadPage,
  DoraPerformanceComponent,
  isSleuthDoraAvailable,
} from './legacy';

describe('sleuth-dora', () => {
  it('should export plugin', () => {
    expect(doraFrontendPlugin).toBeDefined();
  });

  it('should export the legacy frontend plugin and its extensions', () => {
    expect(doraLegacyPlugin.getId()).toBe('sleuth-dora');
    expect(DoraELTPage).toBeDefined();
    expect(DoraLeadPage).toBeDefined();
    expect(DoraPerformanceComponent).toBeDefined();
  });

  it('offers the Sleuth tab only on service and website components', () => {
    const component = (type: string) => ({
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: { name: 'x' },
      spec: { type },
    });
    expect(isSleuthDoraAvailable(component('service'))).toBe(true);
    expect(isSleuthDoraAvailable(component('website'))).toBe(true);
    expect(isSleuthDoraAvailable(component('library'))).toBe(false);
  });
});
