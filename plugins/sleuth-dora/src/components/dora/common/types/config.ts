/**
 * Configuration-related types for DORA plugin
 */

import { TimeRange } from './metrics';

/**
 * Configuration for DORA metrics API calls
 */
export interface DoraConfig {
  environment: string;
  deployment: string;
  defaultTimeRange: TimeRange;
}

/**
 * Entity-specific configuration
 */
export interface EntityConfig {
  projectSlug: string;
  environment: string;
  deployment: string;
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
  DEPLOYMENT: 'dora.sleuth.deployment',
  DEFAULT_TIME_RANGE: 'dora.sleuth.defaultTimeRange',
} as const;

/**
 * Entity annotation keys for DORA configuration
 */
export const ENTITY_ANNOTATION_KEYS = {
  PROJECT_SLUG: 'sleuth.io/project-slug',
  ENVIRONMENT: 'sleuth.io/environment',
  DEPLOYMENT: 'sleuth.io/deployment',
} as const; 