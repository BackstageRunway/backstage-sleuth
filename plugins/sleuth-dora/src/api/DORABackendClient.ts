//import { parseEntityRef } from '@backstage/catalog-model';
import {
  ConfigApi,
  createApiRef,
  DiscoveryApi,
  IdentityApi,
} from '@backstage/core-plugin-api';
import { ProjectMetricsResponse } from '../components/dora/common/types/api';

const API_PATHS = {
  PERMISSION: '/permission/',
  TEAM_METRICS: '/teammetrics',
  PROJECT_METRICS: '/projectmetrics',
  PROJECT_INSIGHTS: '/projectmetricsinsights',
  DORA_METRICS: '/metrics',
  DEPLOYMENTS: '/deployments',
} as const;

export interface DORABackendClient {
  // Existing Sleuth API methods
  // getUserAuthorization(): Promise<{ status: string; [key: string]: any }>;
  getProjectDORAMetrics( projectId: string, environment: string, deployment: string, timeRange: string): Promise<ProjectMetricsResponse | null>;
  getProjectDORAMetricsInsights( projectId: string, environment: string, deployment: string, timeRange: string): Promise<any>;
  getOrganizationTrendMetrics( timeRange: string): Promise<any>;
  
  // Team metrics methods
  getTeamDORAMetrics( teamSlug: string, environment: string, deployment: string, timeRange: string): Promise<ProjectMetricsResponse | null>;
  getTeamDORAMetricsInsights( teamSlug: string, environment: string, deployment: string, timeRange: string): Promise<any>;
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
  private readonly configApi: ConfigApi;
  private readonly identityApi: IdentityApi;
  private readonly discoveryApi: DiscoveryApi;
  private readonly baseUrl: string;

  constructor(options: Options) {
    this.configApi = options.configApi;
    this.identityApi = options.identityApi;
    this.discoveryApi = options.discoveryApi;
    this.baseUrl = this.configApi.getString('backend.baseUrl');
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
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  async getUserAuthorization() {
    return this.fetchWithAuth(`${this.baseUrl}${API_PATHS.PERMISSION}`);
  }


  async getProjectDORAMetrics(projectSlug: string, environment: string, deployment: string, timeRange: string) {
    const baseUrl = await this.discoveryApi.getBaseUrl('sleuth-dora-backend');
    const url = `${baseUrl}/metrics/${projectSlug}?environment=${environment}&deploymentId=${deployment}&timeRange=${timeRange}`;
    return this.fetchWithAuth(url);
  }

  async getProjectDORAMetricsInsights(projectId: string, environment: string, deployment: string, timeRange: string) {
    const baseUrl = await this.discoveryApi.getBaseUrl('sleuth-dora-backend');
    const url = `${baseUrl}/metrics-insights/${projectId}?environment=${environment}&deploymentId=${deployment}&timeRange=${timeRange}`;
    return this.fetchWithAuth(url);
  }

  async getOrganizationTrendMetrics(timeRange: string) {
    const baseUrl = await this.discoveryApi.getBaseUrl('sleuth-dora-backend');
    const url = `${baseUrl}/org-trend-metrics?timeRange=${timeRange}`;
    return this.fetchWithAuth(url);
  }

  async getTeamDORAMetrics(teamSlug: string, environment: string, deployment: string, timeRange: string) {
    const baseUrl = await this.discoveryApi.getBaseUrl('sleuth-dora-backend');
    const url = `${baseUrl}/team-metrics/${teamSlug}?environment=${environment}&deploymentId=${deployment}&timeRange=${timeRange}`;
    return this.fetchWithAuth(url);
  }

  async getTeamDORAMetricsInsights(teamSlug: string, environment: string, deployment: string, timeRange: string) {
    const baseUrl = await this.discoveryApi.getBaseUrl('sleuth-dora-backend');
    const url = `${baseUrl}/team-metrics-insights/${teamSlug}?environment=${environment}&deploymentId=${deployment}&timeRange=${timeRange}`;
    return this.fetchWithAuth(url);
  }

  async getBatchTeamDORAMetrics(teamSlugs: string[], environment: string, deployment: string, timeRange: string) {
    const baseUrl = await this.discoveryApi.getBaseUrl('sleuth-dora-backend');
    const url = `${baseUrl}/batch-team-metrics`;
    const body = {
      teamSlugs,
      environment,
      deploymentId: deployment,
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