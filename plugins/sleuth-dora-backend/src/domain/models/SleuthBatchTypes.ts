// plugins/dora-backend/src/domain/models/SleuthBatchTypes.ts

export type MetricType = 'metrics';

export interface ProjectMetricsRequest {
  projectSlug: string;
  environment: string;
  deploymentSlug: string;
  metricTypes: MetricType[];
  currentRangeEnd: string;
  currentRangeStart: string;
  previousRangeEnd: string;
  previousRangeStart: string;
  teamSlug?: string;
}

export interface TeamMetricsRequest {
  teamSlug: string;
  environment: string;
  currentRangeEnd: string;
  currentRangeStart: string;
  previousRangeEnd: string;
  previousRangeStart: string;
}

export interface ContributingTeam {
  slug: string;
}

export interface MetricRecap {
  avgLeadTimeInSec: number;
  numOfDeploys: number;
  numOfDeploysPerDay: number;
  failureRatePercent: number;
  avgMttrDurationInSec: number;
  contributingTeams?: ContributingTeam[];
}

export interface ProjectMetricsResponse {
  project: {
    previousRange: MetricRecap;
    currentRange: MetricRecap;
  };
}

export interface TeamMetricsResponse {
  team: {
    name: string;
    previousRange: MetricRecap;
    currentRange: MetricRecap;
  };
}

export type InsightType = 'GreatTeamInsightType' | 'MetricOffsetFromAverageInsightType' | 'WorstDeployInsightType';

export interface BaseInsight {
    __typename: InsightType;
}

export interface MetricOffsetFromAverageInsight extends BaseInsight {
    __typename: 'MetricOffsetFromAverageInsightType';
    insightMetricType: 'FAILURE_RATE' | 'DEPLOYING' | 'LEAD_TIME' | 'MTTR';
    offsetPercentage: number;
    message: string;
    icon: string;
    isPositive: boolean;
    insightLink: string;
}

export interface GreatTeamInsight extends BaseInsight {
    __typename: 'GreatTeamInsightType';
}

export interface WorstDeployInsight extends BaseInsight {
    __typename: 'WorstDeployInsightType';
}

export type Insight = MetricOffsetFromAverageInsight | GreatTeamInsight | WorstDeployInsight;

export interface ProjectInsightsResponse {
    data: {
        project: {
            insights: Insight[];
        };
    };
}