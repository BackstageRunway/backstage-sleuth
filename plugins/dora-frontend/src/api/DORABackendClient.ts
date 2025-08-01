//import { parseEntityRef } from '@backstage/catalog-model';
import {
  ConfigApi,
  createApiRef,
  DiscoveryApi,
  IdentityApi,
} from '@backstage/core-plugin-api';
import { IProjectMetricResponse } from '../DORAMetricModel';
//import { DoraMetricsResult } from '../types/DoraMetrics';

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
  // getTeamDORAMetrics(team: string, dateRange: string): Promise<ITeamMetricResponse | null>;
  getProjectDORAMetrics(orgId: string, projectId: string, environment: string, deployment: string, timeRange: string): Promise<IProjectMetricResponse | null>;
  getProjectDORAMetricsInsights(orgId: string, projectId: string, environment: string, deployment: string, timeRange: string): Promise<any>;
  getOrganizationTrendMetrics(orgId: string, timeRange: string): Promise<any>;
  
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


  async getProjectDORAMetrics(orgId: string, projectSlug: string, environment: string, deployment: string, timeRange: string) {
    const baseUrl = await this.discoveryApi.getBaseUrl('dora-backend');
    const url = `${baseUrl}/metrics/${orgId}/${projectSlug}?environment=${environment}&deploymentId=${deployment}&timeRange=${timeRange}`;
    console.log('Making request to:', url);
    return this.fetchWithAuth(url);
  }

  async getProjectDORAMetricsInsights(orgId: string, projectId: string, environment: string, deployment: string, timeRange: string) {
    const baseUrl = await this.discoveryApi.getBaseUrl('dora-backend');
    const url = `${baseUrl}/metrics-insights/${orgId}/${projectId}?environment=${environment}&deploymentId=${deployment}&timeRange=${timeRange}`;
    console.log('Making request to:', url);
    return this.fetchWithAuth(url);
  }

  async getOrganizationTrendMetrics(orgId: string, timeRange: string) {
    const baseUrl = await this.discoveryApi.getBaseUrl('dora-backend');
    const url = `${baseUrl}/org-trend-metrics/${orgId}?timeRange=${timeRange}`;
    console.log('Making request to:', url);
    return this.fetchWithAuth(url);
  }

}