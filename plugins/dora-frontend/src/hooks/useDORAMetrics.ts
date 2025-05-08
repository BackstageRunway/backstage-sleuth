import { useApi } from '@backstage/core-plugin-api';
import { useAsync } from 'react-use';
import { doraBackendApiRef } from '../api/DORABackendClient';

export function useDORAMetrics(
  projectId: string,
  timeRange: { start: string; end: string },
) {
  const client = useApi(doraBackendApiRef);

  const { value, loading, error } = useAsync(
    async () => {
      return client.getMetrics(projectId, timeRange);
    },
    [client, projectId, timeRange.start, timeRange.end],
  );

  return {
    metrics: value?.metrics,
    error,
    loading,
  };
} 