import { GraphQLClient } from 'graphql-request';
import { DoraMetricsError } from '../../domain/models/DoraMetrics';
import { BatchMetricsRequest, BatchMetricsResponse } from '../../domain/models/SleuthBatchTypes';

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

  async batchQuery(request: BatchMetricsRequest): Promise<BatchMetricsResponse> {
    const query = `
      query BatchMetrics(
        $orgSlug: String!
        $teamSlug: String!
        $currentRangeStart: String!
        $currentRangeEnd: String!
        $previousRangeStart: String!
        $previousRangeEnd: String!
      ) {
        team(orgSlug: $orgSlug, teamSlug: $teamSlug) {
          teamMetrics {
            currentRange: metricRecap(start: $currentRangeStart, end: $currentRangeEnd) {
              numOfDeploysPerDay
              avgLeadTimeInSec
              failureRatePercent
              avgMttrDurationInSec
            }
            previousRange: metricRecap(start: $previousRangeStart, end: $previousRangeEnd) {
              numOfDeploysPerDay
              avgLeadTimeInSec
              failureRatePercent
              avgMttrDurationInSec
            }
          }
          teamDeploys {
            currentRange: deployStats(start: $currentRangeStart, end: $currentRangeEnd) {
              total
              successful
              failed
            }
            previousRange: deployStats(start: $previousRangeStart, end: $previousRangeEnd) {
              total
              successful
              failed
            }
          }
          teamDeployFrequency {
            currentRange: frequency(start: $currentRangeStart, end: $currentRangeEnd) {
              frequency
            }
            previousRange: frequency(start: $previousRangeStart, end: $previousRangeEnd) {
              frequency
            }
          }
          teamLeadTime {
            currentRange: leadTime(start: $currentRangeStart, end: $currentRangeEnd) {
              avgLeadTimeInSec
            }
            previousRange: leadTime(start: $previousRangeStart, end: $previousRangeEnd) {
              avgLeadTimeInSec
            }
          }
          wipSummary {
            currentRange: summary(start: $currentRangeStart, end: $currentRangeEnd) {
              total
              inProgress
              completed
            }
            previousRange: summary(start: $previousRangeStart, end: $previousRangeEnd) {
              total
              inProgress
              completed
            }
          }
        }
      }
    `;

    const variables = {
      orgSlug: request.orgSlug,
      teamSlug: request.teamSlug,
      currentRangeStart: request.currentRangeStart,
      currentRangeEnd: request.currentRangeEnd,
      previousRangeStart: request.previousRangeStart,
      previousRangeEnd: request.previousRangeEnd,
    };

    try {
      const response = await this.client.request<BatchMetricsResponse>(query, variables);
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