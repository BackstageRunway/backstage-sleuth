import { ApolloClient, InMemoryCache, HttpLink, gql, NormalizedCacheObject } from '@apollo/client/core';
import { BatchHttpLink } from '@apollo/client/link/batch-http';
import fetch from 'cross-fetch';
import { DoraMetricsError } from '../../domain/models/DoraMetrics';
import { ProjectMetricsRequest, ProjectMetricsResponse, ProjectInsightsResponse, TeamMetricsRequest } from '../../domain/models/SleuthBatchTypes';

const DEFAULT_CACHE_TTL_SECONDS = 300;

// Sleuth's own message (e.g. PERMISSION_DENIED) sits in the Apollo error; pull it out so it can be logged and shown
const reasonOf = (error: any): string => {
  const graphQLMessages = (error?.graphQLErrors ?? []).map((e: any) => e.message).filter(Boolean);
  if (graphQLMessages.length > 0) return graphQLMessages.join('; ');
  const network = error?.networkError;
  if (network) {
    const bodyErrors = (network.result?.errors ?? []).map((e: any) => e.message).filter(Boolean);
    if (bodyErrors.length > 0) return bodyErrors.join('; ');
    return network.statusCode ? `HTTP ${network.statusCode} ${network.message}` : network.message;
  }
  return error instanceof Error ? error.message : String(error);
};

const sleuthError = (message: string, error: unknown) =>
  new DoraMetricsError(`${message}: ${reasonOf(error)}`, 'PROVIDER_ERROR', error);

export class SleuthClient {
  private readonly client: ApolloClient<NormalizedCacheObject>;
  private readonly batchClient: ApolloClient<NormalizedCacheObject>;
  private readonly organizationId: string;
  private readonly cacheTtlMs: number;
  private cacheClearedAt = Date.now();
   
