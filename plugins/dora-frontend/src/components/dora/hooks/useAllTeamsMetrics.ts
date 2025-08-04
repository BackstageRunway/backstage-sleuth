import { useState, useEffect, useCallback, useMemo } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { doraBackendApiRef } from '../../../api/DORABackendClient';
import { MetricType, getMetricPerformance, getTrend } from '../../../DORAMetricModel';

export type TimeRange = 'last7days' | 'last14days' | 'last28days' | 'last90days';

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

  // Default configuration - memoized to prevent recreation
  const config = useMemo(() => ({
    orgId: 'sleuth',
    environment: 'production',
    deployment: 'application',
  }), []);

  const calculateTrendChange = (current: number, previous: number): number => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const determineTrend = (current: number, previous: number, metricType: MetricType): 'up' | 'down' | 'stable' => {
    const change = calculateTrendChange(current, previous);
    
    // For lead time and MTTR, lower is better (down trend is positive)
    if (metricType === MetricType.LeadTime || metricType === MetricType.Mttr) {
      return change <= -5 ? 'up' : change >= 5 ? 'down' : 'stable';
    }
    
    // For frequency and failure rate, higher frequency is better, lower failure rate is better
    if (metricType === MetricType.Frequency) {
      return change >= 5 ? 'up' : change <= -5 ? 'down' : 'stable';
    }
    
    if (metricType === MetricType.FailureRate) {
      return change <= -5 ? 'up' : change >= 5 ? 'down' : 'stable';
    }
    
    return 'stable';
  };

  const formatMetricValue = (value: number, metricType: MetricType): string => {
    switch (metricType) {
      case MetricType.Frequency:
        return `${value.toFixed(2)}/day`;
      case MetricType.LeadTime:
        const hours = value / 3600;
        return hours >= 1 ? `${hours.toFixed(1)}h` : `${(value / 60).toFixed(1)}m`;
      case MetricType.FailureRate:
        return `${value.toFixed(1)}%`;
      case MetricType.Mttr:
        const minutes = value / 60;
        return minutes >= 1 ? `${minutes.toFixed(1)}m` : `${value}s`;
      default:
        return value.toString();
    }
  };

  const transformTeamData = (teamResponse: any): TeamMetricsData => {
    const { name, currentRange, previousRange } = teamResponse;
    
    // Calculate overall trend based on key metrics
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
    
    // Determine overall trend (prioritize negative trends)
    let overallTrend: 'up' | 'down' | 'stable' = 'stable';
    if (failureRateTrend === 'down' || leadTimeTrend === 'down') {
      overallTrend = 'down';
    } else if (frequencyTrend === 'up') {
      overallTrend = 'up';
    }

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

  const fetchAllTeamsMetrics = useCallback(async () => {
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
        config.orgId,
        teamSlugs,
        config.environment,
        config.deployment,
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
  }, [teamSlugs, config, timeRange]);

  useEffect(() => {
    fetchAllTeamsMetrics();
  }, [fetchAllTeamsMetrics]);

  return {
    teams: teamsData,
    loading: overallLoading,
    error: overallError,
    refetch: fetchAllTeamsMetrics,
  };
} 