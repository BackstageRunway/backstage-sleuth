// plugins/dora-backend/src/api/router.ts

import express from 'express';
import { Router } from 'express';
import { LoggerService } from '@backstage/backend-plugin-api';
import { z } from 'zod';
import { MetricsService } from '../application/services/MetricsService';
import { DoraMetricsError } from '../domain/models/DoraMetrics';

interface RouterOptions {
  metricsService: MetricsService;
  logger: LoggerService;
}

export async function createRouter(options: RouterOptions): Promise<express.Router> {
  const { metricsService, logger } = options;
  const router = Router();

  // JSON parsing middleware
  router.use(express.json());

  // Sleuth failures answer 502 with Sleuth's own reason; anything else stays a generic 500
  const sendFailure = (res: express.Response, error: unknown, fallback: string) => {
    if (error instanceof DoraMetricsError && error.code === 'PROVIDER_ERROR') {
      return res.status(502).json({ error: error.message });
    }
    return res.status(500).json({ error: fallback });
  };

  // An unknown code deployment is a mapping mistake in the catalog, not a Sleuth outage; say how to fix it
  const isUnknownDeployment = (error: unknown) =>
    error instanceof DoraMetricsError && /No deployments found for/.test(error.message);

  const unknownDeploymentMessage = (projectSlug: string, deploymentId: string) =>
    `Sleuth has no code deployment "${deploymentId}" in project "${projectSlug}". ` +
    'Check the sleuth.io/code-deployment-slug annotation on this component.';

   /**
   * Helper method to extract the userEntityRef from the request.
   */



  // Input validation schemas
  const MetricsQuerySchema = z.object({
    timeRange: z.string().regex(/^last[1-9]\d*days$/i, 'Time range must be in format: lastXdays (e.g., last7days)'),
    environment: z.string().min(1, 'Environment is required'),
    deploymentId: z.string(),
  });

  const OrgTrendMetricsQuerySchema = MetricsQuerySchema.pick({ timeRange: true });



  // Metrics endpoint - GET - EntityDoraMetrics.tsx
  router.get('/metrics/:projectSlug', async (req, res) => {
    try {
      const { projectSlug } = req.params;
      const queryResult = MetricsQuerySchema.safeParse(req.query);

      if (!queryResult.success) {
        logger.warn('Invalid metrics request parameters', { 
          errors: queryResult.error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message,
          }))
        });
        return res.status(400).json({ 
          error: 'Invalid request parameters',
          details: queryResult.error.errors 
        });
      }

      const { timeRange, environment, deploymentId } = queryResult.data;

      logger.info('Received metrics request', {
        projectSlug,
        timeRange,
        environment,
        deploymentId,
        path: req.path,
        url: req.url,
        method: req.method,
      });

      const metrics = await metricsService.getProjectMetrics(
        
        projectSlug,
        environment,
        deploymentId,
        timeRange
      );

      return res.json(metrics);
    } catch (error) {
      logger.error('Failed to fetch metrics', {
        error: error instanceof Error ? error.message : String(error),
         projectId: req.params.projectSlug,
      });
      
      if (error instanceof Error && error.message === 'No metrics data available') {
        return res.status(404).json({ error: 'No metrics data available' });
      }

      if (isUnknownDeployment(error)) {
        return res.status(404).json({
          error: unknownDeploymentMessage(req.params.projectSlug, String(req.query.deploymentId ?? '')),
        });
      }
      
      return sendFailure(res, error, 'Failed to fetch metrics');
    }
  });

   // Metrics endpoint - GET
   router.get('/metrics-insights/:projectId', async (req, res) => {
    try {
      const { projectId } = req.params;
      const queryResult = MetricsQuerySchema.safeParse(req.query);

      if (!queryResult.success) {
        logger.warn('Invalid metrics insights request parameters', { 
          errors: queryResult.error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message,
          }))
        });
        return res.status(400).json({ 
          error: 'Invalid request parameters',
          details: queryResult.error.errors 
        });
      }

      const { timeRange, environment, deploymentId } = queryResult.data;

      logger.info('Received metrics insights request', {
        projectId,
        timeRange,
        environment,
        deploymentId,
        path: req.path,
        url: req.url,
        method: req.method,
      });

      const metrics = await metricsService.getProjectMetricsInsights(
        projectId,
        environment,
        deploymentId,
        timeRange
      );

      return res.json(metrics);
    } catch (error) {
      logger.error('Failed to fetch metrics', {
        error: error instanceof Error ? error.message : String(error),
        projectId: req.params.projectId,
      });
      
      if (error instanceof Error && error.message === 'No metrics insights data available') {
        return res.status(404).json({ error: 'No metrics insights data available' });
      }

      if (isUnknownDeployment(error)) {
        return res.status(404).json({
          error: unknownDeploymentMessage(req.params.projectId, String(req.query.deploymentId ?? '')),
        });
      }
      
      return sendFailure(res, error, 'Failed to fetch metrics insights');
    }
  });

 
  // Organization trend metrics endpoint
  router.get('/org-trend-metrics', async (req, res) => {

      try {
        
        const queryResult = OrgTrendMetricsQuerySchema.safeParse(req.query);

        if (!queryResult.success) {
          logger.warn('Invalid Org Trend metric request parameters', { 
            errors: queryResult.error.errors.map(e => ({
              path: e.path.join('.'),
              message: e.message,
            }))
          });
          return res.status(400).json({ 
            error: 'Invalid request parameters',
            details: queryResult.error.errors 
          });
        }

        const { timeRange } = queryResult.data;

  
        logger.info('Received Org Trend metrics request', {
          timeRange,
          path: req.path,
          url: req.url,
          method: req.method,
        });
  
        const result = await metricsService.getOrganizationTrendMetrics(
          timeRange
        );

      return res.json(result);
    } catch (error) {
      logger.error('Failed to fetch organization trend metrics', {
        error: error instanceof Error ? error.message : String(error),
      });
      return sendFailure(res, error, 'Failed to fetch organization trend metrics');
    }
  });


  // Team metrics endpoint - GET
  // router.get('/team-metrics/:teamSlug', async (req, res) => {
  //   try {
  //     const { teamSlug } = req.params;
  //     const queryResult = MetricsQuerySchema.safeParse(req.query);

  //     if (!queryResult.success) {
  //       logger.warn('Invalid team metrics request parameters', { 
  //         errors: queryResult.error.errors.map(e => ({
  //           path: e.path.join('.'),
  //           message: e.message,
  //         }))
  //       });
  //       return res.status(400).json({ 
  //         error: 'Invalid request parameters',
  //         details: queryResult.error.errors 
  //       });
  //     }

  //     const { timeRange, environment, deploymentId } = queryResult.data;

  //     logger.info('Received team metrics request', {
  //       teamSlug,
  //       timeRange,
  //       environment,
  //       deploymentId,
  //       path: req.path,
  //       url: req.url,
  //       method: req.method,
  //     });

  //     const metrics = await metricsService.getTeamMetrics(
  //       teamSlug,
  //       environment,
  //       timeRange
  //     );

  //     return res.json(metrics);
  //   } catch (error) {
  //     logger.error('Failed to fetch team metrics', {
  //       error: error instanceof Error ? error.message : String(error),
  //       teamSlug: req.params.teamSlug,
  //     });
      
  //     if (error instanceof Error && error.message === 'No team metrics data available') {
  //       return res.status(404).json({ error: 'No team metrics data available' });
  //     }
      
  //     return res.status(500).json({ error: 'Failed to fetch team metrics' });
  //   }
  // });

  // // Team metrics insights endpoint - GET
  // router.get('/team-metrics-insights/:teamSlug', async (req, res) => {
  //   try {
  //     const { teamSlug } = req.params;
  //     const queryResult = MetricsQuerySchema.safeParse(req.query);

  //     if (!queryResult.success) {
  //       logger.warn('Invalid team metrics insights request parameters', { 
  //         errors: queryResult.error.errors.map(e => ({
  //           path: e.path.join('.'),
  //           message: e.message,
  //         }))
  //       });
  //       return res.status(400).json({ 
  //         error: 'Invalid request parameters',
  //         details: queryResult.error.errors 
  //       });
  //     }

  //     const { timeRange, environment, deploymentId } = queryResult.data;

  //     logger.info('Received team metrics insights request', {
  //       teamSlug,
  //       timeRange,
  //       environment,
  //       deploymentId,
  //       path: req.path,
  //       url: req.url,
  //       method: req.method,
  //     });

  //     const metrics = await metricsService.getTeamMetricsInsights(
  //       teamSlug,
  //       environment,
  //       deploymentId,
  //       timeRange
  //     );

  //     return res.json(metrics);
  //   } catch (error) {
  //     logger.error('Failed to fetch team metrics insights', {
  //       error: error instanceof Error ? error.message : String(error),
  //       teamSlug: req.params.teamSlug,
  //     });
      
  //     if (error instanceof Error && error.message === 'No team metrics insights data available') {
  //       return res.status(404).json({ error: 'No team metrics insights data available' });
  //     }
      
  //     return res.status(500).json({ error: 'Failed to fetch team metrics insights' });
  //   }
  // });

  // Batch team metrics endpoint - POST
  router.post('/batch-team-metrics', async (req, res) => {
    try {
      const { teamSlugs, timeRange, environment, deploymentId } = req.body;

      // Validate required fields
      if (!teamSlugs || !Array.isArray(teamSlugs) || teamSlugs.length === 0) {
        return res.status(400).json({ 
          error: 'teamSlugs is required and must be a non-empty array' 
        });
      }

      if (!timeRange || !environment) {
        return res.status(400).json({ 
          error: 'timeRange, environment are required' 
        });
      }

      logger.info('Received batch team metrics request', {
        teamSlugs,
        timeRange,
        environment,
        deploymentId,
        path: req.path,
        url: req.url,
        method: req.method,
      });

      const metrics = await metricsService.getBatchTeamMetrics(
        teamSlugs,
        environment,
        deploymentId,
        timeRange
      );

      return res.json(metrics);
    } catch (error) {
      logger.error('Failed to fetch batch team metrics', {
        error: error instanceof Error ? error.message : String(error),
        teamSlugs: req.body.teamSlugs,
      });
      
      if (error instanceof Error && error.message === 'No batch team metrics data available') {
        return res.status(404).json({ error: 'No batch team metrics data available' });
      }
      
      return sendFailure(res, error, 'Failed to fetch batch team metrics');
    }
  });

  return router;
}