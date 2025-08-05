import { useState, useEffect, useCallback } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { doraBackendApiRef } from '../../../../api/DORABackendClient';
import { ApiInsight, ProjectMetricsResponse } from '../../common/types/api';
import { MetricData } from '../../common/types/metrics';
import { TimeRange } from '../../common/types/metrics';
import { processMetricsResponse, processInsights } from '../../common/utils/processors';
import { useDoraConfig, getEntityConfig } from '../../common/utils/config';

export function useEntityMetrics(entity: any) {
  const doraApi = useApi(doraBackendApiRef);
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [insights, setInsights] = useState<ApiInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('last28days');

  // Get configuration from Backstage config API and entity annotations
  const baseConfig = useDoraConfig();
  const { orgId, projectSlug, environment, deployment } = getEntityConfig(entity, baseConfig);



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
      const metricsData = processMetricsResponse(project, true);

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

       const processedInsights = processInsights(result.project.insights);
       setInsights(processedInsights);
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