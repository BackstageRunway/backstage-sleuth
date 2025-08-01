import { useState, useEffect, useCallback } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { doraBackendApiRef } from '../../../api/DORABackendClient';
import { ApiInsight, MetricData, ProjectMetricsResponse } from '../summary/types';
import { MetricType, getMetricPerformance, getTrend } from '../../../DORAMetricModel';

export type TimeRange = 'last7days' | 'last14days' | 'last28days' | 'last90days';

export function useDoraMetrics(entity: any) {
  const doraApi = useApi(doraBackendApiRef);
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [insights, setInsights] = useState<ApiInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('last28days');

  // Get config from entity annotations or use defaults
  //const projectId = entity.metadata.annotations?.['sleuth.io/project-id'];
  const orgId = entity.metadata.annotations?.['sleuth.io/org-id'] || 'sleuth';
  const projectSlug = entity.metadata.annotations?.['sleuth.io/project-slug'] || 'sleuth';
  const environment = entity.metadata.annotations?.['sleuth.io/environment'] || 'production';
  const deployment = entity.metadata.annotations?.['sleuth.io/deployment'] || 'application';

  const calculateTrendChange = (current: number, previous: number): number => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const fetchMetrics = useCallback(async (timeRange: TimeRange) => {
    setLoading(true);
    try {
      const result = await doraApi.getProjectDORAMetrics(
        orgId,
        projectSlug,
        environment,
        deployment,
        timeRange,
      ) as ProjectMetricsResponse;

      if (!result || !result.project) {
        throw new Error('No metrics data available');
      }

      const project = result.project;
      const metricsData: MetricData[] = [
        {
          metricName: MetricType.Frequency,
          value: getMetricPerformance(MetricType.Frequency, project.currentRange.numOfDeploysPerDay),
          rawValue: project.currentRange.numOfDeploysPerDay,
          previousValue: getMetricPerformance(MetricType.Frequency, project.previousRange.numOfDeploysPerDay),
          percentageChange: calculateTrendChange(
            project.currentRange.numOfDeploysPerDay,
            project.previousRange.numOfDeploysPerDay
          ),
          trend: getTrend(
            MetricType.Frequency,
            project.currentRange.numOfDeploysPerDay,
            project.previousRange.numOfDeploysPerDay
          ),
        },
        {
          metricName: MetricType.LeadTime,
          value: getMetricPerformance(MetricType.LeadTime, project.currentRange.avgLeadTimeInSec),
          rawValue: project.currentRange.avgLeadTimeInSec,
          previousValue: getMetricPerformance(MetricType.LeadTime, project.previousRange.avgLeadTimeInSec),
          percentageChange: calculateTrendChange(
            project.currentRange.avgLeadTimeInSec,
            project.previousRange.avgLeadTimeInSec
          ),
          trend: getTrend(
            MetricType.LeadTime,
            project.currentRange.avgLeadTimeInSec,
            project.previousRange.avgLeadTimeInSec
          ),
        },
        {
          metricName: MetricType.FailureRate,
          value: getMetricPerformance(MetricType.FailureRate, project.currentRange.failureRatePercent),
          rawValue: project.currentRange.failureRatePercent,
          previousValue: getMetricPerformance(MetricType.FailureRate, project.previousRange.failureRatePercent),
          percentageChange: calculateTrendChange(
            project.currentRange.failureRatePercent,
            project.previousRange.failureRatePercent
          ),
          trend: getTrend(
            MetricType.FailureRate,
            project.currentRange.failureRatePercent,
            project.previousRange.failureRatePercent
          ),
        },
        {
          metricName: MetricType.Mttr,
          value: getMetricPerformance(MetricType.Mttr, project.currentRange.avgMttrDurationInSec),
          rawValue: project.currentRange.avgMttrDurationInSec,
          previousValue: getMetricPerformance(MetricType.Mttr, project.previousRange.avgMttrDurationInSec),
          percentageChange: calculateTrendChange(
            project.currentRange.avgMttrDurationInSec,
            project.previousRange.avgMttrDurationInSec
          ),
          trend: getTrend(
            MetricType.Mttr,
            project.currentRange.avgMttrDurationInSec,
            project.previousRange.avgMttrDurationInSec
          ),
        },
      ];

      setMetrics(metricsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  }, [doraApi, orgId, projectSlug, environment, deployment]);

  const fetchMetricsInsights = useCallback(async (timeRange: TimeRange) => {
    setLoading(true);
    try {
      const result = await doraApi.getProjectDORAMetricsInsights(
        orgId,
        projectSlug,
        environment,
        deployment,
        timeRange,
      );

      if (!result?.project?.insights) {
        throw new Error('No insights data available');
      }

      const mappedInsights = result.project.insights
        .filter((insight: any) =>
          insight.__typename === 'MetricOffsetFromAverageInsightType' ||
          insight.__typename === 'TeamMetricLowInsightType'
        )
        .map((insight: any) => ({
          message: insight.message,
          icon: insight.icon,
          isPositive: insight.isPositive,
          metricType:
            insight.insightMetricType === 'DEPLOYING' || insight.insightMetricType === 'FREQUENCY'
              ? 'Frequency'
              : insight.insightMetricType === 'MTTR'
              ? 'Mttr'
              : insight.insightMetricType === 'FAILURE_RATE'
              ? 'FailureRate'
              : insight.insightMetricType,
        }));

      setInsights(mappedInsights);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch insights');
    } finally {
      setLoading(false);
    }
  }, [doraApi, orgId, projectSlug, environment, deployment]);

  useEffect(() => {
    fetchMetrics(selectedTimeRange);
    fetchMetricsInsights(selectedTimeRange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity, fetchMetrics, fetchMetricsInsights, selectedTimeRange]);

  return {
    metrics,
    insights,
    loading,
    error,
    selectedTimeRange,
    setSelectedTimeRange,
  };
} 