// plugins/dora-backend/src/domain/models/SleuthBatchTypes.ts

export type MetricType = 'metrics';

export interface BatchMetricsRequest {
  orgSlug: string;
  teamSlug: string;
  metricTypes: MetricType[];
  currentRangeStart: string;
  currentRangeEnd: string;
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

export interface BatchMetricsResponse {
  project: {
    currentRange: MetricRecap;
  };
}

export interface DeploymentRequest {
  orgSlug: string;
  teamSlugs?: string[];
  projectSlugs: string[];
  environmentSlugs: string[];
  deploymentSlugs: string[];
  start: string;
  end: string;
  page: number;
  deploymentType: string[];
  size: string[];
  healthTimes: string[];
  onlyFailedDeploys?: boolean;
  orderBy?: string | null;
}

export interface DeploymentResponse {
  orgDeploys: {
    page: number;
    pages: number;
    count: number;
    hasNext: boolean;
    hasPrev: boolean;
    objects: Array<{
      __typename: string;
      on: string;
      slug: string;
      deploymentSlug: string;
      deploymentName: string;
      projectName: string;
      summary: string;
      healthManuallySet: boolean;
      magnitude: string;
      trackingType: string;
      deploymentTrackingType: string;
      deploymentCollectImpact: boolean;
      environment: {
        name: string;
        slug: string;
      };
      commits: Array<{
        revision: string;
      }>;
      numOfAllPullRequests: number;
      numOfIgnoredPullRequests: number;
      authors: Array<{
        name: string;
      }>;
      tags: string[];
      deploymentType: string;
      compareUrl: string;
      approvalStatuses: any[];
      changeLeadTime: number;
      healthTimeBreakdown: {
        healthy: number;
        ailing: number;
        unhealthy: number;
        rolledBack: number;
        incident: number;
      };
      nextDeploy: {
        on: string;
      };
      workingHoursUsedForCltCalculation: number;
    }>;
  };
}