/**
 * Configuration-related types for DORA plugin
 */

import { TimeRange } from './metrics';

/**
 * Configuration for DORA metrics API calls
 */
export interface DoraConfig {
  environment?: string;
  defaultProjectSlug?: string;
  codeDeploymentSlug?: string;
  defaultTimeRange?: TimeRange;
}

/**
 * Backstage entity interface for configuration
 */
export interface BackstageEntity {
  metadata: {
    annotations?: Record<string, string>;
    name: string;
    namespace?: string;
  };
  spec?: Record<string, any>;
  kind: string;
  apiVersion: string;
}

/**
 * Configuration keys for DORA plugin
 */
export const DORA_CONFIG_KEYS = {
  ENVIRONMENT: 'dora.sleuth.environment',
  DEFAULT_PROJECT_SLUG: 'dora.sleuth.defaultProjectSlug',
  DEFAULT_TIME_RANGE: 'dora.sleuth.defaultTimeRange',
} as const;

/**
 * Entity annotation keys for DORA configuration
 */
export const ENTITY_ANNOTATION_KEYS = {
  PROJECT_SLUG: 'sleuth.io/project-slug',
  ENVIRONMENT: 'sleuth.io/environment',
  CODE_DEPLOYMENT_SLUG: 'sleuth.io/code-deployment-slug',
} as const; 