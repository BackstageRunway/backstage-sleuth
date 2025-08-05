/**
 * Configuration-related types for DORA plugin
 */

import { TimeRange } from './metrics';

/**
 * Configuration for DORA metrics API calls
 */
export interface DoraConfig {
  orgId: string;
  environment: string;
  deployment: string;
  defaultTimeRange: TimeRange;
}

/**
 * Entity-specific configuration
 */
export interface EntityConfig {
  orgId: string;
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
 * Configuration validation result
 */
export interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Configuration keys for DORA plugin
 */
export const DORA_CONFIG_KEYS = {
  ORG_ID: 'dora.orgId',
  ENVIRONMENT: 'dora.environment',
  DEPLOYMENT: 'dora.deployment',
  DEFAULT_TIME_RANGE: 'dora.defaultTimeRange',
} as const;

/**
 * Entity annotation keys for DORA configuration
 */
export const ENTITY_ANNOTATION_KEYS = {
  ORG_ID: 'sleuth.io/org-id',
  PROJECT_SLUG: 'sleuth.io/project-slug',
  ENVIRONMENT: 'sleuth.io/environment',
  DEPLOYMENT: 'sleuth.io/deployment',
} as const; 