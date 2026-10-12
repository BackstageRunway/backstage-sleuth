import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import { mockApis, TestApiProvider } from '@backstage/test-utils';
import { configApiRef } from '@backstage/core-plugin-api';
import { useDoraConfig } from './config';

const component = (name: string, annotations?: Record<string, string>) => ({
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: { name, annotations },
});

const resolve = (sleuth: Record<string, string>, entity?: ReturnType<typeof component>) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <TestApiProvider apis={[[configApiRef, mockApis.config({ data: { dora: { sleuth } } })]]}>
      {children}
    </TestApiProvider>
  );
  return renderHook(() => useDoraConfig(entity), { wrapper }).result.current;
};

const APP_CONFIG = { environment: 'staging', defaultProjectSlug: 'default-project', defaultTimeRange: 'last90days' };

describe('useDoraConfig', () => {
  it('prefers the annotations on the component', () => {
    const entity = component('checkout', {
      'sleuth.io/project-slug': 'shop',
      'sleuth.io/environment': 'production-eu',
      'sleuth.io/code-deployment-slug': 'checkout-api',
    });

    expect(resolve(APP_CONFIG, entity)).toEqual({
      projectSlug: 'shop',
      environment: 'production-eu',
      codeDeploymentSlug: 'checkout-api',
      defaultTimeRange: 'last90days',
    });
  });

  it('falls back to the app config for the project and environment', () => {
    const resolved = resolve(APP_CONFIG, component('checkout'));

    expect(resolved.projectSlug).toBe('default-project');
    expect(resolved.environment).toBe('staging');
  });

  it("uses the component's own name as the code deployment when it has no annotation", () => {
    expect(resolve(APP_CONFIG, component('checkout')).codeDeploymentSlug).toBe('checkout');
    expect(resolve(APP_CONFIG, component('checkout', { 'sleuth.io/project-slug': 'shop' })).codeDeploymentSlug).toBe('checkout');
  });

  it('mixes the levels, taking each value from the most specific place that has it', () => {
    const entity = component('checkout', { 'sleuth.io/code-deployment-slug': 'checkout-api' });

    expect(resolve({ defaultProjectSlug: 'default-project' }, entity)).toEqual({
      projectSlug: 'default-project',
      environment: 'production',
      codeDeploymentSlug: 'checkout-api',
      defaultTimeRange: 'last28days',
    });
  });

  it('falls back to the built-in defaults when nothing is configured', () => {
    expect(resolve({}, component('checkout'))).toEqual({
      projectSlug: 'sleuth',
      environment: 'production',
      codeDeploymentSlug: 'checkout',
      defaultTimeRange: 'last28days',
    });
  });

  it('has no code deployment outside a component, so team and organisation views cover everything', () => {
    expect(resolve(APP_CONFIG).codeDeploymentSlug).toBe('');
  });
});
