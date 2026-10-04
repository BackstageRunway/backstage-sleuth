import { DoraMetricsResult } from '../models/DoraMetrics';

export interface DoraMetricsProvider {
  getMetrics(projectId: string, timeRange: { start: string; end: string }): Promise<DoraMetricsResult>;
} 