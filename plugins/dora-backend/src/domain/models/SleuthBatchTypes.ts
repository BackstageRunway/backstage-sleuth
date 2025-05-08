// plugins/dora-backend/src/domain/models/SleuthBatchTypes.ts

export type MetricType = 'teamMetrics' | 'teamDeploys' | 'teamDeployFrequency' | 'teamLeadTime' | 'wipSummary';

export interface BatchMetricsRequest {
  orgSlug: string;
  teamSlug: string;
  metricTypes: MetricType[];
  currentRangeStart: string;
  currentRangeEnd: string;
  previousRangeStart: string;
  previousRangeEnd: string;
}

export interface TeamMetrics {
  currentRange: {
    numOfDeploysPerDay: number;
    avgLeadTimeInSec: number;
    failureRatePercent: number;
    avgMttrDurationInSec: number;
  };
  previousRange: {
    numOfDeploysPerDay: number;
    avgLeadTimeInSec: number;
    failureRatePercent: number;
    avgMttrDurationInSec: number;
  };
}

export interface TeamDeploys {
  currentRange: {
    total: number;
    successful: number;
    failed: number;
  };
  previousRange: {
    total: number;
    successful: number;
    failed: number;
  };
}

export interface TeamDeployFrequency {
  currentRange: {
    frequency: number;
  };
  previousRange: {
    frequency: number;
  };
}

export interface TeamLeadTime {
  currentRange: {
    avgLeadTimeInSec: number;
  };
  previousRange: {
    avgLeadTimeInSec: number;
  };
}

export interface WipSummary {
  currentRange: {
    total: number;
    inProgress: number;
    completed: number;
  };
  previousRange: {
    total: number;
    inProgress: number;
    completed: number;
  };
}

export interface BatchMetricsResponse {
  teamMetrics?: TeamMetrics;
  teamDeploys?: TeamDeploys;
  teamDeployFrequency?: TeamDeployFrequency;
  teamLeadTime?: TeamLeadTime;
  wipSummary?: WipSummary;
}