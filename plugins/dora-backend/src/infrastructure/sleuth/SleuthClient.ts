import { GraphQLClient } from 'graphql-request';
import { DoraMetricsError } from '../../domain/models/DoraMetrics';
import { DeploymentRequest, DeploymentResponse, ProjectMetricsRequest, ProjectMetricsResponse } from '../../domain/models/SleuthBatchTypes';

export class SleuthClient {
  private readonly client: GraphQLClient;

  constructor(apiKey: string) {
    this.client = new GraphQLClient('https://app.sleuth.io/graphql', {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
  }

  async query<T>(query: string, variables: Record<string, unknown>): Promise<T> {
    try {
      return await this.client.request<T>(query, variables);
    } catch (error) {
      throw new DoraMetricsError(
        'Failed to query Sleuth API',
        'PROVIDER_ERROR',
        error,
      );
    }
  }

  async getDeployments(request: DeploymentRequest): Promise<DeploymentResponse> {
    const query = `
      query GetProjectDeploys(
        $orgSlug: ID!
        $teamSlugs: [ID!]
        $projectSlugs: [ID!]!
        $environmentSlugs: [ID!]!
        $deploymentSlugs: [ID!]!
        $start: DateTime!
        $end: DateTime!
        $page: Int!
        $deploymentType: [String!]!
        $size: [String]!
        $healthTimes: [String]!
        $onlyFailedDeploys: Boolean
        $orderBy: OrderByType
      ) {
        orgDeploys: orgChanges(
          orgSlug: $orgSlug
          projectSlugs: $projectSlugs
          deploymentSlugs: $deploymentSlugs
          environmentSlugs: $environmentSlugs
          page: $page
          start: $start
          end: $end
          deploymentType: $deploymentType
          size: $size
          healthTimes: $healthTimes
          orderBy: $orderBy
          onlyFailedDeploys: $onlyFailedDeploys
          teamSlugs: $teamSlugs
        ) {
          page
          pages
          count
          hasNext
          hasPrev
          objects {
            __typename
            on
            slug
            deploymentSlug
            deploymentName
            projectName
            summary
            healthManuallySet
            magnitude
            trackingType
            deploymentTrackingType
            deploymentCollectImpact
            environment {
              name
              slug
            }
            commits {
              revision
            }
            numOfAllPullRequests
            numOfIgnoredPullRequests
            authors {
              name
            }
            tags
            deploymentType: changeSourceType
            compareUrl
            approvalStatuses
            changeLeadTime
            healthTimeBreakdown {
              healthy
              ailing
              unhealthy
              rolledBack
              incident
            }
            nextDeploy {
              on
            }
            workingHoursUsedForCltCalculation
          }
        }
      }
    `;
  
    try {
      const response = await this.client.request<DeploymentResponse>(query, request as unknown as Record<string, unknown>);
      return response;
    } catch (error) {
      throw new DoraMetricsError(
        'Failed to query Sleuth API for deployments',
        'PROVIDER_ERROR',
        error,
      );
    }
  }

  async projectMetrics(request: ProjectMetricsRequest): Promise<ProjectMetricsResponse> {
    const query = `
      query GetProjectMetrics(
        $orgSlug: ID!
        $projectSlug: ID!
        $deploymentSlugs: [ID!]!
        $environmentSlug: ID!
        $currentRangeStartDate: DateTime!
        $currentRangeEndDate: DateTime!
        $previousRangeStartDate: DateTime!
        $previousRangeEndDate: DateTime!
        $teamSlug: ID
      ) {
        project(orgSlug: $orgSlug, projectSlug: $projectSlug) {
          previousRange: metricRecap(
            environmentSlug: $environmentSlug
            deploymentSlugs: $deploymentSlugs
            start: $previousRangeStartDate
            end: $previousRangeEndDate
            teamSlug: $teamSlug
          ) {
            avgLeadTimeInSec
            numOfDeploys
            numOfDeploysPerDay
            failureRatePercent
            avgMttrDurationInSec
          }

          currentRange: metricRecap(
            environmentSlug: $environmentSlug
            deploymentSlugs: $deploymentSlugs
            start: $currentRangeStartDate
            end: $currentRangeEndDate
            teamSlug: $teamSlug
          ) {
            avgLeadTimeInSec
            numOfDeploys
            numOfDeploysPerDay
            failureRatePercent
            avgMttrDurationInSec
          }
        }
      }
    `;

    const variables = {
      orgSlug: request.orgSlug,
      projectSlug: request.projectSlug,
      environmentSlug: request.environment,
      deploymentSlugs: ['application'],
      currentRangeStartDate: request.currentRangeStart,
      currentRangeEndDate: request.currentRangeEnd,
      previousRangeStartDate: request.previousRangeStart,
      previousRangeEndDate: request.previousRangeEnd,
      teamSlug: request.teamSlug,
     };

    try {
      const response = await this.client.request<ProjectMetricsResponse>(query, variables);
      return response;
    } catch (error) {
      throw new DoraMetricsError(
        'Failed to query Sleuth API',
        'PROVIDER_ERROR',
        error,
      );
    }
  }
} 