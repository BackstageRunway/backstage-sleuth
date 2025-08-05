/**
 * Entity annotation constants for DORA plugin
 */

/**
 * Sleuth/DORA entity annotation keys
 */
export const SLEUTH_ANNOTATION_KEYS = {
  ORG_ID: 'sleuth.io/org-id',
  PROJECT_SLUG: 'sleuth.io/project-slug',
  ENVIRONMENT: 'sleuth.io/environment',
  DEPLOYMENT: 'sleuth.io/deployment',
  TEAM: 'sleuth.io/team',
  SERVICE: 'sleuth.io/service',
} as const;

/**
 * Backstage entity annotation keys
 */
export const BACKSTAGE_ANNOTATION_KEYS = {
  OWNER: 'backstage.io/owner',
  SYSTEM: 'backstage.io/system',
  DOMAIN: 'backstage.io/domain',
  LIFECYCLE: 'backstage.io/lifecycle',
  TECH_STACK: 'backstage.io/tech-stack',
} as const;

/**
 * Default values for entity annotations
 */
export const DEFAULT_ENTITY_VALUES = {
  ORG_ID: 'sleuth',
  PROJECT_SLUG: 'sleuth',
  ENVIRONMENT: 'production',
  DEPLOYMENT: 'application',
  TEAM: 'default',
  SERVICE: 'default',
} as const;

