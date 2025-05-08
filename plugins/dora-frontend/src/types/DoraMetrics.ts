export interface DoraMetrics {
  deploymentFrequency: number;
  leadTimeForChanges: number;
  timeToRestore: number;
  changeFailureRate: number;
  [key: string]: number | string | boolean | null | undefined;
}

export interface DoraMetricsResult {
  metrics: DoraMetrics;
  projectId: string;
  timeRange: {
    start: string;
    end: string;
    [key: string]: string | number | boolean | null | undefined;
  };
  [key: string]: any;
} 