import { DoraMetricsResult } from '../models/DoraMetrics';
import { BatchMetricsRequest, BatchMetricsResponse } from '../models/SleuthBatchTypes';

export interface DoraMetricsProvider {
  getMetrics(projectId: string, timeRange: { start: string; end: string }): Promise<DoraMetricsResult>;
  getBatchMetrics(request: BatchMetricsRequest): Promise<BatchMetricsResponse>;
} 