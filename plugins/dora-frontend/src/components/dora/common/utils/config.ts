/**
 * Configuration utilities for DORA plugin
 */

import { useApi } from '@backstage/core-plugin-api';
import { configApiRef } from '@backstage/core-plugin-api';
import { DoraConfig, BackstageEntity, EntityConfig, DORA_CONFIG_KEYS, ENTITY_ANNOTATION_KEYS } from '../types/config';
import { TimeRange } from '../types/metrics';
import { DEFAULT_ENTITY_VALUES } from '../constants/annotations';

/**
 * Default configuration values for DORA plugin
 */
export const DORA_DEFAULT_CONFIG: DoraConfig = {
  environment: DEFAULT_ENTITY_VALUES.ENVIRONMENT,
  deployment: DEFAULT_ENTITY_VALUES.DEPLOYMENT,
  defaultTimeRange: 'last28days' as TimeRange,
} as const;

/**
 * Hook to get DORA configuration from Backstage config API
 * Falls back to default values if not configured
 */
export const useDoraConfig = () => {
  try {
    const configApi = useApi(configApiRef);
    
    return {
      environment: configApi.getOptionalString(DORA_CONFIG_KEYS.ENVIRONMENT) || DORA_DEFAULT_CONFIG.environment,
      deployment: configApi.getOptionalString(DORA_CONFIG_KEYS.DEPLOYMENT) || DORA_DEFAULT_CONFIG.deployment,
      defaultTimeRange: configApi.getOptionalString(DORA_CONFIG_KEYS.DEFAULT_TIME_RANGE) || DORA_DEFAULT_CONFIG.defaultTimeRange,
    };
  } catch (error) {
    // Fallback to default values if config API is not available
    console.warn('DORA Plugin: Config API not available, using default values:', error);
    return DORA_DEFAULT_CONFIG;
  }
};

/**
 * Utility to get entity-specific configuration with fallbacks
 * @param entity - Backstage entity
 * @param config - Base configuration
 * @returns Merged configuration with entity annotations taking precedence
 */
export const getEntityConfig = (entity: BackstageEntity, config: ReturnType<typeof useDoraConfig>): EntityConfig => {
  return {
    projectSlug: entity.metadata.annotations?.[ENTITY_ANNOTATION_KEYS.PROJECT_SLUG] || DEFAULT_ENTITY_VALUES.PROJECT_SLUG,
    environment: entity.metadata.annotations?.[ENTITY_ANNOTATION_KEYS.ENVIRONMENT] || config.environment,
    deployment: entity.metadata.annotations?.[ENTITY_ANNOTATION_KEYS.DEPLOYMENT] || config.deployment,
  };
}; 