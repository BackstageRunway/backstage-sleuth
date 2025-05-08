//import { parseEntityRef } from '@backstage/catalog-model';
import {
  ConfigApi,
  createApiRef,
  IdentityApi,
} from '@backstage/core-plugin-api';
import { IProjectMetricInsights, IProjectMetricResponse, ITeamMetricResponse } from '../DORAMetricModel';
import { DoraMetricsResult } from '../types/DoraMetrics';

const API_PATHS = {
  PERMISSION: '/api/permission/',
  TEAM_METRICS: '/api/proxy/dora/teammetrics',
  PROJECT_METRICS: '/api/proxy/dora/projectmetrics',
  PROJECT_INSIGHTS: '/api/proxy/dora/projectmetricsinsights',
  DORA_METRICS: '/api/dora/metrics',
} as const;

export interface DORABackendClient {
  // Existing Sleuth API methods
  getUserAuthorization(): Promise<{ status: string; [key: string]: any }>;
  getTeamDORAMetrics(team: string, dateRange: string): Promise<ITeamMetricResponse | null>;
  getProjectDORAMetrics(project: string, env: string, deployment: string, dateRange: string): Promise<IProjectMetricResponse | null>;
  getProjectDORAMetricsInsights(project: string, env: string, deployment: string, dateRange: string): Promise<IProjectMetricInsights | null>;
  
  // New DORA metrics method
  getMetrics(projectId: string, timeRange: { start: string; end: string; [key: string]: any }): Promise<DoraMetricsResult>;
}

export type Options = {
  configApi: ConfigApi;
  identityApi: IdentityApi;
  [key: string]: any; // Allow additional options
};

export const doraBackendApiRef = createApiRef<DORABackendClient>({
  id: 'plugin.dora.backend',
});

export class DORABackendClientImpl implements DORABackendClient {
  private readonly configApi: ConfigApi;
  private readonly identityApi: IdentityApi;
  private readonly baseUrl: string;

  constructor(options: Options) {
    this.configApi = options.configApi;
    this.identityApi = options.identityApi;
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
    const url = `${this.baseUrl}${API_PATHS.TEAM_METRICS}?team=${team}&dateRange=${dateRange}`;
    return this.fetchWithAuth(url);
  }

  async getProjectDORAMetrics(project: string, env: string, deployment: string, dateRange: string) {
    const url = `${this.baseUrl}${API_PATHS.PROJECT_METRICS}?project=${project}&environment=${env}&deployment=${deployment}&dateRange=${dateRange}`;
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
    const params = new URLSearchParams({
      start: timeRange.start,
      end: timeRange.end,
      ...Object.entries(timeRange)
        .filter(([key]) => !['start', 'end'].includes(key))
        .reduce((acc, [key, value]) => ({ ...acc, [key]: String(value) }), {}),
    });

    return this.fetchWithAuth(
      `${this.baseUrl}${API_PATHS.DORA_METRICS}/${projectId}?${params.toString()}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
  }
}