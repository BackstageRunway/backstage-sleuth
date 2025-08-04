import { ApolloClient, InMemoryCache, HttpLink, gql, NormalizedCacheObject } from '@apollo/client/core';
import { BatchHttpLink } from '@apollo/client/link/batch-http';
import fetch from 'cross-fetch';
import { DoraMetricsError } from '../../domain/models/DoraMetrics';
import { ProjectMetricsRequest, ProjectMetricsResponse, ProjectInsightsResponse, TeamMetricsRequest, TeamMetricsResponse, TeamMetricsInsightsRequest } from '../../domain/models/SleuthBatchTypes';

export class SleuthClient {
  private readonly client: ApolloClient<NormalizedCacheObject>;
  private readonly batchClient: ApolloClient<NormalizedCacheObject>;
  private readonly apiKey: string;
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.client = new ApolloClient({
      link: new HttpLink({
        uri: 'https://app.sleuth.io/graphql',
        fetch,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Cookie: '__Host-sessionid=f7xr8j59258nzt0zgy3a9atjhx3aypc2',	
        },
      }),
      cache: new InMemoryCache(),
      //defaultOptions: { query: { fetchPolicy: 'no-cache' } },
    });
    
    this.batchClient = new ApolloClient({
      link: new BatchHttpLink({
        uri: 'https://app.sleuth.io/graphql-batch',
        fetch,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Cookie: '__Host-sessionid=f7xr8j59258nzt0zgy3a9atjhx3aypc2',	
        },
        batchMax: 5,
        batchInterval: 10,
      }),
      cache: new InMemoryCache(),
      //defaultOptions: { query: { fetchPolicy: 'no-cache' } },
    });
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
      deploymentSlugs: [],
      currentRangeStartDate: request.currentRangeStart,
      currentRangeEndDate: request.currentRangeEnd,
      previousRangeStartDate: request.previousRangeStart,
      previousRangeEndDate: request.previousRangeEnd,
     };

    try {
      const result = await this.client.query({
        query: gql`${query}`,
        variables,
      });
      return result.data as ProjectMetricsResponse;
    } catch (error) {
      throw new DoraMetricsError(
        'Failed to query Sleuth API',
        'PROVIDER_ERROR',
        error,
      );
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


    const variables = {
      orgSlug: request.orgSlug,
      projectSlug: request.projectSlug,
      environmentSlug: request.environment,
      deploymentSlugs: [],
      startDate: request.currentRangeStart,
      endDate: request.currentRangeEnd,
     };

        try {
            const result = await this.client.query({
              query: gql`${query}`,
              variables,
            });
            return result.data as ProjectInsightsResponse;
        } catch (error) {
            throw new DoraMetricsError(
                'Failed to query Sleuth API for insights',
                'PROVIDER_ERROR',
                error,
            );
        }
    }

    async getTrendMetrics(
      orgId: string,
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
          orgSlug : orgId,
          start,
          end,
      };


      try {
           const result = await this.batchClient.query({
            query: gql`${trendQuery}`,
            variables,
          });
          return result.data;
      } catch (error) {
          throw new DoraMetricsError(
              'Failed to query Sleuth API for trend metrics',
              'PROVIDER_ERROR',
              error,
          );
      }
  }


  async teamMetrics(request: TeamMetricsRequest): Promise<TeamMetricsResponse> {
    const query = `
      query GetTeamMetrics(
        $orgSlug: ID!
        $teamSlug: ID!
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
      teamSlug: request.teamSlug,
      currentRangeStart: request.currentRangeStart,
      currentRangeEnd: request.currentRangeEnd,
      previousRangeStart: request.previousRangeStart,
      previousRangeEnd: request.previousRangeEnd,
     };

    try {
      const result = await this.batchClient.query({
        query: gql`${query}`,
        variables,
      });
      
      // Return the team metrics response
      return result.data as TeamMetricsResponse;
    } catch (error) {
      throw new DoraMetricsError(
        'Failed to query Sleuth API for team metrics',
        'PROVIDER_ERROR',
        error,
      );
    }
  }

  async teamMetricsInsights(request: TeamMetricsInsightsRequest): Promise<ProjectInsightsResponse> {
    const query = `
      query GetTeamMetricsInsights(
        $orgSlug: ID!
        $projectSlug: ID!
        $deploymentSlugs: [ID!]!
        $environmentSlug: ID!
        $startDate: DateTime!
        $endDate: DateTime!
        $teamSlug: ID
      ) {
        project(orgSlug: $orgSlug, projectSlug: $projectSlug) {
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
      }
    `;

    const variables = {
      orgSlug: request.orgSlug,
      teamSlug: request.teamSlug,
      environmentSlug: request.environment,
      deploymentSlugs: [],
      startDate: request.currentRangeStart,
      endDate: request.currentRangeEnd,
     };

    try {
      const result = await this.client.query({
        query: gql`${query}`,
        variables,
      });
      return result.data as ProjectInsightsResponse;
    } catch (error) {
      throw new DoraMetricsError(
        'Failed to query Sleuth API for team metrics insights',
        'PROVIDER_ERROR',
        error,
      );
    }
  }

  async batchTeamMetrics(requests: TeamMetricsRequest[]): Promise<{ teams: any[] }> {
    // Use the existing teamMetrics query from the single team method
    const TEAM_METRICS_QUERY = `
      query GetTeamMetrics(
        $orgSlug: ID!
        $teamSlug: ID!
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
        orgSlug: request.orgSlug,
        teamSlug: request.teamSlug,
        currentRangeStart: request.currentRangeStart,
        currentRangeEnd: request.currentRangeEnd,
        previousRangeStart: request.previousRangeStart,
        previousRangeEnd: request.previousRangeEnd,
      }
    }));

    try {
      // Send each team query individually - BatchHttpLink will automatically batch them
      const teamPromises = batchQueries.map(async (batchQuery) => {
        try {
          const result = await this.batchClient.query({
            query: gql`${batchQuery.query}`,
            variables: batchQuery.variables
          });
          return result.data.team;
        } catch (error) {
          console.error(`Failed to fetch metrics for team: ${batchQuery.variables.teamSlug}`, error);
          return null;
        }
      });

      // Wait for all queries to complete
      const teamResults = await Promise.all(teamPromises);
      
      // Filter out any failed requests
      const teams = teamResults.filter((team: any) => team !== null && team !== undefined);

      return { teams };
    } catch (error) {
      throw new DoraMetricsError(
        'Failed to query Sleuth API for batch team metrics',
        'PROVIDER_ERROR',
        error,
      );
    }
  }
}


