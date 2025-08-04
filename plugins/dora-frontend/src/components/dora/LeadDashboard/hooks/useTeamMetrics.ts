import { useState, useEffect, useCallback } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { doraBackendApiRef } from '../../../../api/DORABackendClient';
import { ApiInsight, MetricData } from '../../shared/components/types';
import { MetricType, getMetricPerformance, getTrend } from '../../../../DORAMetricModel';

export type TimeRange = 'last7days' | 'last14days' | 'last28days' | 'last90days';

export function useTeamMetrics(teamSlug: string | null) {
  const doraApi = useApi(doraBackendApiRef);
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [insights, setInsights] = useState<ApiInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('last28days');

  // Default configuration for team metrics
  const orgId = 'sleuth';
  const environment = 'production';
  const deployment = 'application';

  const calculateTrendChange = (current: number, previous: number): number => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

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
        orgId,
        teamSlug,
        environment,
        deployment,
        timeRange,
      ) as any;

      if (!result || !result.team) {
        throw new Error('No team metrics data available');
      }

      const team = result.team;
      const metricsData: MetricData[] = [
        {
          metricName: MetricType.Frequency,
          value: getMetricPerformance(MetricType.Frequency, team.currentRange.numOfDeploysPerDay),
          rawValue: team.currentRange.numOfDeploysPerDay,
          previousValue: getMetricPerformance(MetricType.Frequency, team.previousRange.numOfDeploysPerDay),
          percentageChange: calculateTrendChange(
            team.currentRange.numOfDeploysPerDay,
            team.previousRange.numOfDeploysPerDay
          ),
          trend: getTrend(
            MetricType.Frequency,
            team.currentRange.numOfDeploysPerDay,
            team.previousRange.numOfDeploysPerDay
          ),
        },
        {
          metricName: MetricType.LeadTime,
          value: getMetricPerformance(MetricType.LeadTime, team.currentRange.avgLeadTimeInSec),
          rawValue: team.currentRange.avgLeadTimeInSec,
          previousValue: getMetricPerformance(MetricType.LeadTime, team.previousRange.avgLeadTimeInSec),
          percentageChange: calculateTrendChange(
            team.currentRange.avgLeadTimeInSec,
            team.previousRange.avgLeadTimeInSec
          ),
          trend: getTrend(
            MetricType.LeadTime,
            team.currentRange.avgLeadTimeInSec,
            team.previousRange.avgLeadTimeInSec
          ),
        },
        {
          metricName: MetricType.FailureRate,
          value: getMetricPerformance(MetricType.FailureRate, team.currentRange.failureRatePercent),
          rawValue: team.currentRange.failureRatePercent,
          previousValue: getMetricPerformance(MetricType.FailureRate, team.previousRange.failureRatePercent),
          percentageChange: calculateTrendChange(
            team.currentRange.failureRatePercent,
            team.previousRange.failureRatePercent
          ),
          trend: getTrend(
            MetricType.FailureRate,
            team.currentRange.failureRatePercent,
            team.previousRange.failureRatePercent
          ),
        },
        {
          metricName: MetricType.Mttr,
          value: getMetricPerformance(MetricType.Mttr, team.currentRange.avgMttrDurationInSec),
          rawValue: team.currentRange.avgMttrDurationInSec,
          previousValue: getMetricPerformance(MetricType.Mttr, team.previousRange.avgMttrDurationInSec),
          percentageChange: calculateTrendChange(
            team.currentRange.avgMttrDurationInSec,
            team.previousRange.avgMttrDurationInSec
          ),
          trend: getTrend(
            MetricType.Mttr,
            team.currentRange.avgMttrDurationInSec,
            team.previousRange.avgMttrDurationInSec
          ),
        },
      ];

      setMetrics(metricsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch team metrics');
    } finally {
      setLoading(false);
    }
  }, [doraApi, teamSlug, orgId, environment, deployment]);

  const fetchInsights = useCallback(async (timeRange: TimeRange) => {
    if (!teamSlug) {
      setInsights([]);
      return;
    }

    try {
      const result = await doraApi.getTeamDORAMetricsInsights(
        orgId,
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
  }, [doraApi, teamSlug, orgId, environment, deployment]);

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