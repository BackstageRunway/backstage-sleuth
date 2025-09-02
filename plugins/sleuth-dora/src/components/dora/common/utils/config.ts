/**
 * Configuration utilities for DORA plugin
 */

import { useApi } from '@backstage/core-plugin-api';
import { configApiRef } from '@backstage/core-plugin-api';
import { DoraConfig, BackstageEntity, DORA_CONFIG_KEYS, ENTITY_ANNOTATION_KEYS } from '../types/config';
import { TimeRange } from '../types/metrics';
import { DEFAULT_ENTITY_VALUES } from '../constants/annotations';

/**
 * Default configuration values for DORA plugin
 */
export const DORA_DEFAULT_CONFIG: DoraConfig = {
  environment: DEFAULT_ENTITY_VALUES.ENVIRONMENT,
  defaultProjectSlug: DEFAULT_ENTITY_VALUES.PROJECT_SLUG,
  codeDeploymentSlug: DEFAULT_ENTITY_VALUES.CODE_DEPLOYMENT_SLUG,
  defaultTimeRange: 'last28days' as TimeRange,
} as const;

/**
 * Hook to get DORA configuration from Backstage config API
 * Falls back to default values if not configured
 */
export type DoraResolvedConfig = {
  projectSlug: string;
  environment: string;
  codeDeploymentSlug: string;
  defaultTimeRange: TimeRange;
};

export const useDoraConfig = (entity?: BackstageEntity): DoraResolvedConfig => {
  try {
    const configApi = useApi(configApiRef);

    // first level(read from entity annotations)
    const annProj = entity?.metadata.annotations?.[ENTITY_ANNOTATION_KEYS.PROJECT_SLUG];
    const annEnv = entity?.metadata.annotations?.[ENTITY_ANNOTATION_KEYS.ENVIRONMENT];
    const annCodeDep = entity?.metadata.annotations?.[ENTITY_ANNOTATION_KEYS.CODE_DEPLOYMENT_SLUG] || entity?.metadata.name;

    // second level (read from app-config.yaml) - fallback to config
    const cfgEnv = configApi.getOptionalString(DORA_CONFIG_KEYS.ENVIRONMENT);
    const cfgProj = configApi.getOptionalString(DORA_CONFIG_KEYS.DEFAULT_PROJECT_SLUG);
    const cfgTimeRange = configApi.getOptionalString(DORA_CONFIG_KEYS.DEFAULT_TIME_RANGE) as TimeRange | undefined;

    // third level (read from defaults) - fallback to defaults
    const projectSlug = annProj ?? cfgProj ?? DORA_DEFAULT_CONFIG.defaultProjectSlug!;
    const environment = annEnv ?? cfgEnv ?? DORA_DEFAULT_CONFIG.environment!;
    const codeDeploymentSlug = annCodeDep ?? DORA_DEFAULT_CONFIG.codeDeploymentSlug!;
    const defaultTimeRange = cfgTimeRange ?? DORA_DEFAULT_CONFIG.defaultTimeRange!;

    return { projectSlug, environment, codeDeploymentSlug, defaultTimeRange };
  } catch {
    return {
      projectSlug: DORA_DEFAULT_CONFIG.defaultProjectSlug!,
      environment: DORA_DEFAULT_CONFIG.environment!,
      codeDeploymentSlug: '',
      defaultTimeRange: DORA_DEFAULT_CONFIG.defaultTimeRange!,
    };
  }
};
