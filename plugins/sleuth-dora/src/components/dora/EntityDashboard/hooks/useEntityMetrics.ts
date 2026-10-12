import { useState, useEffect, useCallback } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { doraBackendApiRef } from '../../../../api/DORABackendClient';
import { ApiInsight, ProjectMetricsResponse } from '../../common/types/api';
import { MetricData } from '../../common/types/metrics';
import { TimeRange } from '../../common/types/metrics';
import { processMetricsResponse, processInsights } from '../../common/utils/processors';
import { useDoraConfig } from '../../common/utils/config';

export function useEntityMetrics(entity: any) {
  const doraApi = useApi(doraBackendApiRef);
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [insights, setInsights] = useState<ApiInsight[]>([]);
  const [hasDeployments, setHasDeployments] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('last28days');

  // Resolve configuration using entity (entity annotations → app-config → defaults)
  const { projectSlug, environment, codeDeploymentSlug } = useDoraConfig(entity);

  const fetchMetrics = useCallback(async (timeRange: TimeRange) => {
    setLoading(true);
    try {
      const result = await doraApi.getProjectDORAMetrics(
        projectSlug,
        environment,
        codeDeploymentSlug,
        timeRange,
      ) as ProjectMetricsResponse;

      if (!result || !result.project) {
        throw new Error('No metrics data available');
      }

      const project = result.project;
      // unrounded: the trend cell rounds to a whole percent, and rounding twice turns 3.496% into 4%
      const metricsData = processMetricsResponse(project, false);

      setMetrics(metricsData);
      setHasDeployments(project.currentRange.numOfDeploysPerDay > 0);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  }, [doraApi, projectSlug, environment, codeDeploymentSlug]);

  // Insights are an extra on top of the metrics: a failure here must neither hide good metrics
  // nor clear an error the metrics request raised, so it leaves the error and loading state alone
  const fetchMetricsInsights = useCallback(async (timeRange: TimeRange) => {
    try {
      const result = await doraApi.getProjectDORAMetricsInsights(
        projectSlug,
        environment,
        codeDeploymentSlug,
        timeRange,
      );

      setInsights(processInsights(result?.project?.insights ?? []));
    } catch {
      setInsights([]);
    }
  }, [doraApi, projectSlug, environment, codeDeploymentSlug]);

  useEffect(() => {
    fetchMetrics(selectedTimeRange);
    fetchMetricsInsights(selectedTimeRange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entity, fetchMetrics, fetchMetricsInsights, selectedTimeRange]);

  return {
    metrics,
    insights,
    hasDeployments,
    projectSlug,
    codeDeploymentSlug,
    loading,
    error,
    selectedTimeRange,
    setSelectedTimeRange,
  };
} 