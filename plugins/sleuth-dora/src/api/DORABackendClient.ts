import {
  ConfigApi,
  createApiRef,
  DiscoveryApi,
  IdentityApi,
} from '@backstage/core-plugin-api';
import { ProjectMetricsResponse } from '../components/dora/common/types/api';

export interface DORABackendClient {
  getProjectDORAMetrics( projectId: string, environment: string, deployment: string, timeRange: string): Promise<ProjectMetricsResponse | null>;
  getProjectDORAMetricsInsights( projectId: string, environment: string, deployment: string, timeRange: string): Promise<any>;
  getOrganizationTrendMetrics( timeRange: string): Promise<any>;
  getBatchTeamDORAMetrics( teamSlugs: string[], environment: string, deployment: string, timeRange: string): Promise<any>;
}

export type Options = {
  configApi: ConfigApi;
  identityApi: IdentityApi;
  discoveryApi: DiscoveryApi,
  [key: string]: any; // Allow additional options
};

export const doraBackendApiRef = createApiRef<DORABackendClient>({
  id: 'plugin.dora.backend.service',
});

export class DORABackendClientImpl implements DORABackendClient {
  private readonly identityApi: IdentityApi;
  private readonly discoveryApi: DiscoveryApi;

  constructor(options: Options) {
    this.identityApi = options.identityApi;
    this.discoveryApi = options.discoveryApi;
  }

  private async fetchWithAuth(url: string, options: RequestInit = {}) {
    const { token: idToken } = await this.identityApi.getCredentials();
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        ...(idToken && { Authorization: `Bearer ${idToken}` }),
      },
    });

    if (!response.ok) {
      // The plugin backend answers { error: '...' }, Backstage itself { error: { message } },
      // and a proxy in between may answer with something that is not JSON at all
      const body = await response.json().catch(() => undefined);
      const reason = typeof body?.error === 'string' ? body.error : body?.error?.message;
      throw new Error(reason || `Request failed with status ${response.status}`);
    }

    return response.json();
  }

  async getProjectDORAMetrics(projectSlug: string, environment: string, deploymentSlug: string, timeRange: string) {
    const baseUrl = await this.discoveryApi.getBaseUrl('sleuth-dora-backend');

    const query = new URLSearchParams({ environment, deploymentId: deploymentSlug, timeRange });
    const url = `${baseUrl}/metrics/${encodeURIComponent(projectSlug)}?${query}`;
    return this.fetchWithAuth(url);
  }

  async getProjectDORAMetricsInsights(projectSlug: string, environment: string, deploymentSlug: string, timeRange: string) {
    const baseUrl = await this.discoveryApi.getBaseUrl('sleuth-dora-backend');

    const query = new URLSearchParams({ environment, deploymentId: deploymentSlug, timeRange });
    const url = `${baseUrl}/metrics-insights/${encodeURIComponent(projectSlug)}?${query}`;
    return this.fetchWithAuth(url);
  }

  async getOrganizationTrendMetrics(timeRange: string) {
    const baseUrl = await this.discoveryApi.getBaseUrl('sleuth-dora-backend');
    const url = `${baseUrl}/org-trend-metrics?${new URLSearchParams({ timeRange })}`;
    return this.fetchWithAuth(url);
  }

  async getBatchTeamDORAMetrics(teamSlugs: string[], environment: string, deploymentSlug: string, timeRange: string) {
    const baseUrl = await this.discoveryApi.getBaseUrl('sleuth-dora-backend');
    const url = `${baseUrl}/batch-team-metrics`;
    const body = {
      teamSlugs,
      environment,
      deploymentId: deploymentSlug,
      timeRange,
    };
    return this.fetchWithAuth(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  }

}