//import { parseEntityRef } from '@backstage/catalog-model';
import {
  ConfigApi,
  createApiRef,
  DiscoveryApi,
  IdentityApi,
} from '@backstage/core-plugin-api';
import { IProjectMetricResponse } from '../DORAMetricModel';
import { DoraMetricsResult } from '../types/DoraMetrics';

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
  // getProjectDORAMetricsInsights(project: string, env: string, deployment: string, dateRange: string): Promise<IProjectMetricInsights | null>;
  
  // New DORA metrics method
  getMetrics(projectId: string, timeRange: { start: string; end: string; [key: string]: any }): Promise<DoraMetricsResult>;
  getDeployments(request: {
    orgSlug: string;
    teamSlugs?: string[];
    projectSlugs: string[];
    environmentSlugs: string[];
    deploymentSlugs: string[];
    start: string;
    end: string;
    page: number;
    deploymentType: string[];
    size: string[];
    healthTimes: string[];
    onlyFailedDeploys?: boolean;
    orderBy?: string | null;
  }): Promise<any>;
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

  async getTeamDORAMetrics(team: string, dateRange: string) {
    const baseUrl =  await this.discoveryApi.getBaseUrl('dora-backend');
    const url = `${baseUrl}${API_PATHS.TEAM_METRICS}?team=${team}&dateRange=${dateRange}`;
    return this.fetchWithAuth(url);
  }

  async getProjectDORAMetrics(orgId: string, projectId: string, environment: string, deployment: string, timeRange: string) {
    const baseUrl = await this.discoveryApi.getBaseUrl('dora-backend');
    const url = `${baseUrl}/metrics/${orgId}/${projectId}?environment=${environment}&deploymentId=${deployment}&timeRange=${timeRange}`;
    console.log('Making request to:', url);
    return this.fetchWithAuth(url);
  }

  async getProjectDORAMetricsInsights(project: string, env: string, deployment: string, dateRange: string) {
    const url = `${this.baseUrl}${API_PATHS.PROJECT_INSIGHTS}?project=${project}&environment=${env}&deployment=${deployment}&dateRange=${dateRange}`;
    return this.fetchWithAuth(url);
  }

  async getMetrics(
    projectId: string,
    timeRange: { start: string; end: string; [key: string]: any },
  ): Promise<DoraMetricsResult> {
    const baseUrl = await this.discoveryApi.getBaseUrl('dora-backend');
    const params = new URLSearchParams({
      start: timeRange.start,
      end: timeRange.end,
      ...Object.entries(timeRange)
        .filter(([key]) => !['start', 'end'].includes(key))
        .reduce((acc, [key, value]) => ({ ...acc, [key]: String(value) }), {}),
    });

    return this.fetchWithAuth(
      `${baseUrl}${API_PATHS.DORA_METRICS}/${projectId}?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }

  async getDeployments(request: {
    orgSlug: string;
    teamSlugs?: string[];
    projectSlugs: string[];
    environmentSlugs: string[];
    deploymentSlugs: string[];
    start: string;
    end: string;
    page: number;
    deploymentType: string[];
    size: string[];
    healthTimes: string[];
    onlyFailedDeploys?: boolean;
    orderBy?: string | null;
  }): Promise<any> {
    const baseUrl = await this.discoveryApi.getBaseUrl('dora-backend');
    return this.fetchWithAuth(
      `${baseUrl}${API_PATHS.DEPLOYMENTS}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      },
    );
  }
}