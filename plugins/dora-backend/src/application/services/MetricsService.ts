import { DatabaseService, LoggerService } from '@backstage/backend-plugin-api';
import { DeploymentRequest, DeploymentResponse, ProjectMetricsResponse } from '../../domain/models/SleuthBatchTypes';
import { SleuthClient } from '../../infrastructure/sleuth/SleuthClient';

export class MetricsService {
  constructor(
    private readonly database: DatabaseService,
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
    
    // Calculate current period
    const currentEnd = new Date();
    currentEnd.setHours(23, 59, 59, 999); // End of the day
    
    const currentStart = new Date(currentEnd);
    currentStart.setDate(currentStart.getDate() - days);
    currentStart.setHours(0, 0, 0, 0); // Start of the day
    
    // Previous period ends where current period starts
    const previousEnd = new Date(currentStart);
    previousEnd.setHours(23, 59, 59, 999);
    
    // Previous period starts by subtracting the same number of days
    const previousStart = new Date(previousEnd);
    previousStart.setDate(previousStart.getDate() - days);
    previousStart.setHours(0, 0, 0, 0);

    return {
      currentRangeStart: currentStart.toISOString(),
      currentRangeEnd: currentEnd.toISOString(),
      previousRangeStart: previousStart.toISOString(),
      previousRangeEnd: previousEnd.toISOString(),
    };
  }

  async getProjectMetrics(orgId:string, projectId: string, environment:string, deploymentId:string, team:string, timeRange: string): Promise<ProjectMetricsResponse> {
    try {
      const dateRanges = this.calculateDateRanges(timeRange);

      this.logger.info('Fetching metrics', {
        projectId: projectId,
        timeRange: timeRange,
      });

      const response = await this.client.projectMetrics({
        orgSlug: orgId,
        projectSlug: projectId,
        environment: environment,
        deploymentSlug: deploymentId,
        teamSlug: team,
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
        projectId,
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
        projectId,
      });
      throw error;
    }
  }


  async getDeployments(request: DeploymentRequest): Promise<DeploymentResponse> {
    try {
      this.logger.info('Fetching deployments', {
        orgSlug: request.orgSlug,
        projectSlugs: request.projectSlugs,
        start: request.start,
        end: request.end,
      });

      return await this.client.getDeployments(request);
    } catch (error) {
      this.logger.error('Failed to fetch deployments', {
        error: error instanceof Error ? error.message : String(error),
        orgSlug: request.orgSlug,
        projectSlugs: request.projectSlugs,
      });
      throw error;
    }
  }
}