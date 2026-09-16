/**
 * Hook for fetching metrics for a single team.
 * 
 * This hook could be used to optimize the Team Dashboard when we need single team data
 * instead of fetching all teams' data and filtering client-side. Currently, the dashboard
 * uses useAllTeamsMetrics which fetches all teams at once for better performance when
 * switching between teams, but this hook could be used for:
 * - Initial load optimization when a specific team is pre-selected
 * - Lazy loading individual team data
 * - Reducing initial payload size
 */
import { useState, useEffect, useCallback } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { doraBackendApiRef } from '../../../../api/DORABackendClient';
import { ApiInsight } from '../../common/types/api';
import { MetricData, TimeRange } from '../../common/types/metrics';
import { processMetricsResponse } from '../../common/utils/processors';
import { useDoraConfig } from '../../common/utils/config';

export function useTeamMetrics(teamSlug: string | null) {
  const doraApi = useApi(doraBackendApiRef);
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [insights, setInsights] = useState<ApiInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('last28days');

  // Get configuration from Backstage config API
  const { environment, codeDeploymentSlug } = useDoraConfig();



  const fetchMetrics = useCallback(async (timeRange: TimeRange) => {
    if (!teamSlug) {
      setMetrics([]);
      setInsights([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const result = await doraApi.getBatchTeamDORAMetrics(
        [teamSlug],
        environment,
        codeDeploymentSlug,
        timeRange,
      ) as any;

      const team = result?.teams?.[0];
      if (!team) {
        throw new Error('No team metrics data available');
      }

      const metricsData = processMetricsResponse(team, false);

      setMetrics(metricsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch team metrics');
    } finally {
      setLoading(false);
    }
  }, [doraApi, teamSlug, environment, codeDeploymentSlug]);

  // No team-level insights endpoint exists on DORABackendClient (only
  // project-level insights are available), so this stays empty.
  const fetchInsights = useCallback(async (_timeRange: TimeRange) => {
    setInsights([]);
  }, []);

  useEffect(() => {
    fetchMetrics(selectedTimeRange);
    fetchInsights(selectedTimeRange);
  }, [fetchMetrics, fetchInsights, selectedTimeRange]);

  return {
    metrics,
    insights,
    loading,
    error,
    selectedTimeRange,
    setSelectedTimeRange,
  };
} 