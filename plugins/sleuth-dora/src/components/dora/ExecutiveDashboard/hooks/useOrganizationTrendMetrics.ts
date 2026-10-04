import { useState, useEffect, useCallback } from 'react';
import { useApi } from '@backstage/core-plugin-api';
import { doraBackendApiRef } from '../../../../api/DORABackendClient';
import { TimeRange } from '../../common/types/metrics';


export function useOrganizationTrendMetrics()
{
  const doraApi = useApi(doraBackendApiRef);
  const [data, setData] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('last28days');
  
 
  const fetchOrgTrendMetrics = useCallback(async (timeRange: TimeRange) => {
    
    setLoading(true);
    
    try {
          const result = await doraApi.getOrganizationTrendMetrics(
            timeRange
          );
          if (!result || !result.organization) {
            throw new Error('No ORG Trend metrics data available');
          }
          setData(result);
          setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch ORG Trend metrics');
    } finally {
      setLoading(false);
    }
  }, [doraApi]);

 
  useEffect(() => {
    fetchOrgTrendMetrics(selectedTimeRange);
  }, [fetchOrgTrendMetrics, selectedTimeRange]);

  return {
    data,
    loading,
    error,
    selectedTimeRange,
    setSelectedTimeRange,
  };
} 