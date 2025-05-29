// Constants
const DAYS_IN_WEEK = 7;
const DAYS_IN_MONTH = 28;
const SECONDS_IN_HOUR = 3600;
const SECONDS_IN_DAY = 86400;
const MAX_DISPLAY_VALUE = 500;

// const PERFORMANCE_THRESHOLDS = {
//   FAILURE_RATE: {
//     ELITE: 5,
//     HIGH: 10,
//     MEDIUM: 15,
//   },
//   FREQUENCY: {
//     ELITE: 1,
//     HIGH: 1 / DAYS_IN_WEEK,
//     MEDIUM: 1 / DAYS_IN_MONTH,
//   },
// } as const;

// Types
export interface IMetricRange {
  avgLeadTimeInSec: number;
  avgMttrDurationInSec: number;
  failureRatePercent: number;
  numOfDeploys: number;
  numOfDeploysPerDay: number;
}

export interface IMetric {
  name: string;
  currentRange: IMetricRange;
  previousRange: IMetricRange;
}

export interface ITeamMetricResponse {
  team: IMetric;
}

export interface IProjectMetricResponse {
  project: {
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
  };
}

export interface IProjectMetricInsights {
  project: {
    insights: IInsight[];
  };
}

export interface IInsight {
  message: string;
  icon: string;
}

// Enums
export enum Performance {
  elite = 'Elite',
  high = 'High',
  medium = 'Medium',
  low = 'Low',
}

export enum MetricType {
  LeadTime = 'LeadTime',
  Frequency = 'Frequency',
  Mttr = 'Mttr',
  FailureRate = 'FailureRate',
}

// Utility Functions
export const secondsToDays = (seconds: number): number => 
  seconds / SECONDS_IN_DAY;

export const secondsToHours = (seconds: number): number => 
  seconds / SECONDS_IN_HOUR;

export const calculateTrendChange = (current: number, previous: number): number => 
  ((current - previous) / previous) * 100;

export const toMaxLimit = (value: number, limit = MAX_DISPLAY_VALUE): string | number => 
  value > limit ? `${limit}+` : Math.round(Math.abs(value));

// Performance Calculation Functions
export const getTrend = (metricType: MetricType, current: number, previous: number): 'up' | 'down' | 'stable' => {
    const change = calculateTrendChange(current, previous);
    if (Math.abs(change) < 5) return 'stable';
    
    const isImprovement = metricType === MetricType.Frequency ? change > 0 : change < 0;
    return isImprovement ? 'up' : 'down';
};

export const getLeadTimePerformance = (leadTime: number): Performance => {
  const leadTimeInDays = secondsToDays(leadTime);

  if (leadTimeInDays < 1) return Performance.elite;
  if (leadTimeInDays <= DAYS_IN_WEEK) return Performance.high;
  if (leadTimeInDays <= DAYS_IN_MONTH) return Performance.medium;
  return Performance.low;
};

export const getFrequencyPerformance = (frequency: number): Performance => {
  if (frequency > 1) return Performance.elite;
  if (frequency > 1 / DAYS_IN_WEEK) return Performance.high;
  if (frequency > 1 / DAYS_IN_MONTH) return Performance.medium;
  return Performance.low;
};

export const getMttrPerformance = (mttr: number): Performance => {
  const mttrHours = secondsToHours(mttr);
  const mttrDays = secondsToDays(mttr);

  if (mttrHours < 1) return Performance.elite;
  if (mttrDays < 1) return Performance.high;
  if (mttrDays < DAYS_IN_WEEK) return Performance.medium;
  return Performance.low;
};

export const getFailureRatePerformance = (failureRate: number): Performance => {
  if (failureRate <= 5) return Performance.elite;
  if (failureRate <= 10) return Performance.high;
  if (failureRate <= 15) return Performance.medium;
  return Performance.low;
};

// Performance Description Maps
export const getPerformanceDescription = (metricType: MetricType): Record<Performance, string> => ({
  [MetricType.LeadTime]: {
    [Performance.elite]: 'Less than one day',
    [Performance.high]: 'Between one day and one week',
    [Performance.medium]: 'Between one week and one month',
    [Performance.low]: 'More than one month',
  },
  [MetricType.Frequency]: {
    [Performance.elite]: 'On demand',
    [Performance.high]: 'Between once per day and once per week',
    [Performance.medium]: 'Between once per week and once per month',
    [Performance.low]: 'Less than once per month',
  },
  [MetricType.Mttr]: {
    [Performance.elite]: 'Less than one hour',
    [Performance.high]: 'Less than one day',
    [Performance.medium]: 'Between one day and one week',
    [Performance.low]: 'More than one week',
  },
  [MetricType.FailureRate]: {
    [Performance.elite]: '5%',
    [Performance.high]: '10%',
    [Performance.medium]: '15%',
    [Performance.low]: '64%',
  },
}[metricType]);

export const getMetricPerformance = (metric: MetricType, value: number): Performance => ({
  [MetricType.Frequency]: getFrequencyPerformance(value),
  [MetricType.LeadTime]: getLeadTimePerformance(value),
  [MetricType.FailureRate]: getFailureRatePerformance(value),
  [MetricType.Mttr]: getMttrPerformance(value),
}[metric]);

export interface ISoftwareMetricsService {
  getProjectMetrics(
    project: string,
    environment: string,
    deployment: string,
    dateRange: string
  ): any;
}
  