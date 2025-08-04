export interface DoraMetrics {
  deploymentFrequency: number;
  leadTimeForChanges: number;
  timeToRestore: number;
  changeFailureRate: number;
  contributingTeams?: { slug: string }[];
  [key: string]: number | string | boolean | null | undefined | { slug: string }[] | undefined;
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