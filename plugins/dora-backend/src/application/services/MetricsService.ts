import { LoggerService } from '@backstage/backend-plugin-api';
import { DoraMetrics, DoraMetricsResult, ProjectId, TimeRange } from '../../domain/models/DoraMetrics';
import { BatchMetricsRequest, BatchMetricsResponse } from '../../domain/models/SleuthBatchTypes';
import { SleuthClient } from '../../infrastructure/sleuth/SleuthClient';

export class MetricsService {
  constructor(
    private readonly client: SleuthClient,
    private readonly logger: LoggerService,
  ) {}

  async getMetrics(projectId: string, timeRange: { start: string; end: string }): Promise<DoraMetricsResult> {
    try {
      const project = ProjectId.fromString(projectId);
      const range = new TimeRange(timeRange.start, timeRange.end);

      this.logger.info('Fetching metrics', {
        projectId: project.toString(),
        timeRange: {
          start: range.start,
          end: range.end,
        },
      });

      const metrics = await this.client.batchQuery({
        orgSlug: project.orgSlug,
        teamSlug: project.teamSlug,
        metricTypes: ['teamMetrics'],
        currentRangeStart: range.start,
        currentRangeEnd: range.end,
        previousRangeStart: range.start,
        previousRangeEnd: range.end,
      });

      if (!metrics.teamMetrics) {
        throw new Error('No metrics data available');
      }

      const doraMetrics = new DoraMetrics(
        metrics.teamMetrics.currentRange.numOfDeploysPerDay,
        metrics.teamMetrics.currentRange.avgLeadTimeInSec,
        metrics.teamMetrics.currentRange.failureRatePercent,
        metrics.teamMetrics.currentRange.avgMttrDurationInSec,
        project,
        range,
      );

      return new DoraMetricsResult(doraMetrics);
    } catch (error) {
      this.logger.error('Failed to fetch metrics', {
        error: error instanceof Error ? error.message : String(error),
        projectId,
      });
      throw error;
    }
  }

  async getBatchMetrics(request: BatchMetricsRequest): Promise<BatchMetricsResponse> {
    try {
      this.logger.info('Fetching batch metrics', {
        orgSlug: request.orgSlug,
        teamSlug: request.teamSlug,
        metricTypes: request.metricTypes,
      });

      return await this.client.batchQuery(request);
    } catch (error) {
      this.logger.error('Failed to fetch batch metrics', {
        error: error instanceof Error ? error.message : String(error),
        orgSlug: request.orgSlug,
        teamSlug: request.teamSlug,
      });
      throw error;
    }
  }
} 