import { LoggerService } from '@backstage/backend-plugin-api';
import { ProjectInsightsResponse, ProjectMetricsResponse } from '../../domain/models/SleuthBatchTypes';
import { SleuthClient } from '../../infrastructure/sleuth/SleuthClient';

export class MetricsService {
  constructor(
    //private readonly database: DatabaseService,
    private readonly client: SleuthClient,
    private readonly logger: LoggerService,
  ) {}

  private parseDateRange(rangeStr: string): number {
    const match = rangeStr.match(/last(\d+)days/i);
    if (!match) {
      throw new Error('Invalid date range format. Expected format: lastXdays (e.g., last7days)');
    }
    return parseInt(match[1], 10);
  }

  private calculateDateRanges(dateRange: string): {
    currentRangeStart: string;
    currentRangeEnd: string;
    previousRangeStart: string;
    previousRangeEnd: string;
  } {
    // Get number of days from the range string (e.g., "last7days" -> 7)
    const days = this.parseDateRange(dateRange);
    
    // Calculate current period - match Sleuth's behavior exactly
    const now = new Date();
    // End date should be next day at 00:00:00 (representing end of current day)
    const currentEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0));
    
    // For "last X days", we want to go back (X-1) days from today
    // So for last 7 days: today + 6 days back = 7 days total
    const currentStart = new Date(currentEnd);
    currentStart.setUTCDate(currentStart.getUTCDate() - days);
    
    // Previous period ends where current period starts
    const previousEnd = new Date(currentStart);
    
    // Previous period starts by subtracting the same number of days
    const previousStart = new Date(previousEnd);
    previousStart.setUTCDate(previousStart.getUTCDate() - days);

    return {
      currentRangeStart: currentStart.toISOString(),
      currentRangeEnd: currentEnd.toISOString(),
      previousRangeStart: previousStart.toISOString(),
      previousRangeEnd: previousEnd.toISOString(),
    };
  }

  async getProjectMetrics(orgId:string, projectSlug: string, environment:string, deploymentId:string, timeRange: string): Promise<ProjectMetricsResponse> {
    try {
      const dateRanges = this.calculateDateRanges(timeRange);

      this.logger.info('Fetching metrics', {
        projectSlug: projectSlug,
        timeRange: timeRange,
      });

      const response = await this.client.projectMetrics({
        orgSlug: orgId,
        projectSlug: projectSlug,
        environment: environment,
        deploymentSlug: deploymentId,
        metricTypes: ['metrics'],
        currentRangeStart: dateRanges.currentRangeStart,
        currentRangeEnd: dateRanges.currentRangeEnd,
        previousRangeStart: dateRanges.previousRangeStart,
        previousRangeEnd: dateRanges.previousRangeEnd,
      });

      if (!response.project?.currentRange || !response.project?.previousRange) {
        throw new Error('No metrics data available');
      }

      // Log the metrics for monitoring
      this.logger.info('Retrieved metrics', {
        projectSlug,
        currentRange: {
          avgLeadTimeInSec: response.project.currentRange.avgLeadTimeInSec,
          numOfDeploys: response.project.currentRange.numOfDeploys,
          numOfDeploysPerDay: response.project.currentRange.numOfDeploysPerDay,
          failureRatePercent: response.project.currentRange.failureRatePercent,
          avgMttrDurationInSec: response.project.currentRange.avgMttrDurationInSec,
        },
        previousRange: {
          avgLeadTimeInSec: response.project.previousRange.avgLeadTimeInSec,
          numOfDeploys: response.project.previousRange.numOfDeploys,
          numOfDeploysPerDay: response.project.previousRange.numOfDeploysPerDay,
          failureRatePercent: response.project.previousRange.failureRatePercent,
          avgMttrDurationInSec: response.project.previousRange.avgMttrDurationInSec,
        }
      });

      return response;
    } catch (error) {
      this.logger.error('Failed to fetch metrics', {
        error: error instanceof Error ? error.message : String(error),
        projectSlug,
      });
      throw error;
    }
  }


  async getProjectMetricsInsights(orgId:string, projectSlug: string, environment:string, deploymentId:string, timeRange: string): Promise<ProjectInsightsResponse> {
    try {
      const dateRanges = this.calculateDateRanges(timeRange);

      this.logger.info('Fetching metrics Insights', {
        projectSlug: projectSlug,
        timeRange: timeRange,
      });

      const response = await this.client.projectMetricsInsights({
        orgSlug: orgId,
        projectSlug: projectSlug,
        environment: environment,
        deploymentSlug: deploymentId,
        metricTypes: ['metrics'],
        currentRangeStart: dateRanges.currentRangeStart,
        currentRangeEnd: dateRanges.currentRangeEnd,
        previousRangeStart: dateRanges.previousRangeStart,
        previousRangeEnd: dateRanges.previousRangeEnd,
      });

      if (!response) {
        throw new Error('No metrics Insights data available');
      }

      // Log the metrics for monitoring
      this.logger.info('Retrieved metrics Insights');

      return response;
    } catch (error) {
      this.logger.error('Failed to fetch metrics insights', {
        error: error instanceof Error ? error.message : String(error),
        projectSlug,
      });
      throw error;
    }
  }

  async getOrganizationTrendMetrics(
    orgId: string,
    timeRange: string,
  ): Promise<any> {
    try {
      this.logger.info('Fetching organization trend metrics', {
        orgId,
        timeRange,
      });

      const dateRanges = this.calculateDateRanges(timeRange);
      const organization = await this.client.getTrendMetrics(
        orgId,
        dateRanges.currentRangeStart,
        dateRanges.currentRangeEnd,
      );
      this.logger.info('Retrieved organization trend metrics', { organization });
      return organization;
    } catch (error) {
      this.logger.error('Failed to fetch organization trend metrics', {
        error: error instanceof Error ? error.message : String(error),
        orgId,
      });
      throw error;
    }
  }
}