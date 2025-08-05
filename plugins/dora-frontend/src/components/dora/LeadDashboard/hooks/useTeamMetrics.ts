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
  const { environment, deployment } = useDoraConfig();



  const fetchMetrics = useCallback(async (timeRange: TimeRange) => {
    if (!teamSlug) {
      setMetrics([]);
      setInsights([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const result = await doraApi.getTeamDORAMetrics(
        teamSlug,
        environment,
        deployment,
        timeRange,
      ) as any;

      if (!result || !result.team) {
        throw new Error('No team metrics data available');
      }

      const team = result.team;
      const metricsData = processMetricsResponse(team, false);

      setMetrics(metricsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch team metrics');
    } finally {
      setLoading(false);
    }
  }, [doraApi, teamSlug, environment, deployment]);

  const fetchInsights = useCallback(async (timeRange: TimeRange) => {
    if (!teamSlug) {
      setInsights([]);
      return;
    }

    try {
      const result = await doraApi.getTeamDORAMetricsInsights(
        teamSlug,
        environment,
        deployment,
        timeRange,
      );

      if (!result || !result.insights) {
        setInsights([]);
        return;
      }

      setInsights(result.insights);
    } catch (err) {
      console.error('Failed to fetch team insights:', err);
      setInsights([]);
    }
  }, [doraApi, teamSlug, environment, deployment]);

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