  constructor(apiKey: string, apiUrl: string, organizationId: string, cacheTtlSeconds: number = DEFAULT_CACHE_TTL_SECONDS) {
    this.organizationId = organizationId;
    this.cacheTtlMs = cacheTtlSeconds * 1000;
    this.client = new ApolloClient({
      link: new HttpLink({
        uri: `${apiUrl}/graphql`,
        fetch,
        headers: {
          Authorization: `apikey ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }),
      cache: new InMemoryCache(),
    });
    
    this.batchClient = new ApolloClient({
      link: new BatchHttpLink({
        uri: `${apiUrl}/graphql-batch`,
        fetch,
        headers: {
          Authorization: `apikey ${apiKey}`,
          'Content-Type': 'application/json',
        },                          

        batchMax: 5,
        batchInterval: 10,
      }),
      cache: new InMemoryCache(),
    });
  }


  // Results are shared between users but must not outlive the TTL, or new deployments never show up
  private async expireCache(): Promise<void> {
    if (Date.now() - this.cacheClearedAt < this.cacheTtlMs) return;
    this.cacheClearedAt = Date.now();
    await Promise.all([this.client.clearStore(), this.batchClient.clearStore()]);
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

    // Only include deploymentSlugs if deploymentSlug is provided and not empty
    const deploymentSlugs = request.deploymentSlug && request.deploymentSlug.trim() !== '' 
      ? [request.deploymentSlug] 
      : [];

    const variables = {
      orgSlug: this.organizationId,
      projectSlug: request.projectSlug,
      environmentSlug: request.environment,
      deploymentSlugs,
      currentRangeStartDate: request.currentRangeStart,
      currentRangeEndDate: request.currentRangeEnd,
      previousRangeStartDate: request.previousRangeStart,
      previousRangeEndDate: request.previousRangeEnd,
     };

    try {
      await this.expireCache();
      const result = await this.client.query({
        query: gql`${query}`,
        variables,
      });
      return result.data as ProjectMetricsResponse;
    } catch (error) {
      throw sleuthError('Failed to query Sleuth API', error);
    }
  }

   async projectMetricsInsights(request: ProjectMetricsRequest): Promise<ProjectInsightsResponse> {

   const query = `query GetInsights(
    $orgSlug: ID!, 
    $projectSlug: ID!, 
    $environmentSlug: ID!,
    $deploymentSlugs: [ID!]!, 
    $teamSlug: ID, 
    $startDate: DateTime!, 
    $endDate: DateTime!) 
    {
         project(orgSlug: $orgSlug, projectSlug: $projectSlug)
         {
            insights(
              environmentSlug: $environmentSlug
              deploymentSlugs: $deploymentSlugs
              start: $startDate
              end: $endDate
              teamSlug: $teamSlug
            ) {
              __typename
              ... on MetricOffsetFromAverageInsightType {
                insightMetricType
                offsetPercentage
                message
                icon
                isPositive
                insightLink
              }
            }
          }
        }`;


    // Only include deploymentSlugs if deploymentSlug is provided and not empty
    const deploymentSlugs = request.deploymentSlug && request.deploymentSlug.trim() !== '' 
      ? [request.deploymentSlug] 
      : [];

    const variables = {
      orgSlug: this.organizationId,
      projectSlug: request.projectSlug,
      environmentSlug: request.environment,
      deploymentSlugs,
      startDate: request.currentRangeStart,
      endDate: request.currentRangeEnd,
     };

        try {
          await this.expireCache();
            const result = await this.client.query({
              query: gql`${query}`,
              variables,
            });
            return result.data as ProjectInsightsResponse;
        } catch (error) {
            throw sleuthError('Failed to query Sleuth API for insights', error);
        }
    }

    async getTrendMetrics(
      start: string,
      end: string,
  ): Promise<any> {
      const trendQuery = `
          query GetTrendMetrics($orgSlug: ID!, $projectSlugs: [ID!], $labelSlugs: [ID!], $teamSlugs: [ID!], $environmentName: String, $start: DateTime!, $end: DateTime!) {
            organization(orgSlug: $orgSlug) {
              metricsRecapWithQuarters(
                start: $start
                end: $end
                filters: {projectSlugs: $projectSlugs, labelSlugs: $labelSlugs, environmentName: $environmentName, teamSlugs: $teamSlugs}
              ) {
                totalRecap {
                  numOfDeploys
                  numOfDeploysPerDay
                  avgLeadTimeInSec
                  failureRatePercent
                  avgMttrDurationInSec
                }
                quarters {
                  startIncl       
                  endNotIncl
                  numOfDeploysPerDay
                  avgLeadTimeInSec
                  failureRatePercent
                  avgMttrDurationInSec
                }
              }
            }
          }
      `;

             const variables = {
           orgSlug : this.organizationId,
           start,
           end,
       };


      try {
        await this.expireCache();
           const result = await this.batchClient.query({
            query: gql`${trendQuery}`,
            variables,
          });
          return result.data;
      } catch (error) {
          throw sleuthError('Failed to query Sleuth API for trend metrics', error);
      }
  }


  // async teamMetrics(request: TeamMetricsRequest): Promise<TeamMetricsResponse> {
  //   const query = `
  //     query GetTeamMetrics(
  //       $orgSlug: ID!
  //       $teamSlug: ID!
  //       $previousRangeStart: DateTime!
  //       $previousRangeEnd: DateTime!
  //       $currentRangeStart: DateTime!
  //       $currentRangeEnd: DateTime!
  //     ) {
  //       team(orgSlug: $orgSlug, teamSlug: $teamSlug) {
  //         name
  //         currentRange: metricRecap(
  //           start: $currentRangeStart
  //           end: $currentRangeEnd
  //         ) {
  //           avgLeadTimeInSec
  //           numOfDeploys
  //           numOfDeploysPerDay
  //           failureRatePercent
  //           avgMttrDurationInSec
  //         }
  //         previousRange: metricRecap(
  //           start: $previousRangeStart
  //           end: $previousRangeEnd
  //         ) {
  //           avgLeadTimeInSec
  //           numOfDeploys
  //           numOfDeploysPerDay
  //           failureRatePercent
  //           avgMttrDurationInSec
  //         }
  //       }
  //     }
  //   `;

  //   const variables = {
  //     orgSlug: this.organizationId,
  //     teamSlug: request.teamSlug,
  //     currentRangeStart: request.currentRangeStart,
  //     currentRangeEnd: request.currentRangeEnd,
  //     previousRangeStart: request.previousRangeStart,
  //     previousRangeEnd: request.previousRangeEnd,
  //    };

  //   try {
  //     const result = await this.batchClient.query({
  //       query: gql`${query}`,
  //       variables,
  //     });
      
  //     // Return the team metrics response
  //     return result.data as TeamMetricsResponse;
  //   } catch (error) {
  //     throw new DoraMetricsError(
  //       'Failed to query Sleuth API for team metrics',
  //       'PROVIDER_ERROR',
  //       error,
  //     );
  //   }
  // }

  // async teamMetricsInsights(request: TeamMetricsInsightsRequest): Promise<ProjectInsightsResponse> {
  //   const query = `
  //     query GetTeamMetricsInsights(
  //       $orgSlug: ID!
  //       $projectSlug: ID!
  //       $deploymentSlugs: [ID!]!
  //       $environmentSlug: ID!
  //       $startDate: DateTime!
  //       $endDate: DateTime!
  //       $teamSlug: ID
  //     ) {
  //       project(orgSlug: $orgSlug, projectSlug: $projectSlug) {
  //         insights(
  //           environmentSlug: $environmentSlug
  //           deploymentSlugs: $deploymentSlugs
  //           start: $startDate
  //           end: $endDate
  //           teamSlug: $teamSlug
  //         ) {
  //           __typename
  //           ... on MetricOffsetFromAverageInsightType {
  //             insightMetricType
  //             offsetPercentage
  //             message
  //             icon
  //             isPositive
  //             insightLink
  //           }
  //         }
  //       }
  //     }
  //   `;

  //   // Only include deploymentSlugs if deploymentSlug is provided and not empty
  //   const deploymentSlugs = request.deploymentSlug && request.deploymentSlug.trim() !== '' 
  //     ? [request.deploymentSlug] 
  //     : [];

  //   const variables = {
  //     orgSlug: this.organizationId,
  //     teamSlug: request.teamSlug,
  //     environmentSlug: request.environment,
  //     deploymentSlugs,
  //     startDate: request.currentRangeStart,
  //     endDate: request.currentRangeEnd,
  //    };

  //   try {
  //     const result = await this.client.query({
  //       query: gql`${query}`,
  //       variables,
  //     });
  //     return result.data as ProjectInsightsResponse;
  //   } catch (error) {
  //     throw new DoraMetricsError(
  //       'Failed to query Sleuth API for team metrics insights',
  //       'PROVIDER_ERROR',
  //       error,
  //     );
  //   }
  // }

  async batchTeamMetrics(requests: TeamMetricsRequest[]): Promise<{ teams: any[] }> {
    // Use the existing teamMetrics query from the single team method
    const TEAM_METRICS_QUERY = `
      query GetTeamMetrics(
        $orgSlug: ID!
        $teamSlug: ID!
        $environment: String
        $previousRangeStart: DateTime!
        $previousRangeEnd: DateTime!
        $currentRangeStart: DateTime!
        $currentRangeEnd: DateTime!
      ) {
        team(orgSlug: $orgSlug, teamSlug: $teamSlug) {
          name
          currentRange: metricRecap(
            start: $currentRangeStart
            end: $currentRangeEnd
            filters: {environmentName: $environment}
          ) {
            avgLeadTimeInSec
            numOfDeploys
            numOfDeploysPerDay
            failureRatePercent
            avgMttrDurationInSec
          }
          previousRange: metricRecap(
            start: $previousRangeStart
            end: $previousRangeEnd
            filters: {environmentName: $environment}
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

    // Create batch queries using TeamMetricsRequest array
          const batchQueries = requests.map(request => ({
        query: TEAM_METRICS_QUERY,
        variables: {
          orgSlug: this.organizationId,
          teamSlug: request.teamSlug,
          // without an environment Sleuth returns zero failure rate and MTTR for a team
          environment: request.environment,
          currentRangeStart: request.currentRangeStart,
          currentRangeEnd: request.currentRangeEnd,
          previousRangeStart: request.previousRangeStart,
          previousRangeEnd: request.previousRangeEnd,
        }
      }));

    try {
      await this.expireCache();
      const failures: unknown[] = [];
      // Send each team query individually - BatchHttpLink will automatically batch them
      const teamPromises = batchQueries.map(async (batchQuery) => {
        try {
          const result = await this.batchClient.query({
            query: gql`${batchQuery.query}`,
            variables: batchQuery.variables
          });
          return result.data.team;
        } catch (error) {
          failures.push(error);
          return null;
        }
      });

      // Wait for all queries to complete
      const teamResults = await Promise.all(teamPromises);
      
      // One team failing should not hide the others, but if every request failed the cause must surface
      if (failures.length === batchQueries.length && failures.length > 0) {
        throw failures[0];
      }

      // Filter out failed requests and teams Sleuth does not know
      const teams = teamResults.filter((team: any) => team !== null && team !== undefined);

      return { teams };
    } catch (error) {
      throw sleuthError('Failed to query Sleuth API for batch team metrics', error);
    }
  }
}


