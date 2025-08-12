import { useState, useEffect } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { doraBackendApiRef } from '../../../../api/DORABackendClient';
import { MetricType, TimeRange } from '../../common/types/metrics';
import { useDoraConfig } from '../../common/utils/config';
import { determineTrend, determineOverallTrend } from '../../common/utils/calculations';
import { formatMetricValue } from '../../common/utils/formatters';

export interface TeamMetricsData {
  name: string;
  metrics: {
    deploymentFrequency: string;
    leadTime: string;
    failureRate: string;
    mttr: string;
  };
  trend: 'up' | 'down' | 'stable';
  loading: boolean;
  error?: string;
}

export function useAllTeamsMetrics(teamSlugs: string[], timeRange: TimeRange) {
  const doraApi = useApi(doraBackendApiRef);
  const [teamsData, setTeamsData] = useState<TeamMetricsData[]>([]);
  const [overallLoading, setOverallLoading] = useState(true);
  const [overallError, setOverallError] = useState<string | null>(null);

  // Get configuration from Backstage config API
  const baseConfig = useDoraConfig();


  const transformTeamData = (teamResponse: any): TeamMetricsData => {
    const { name, currentRange, previousRange } = teamResponse;
    
    // Calculate individual metric trends
    const frequencyTrend = determineTrend(
      currentRange.numOfDeploysPerDay,
      previousRange.numOfDeploysPerDay,
      MetricType.Frequency
    );
    
    const leadTimeTrend = determineTrend(
      currentRange.avgLeadTimeInSec,
      previousRange.avgLeadTimeInSec,
      MetricType.LeadTime
    );
    
    const failureRateTrend = determineTrend(
      currentRange.failureRatePercent,
      previousRange.failureRatePercent,
      MetricType.FailureRate
    );
    
    // Determine overall trend using utility function
    const overallTrend = determineOverallTrend(frequencyTrend, leadTimeTrend, failureRateTrend);

    return {
      name,
      metrics: {
        deploymentFrequency: formatMetricValue(currentRange.numOfDeploysPerDay, MetricType.Frequency),
        leadTime: formatMetricValue(currentRange.avgLeadTimeInSec, MetricType.LeadTime),
        failureRate: formatMetricValue(currentRange.failureRatePercent, MetricType.FailureRate),
        mttr: formatMetricValue(currentRange.avgMttrDurationInSec, MetricType.Mttr),
      },
      trend: overallTrend,
      loading: false,
    };
  };

  useEffect(() => {
    const fetchAllTeamsMetrics = async () => {
      if (!teamSlugs || teamSlugs.length === 0) {
        setTeamsData([]);
        setOverallLoading(false);
        return;
      }

      setOverallLoading(true);
      setOverallError(null);

      // Initialize teams with loading state
      const initialTeamsData: TeamMetricsData[] = teamSlugs.map(slug => ({
        name: slug,
        metrics: {
          deploymentFrequency: '0/day',
          leadTime: '0h',
          failureRate: '0%',
          mttr: '0m',
        },
        trend: 'stable',
        loading: true,
      }));
      setTeamsData(initialTeamsData);

      try {
        // Make batch request for all teams
        const result = await doraApi.getBatchTeamDORAMetrics(
          teamSlugs,
          baseConfig.environment,
          baseConfig.deployment,
          timeRange,
        );

        if (!result || !result.teams) {
          throw new Error('No team metrics data available');
        }

        // Transform the response data
        const transformedTeams = result.teams.map(transformTeamData);
        setTeamsData(transformedTeams);
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch team metrics';
        setOverallError('We are facing challenges at the moment. Please come back later.');
        
        // Set error state for all teams
        const errorTeamsData: TeamMetricsData[] = teamSlugs.map(slug => ({
          name: slug,
          metrics: {
            deploymentFrequency: '0/day',
            leadTime: '0h',
            failureRate: '0%',
            mttr: '0m',
          },
          trend: 'stable',
          loading: false,
          error: errorMessage,
        }));
        setTeamsData(errorTeamsData);
      } finally {
        setOverallLoading(false);
      }
    };

    fetchAllTeamsMetrics();
  }, [teamSlugs, baseConfig.environment, baseConfig.deployment, timeRange]);

  return {
    teams: teamsData,
    loading: overallLoading,
    error: overallError,
  };
} 