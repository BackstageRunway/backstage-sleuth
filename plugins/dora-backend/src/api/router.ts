// plugins/dora-backend/src/api/router.ts

import express from 'express';
import { Router } from 'express';
import { LoggerService } from '@backstage/backend-plugin-api';
import { z } from 'zod';
import { MetricsService } from '../application/services/MetricsService';

interface RouterOptions {
  metricsService: MetricsService;
  logger: LoggerService;
}

export async function createRouter(options: RouterOptions): Promise<express.Router> {
  const { metricsService, logger } = options;
  const router = Router();

  // JSON parsing middleware
  router.use(express.json());

   /**
   * Helper method to extract the userEntityRef from the request.
   */
  //  const getUserEntityRef = async (req: Request): Promise<string> => {
  //   const credentials = await httpAuth.credentials(req, {
  //     allow: ['user'],
  //   });
  //   return credentials.principal.userEntityRef;
  // };


  // Input validation schemas
  const MetricsQuerySchema = z.object({
    timeRange: z.string().regex(/^last\d+days$/i, 'Time range must be in format: lastXdays (e.g., last7days)'),
    environment: z.string().min(1, 'Environment is required'),
    deploymentId: z.string().min(1, 'Deployment ID is required'),
  });

  const MultiProjectMetricsQuerySchema = z.object({
    orgSlug: z.string().min(1, 'Organization slug is required'),
    projectSlugs: z.string().min(1, 'Project slugs are required'),
    start: z.string().min(1, 'Start date is required'),
    end: z.string().min(1, 'End date is required'),
    environmentName: z.string().optional(),
    labelSlugs: z.string().optional(),
    teamSlugs: z.string().optional(),
  });

  // Metrics endpoint - GET - EntityDoraMetrics.tsx
  router.get('/metrics/:orgId/:projectId', async (req, res) => {
    try {
      const { orgId, projectId } = req.params;
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
        orgId,
        projectId,
        timeRange,
        environment,
        deploymentId,
        path: req.path,
        url: req.url,
        method: req.method,
      });

      const metrics = await metricsService.getProjectMetrics(
        orgId,
        projectId,
        environment,
        deploymentId,
        'backend',
        timeRange
      );

      return res.json(metrics);
    } catch (error) {
      logger.error('Failed to fetch metrics', {
        error: error instanceof Error ? error.message : String(error),
        orgId: req.params.orgId,
        projectId: req.params.projectId,
      });
      
      if (error instanceof Error && error.message === 'No metrics data available') {
        return res.status(404).json({ error: 'No metrics data available' });
      }
      
      return res.status(500).json({ error: 'Failed to fetch metrics' });
    }
  });

   // Metrics endpoint - GET
   router.get('/metrics-insights/:orgId/:projectId', async (req, res) => {
    try {
      const { orgId, projectId } = req.params;
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
        orgId,
        projectId,
        timeRange,
        environment,
        deploymentId,
        path: req.path,
        url: req.url,
        method: req.method,
      });

      const metrics = await metricsService.getProjectMetricsInsights(
        orgId,
        projectId,
        environment,
        deploymentId,
        'backend',
        timeRange
      );

      return res.json(metrics);
    } catch (error) {
      logger.error('Failed to fetch metrics', {
        error: error instanceof Error ? error.message : String(error),
        orgId: req.params.orgId,
        projectId: req.params.projectId,
      });
      
      if (error instanceof Error && error.message === 'No metrics insights data available') {
        return res.status(404).json({ error: 'No metrics insights data available' });
      }
      
      return res.status(500).json({ error: 'Failed to fetch metrics insights' });
    }
  });

  // Multi-project metrics endpoint
  router.get('/metrics/multi-project', async (req, res) => {
    try {
      const queryResult = MultiProjectMetricsQuerySchema.safeParse(req.query);

      if (!queryResult.success) {
        logger.warn('Invalid multi-project metrics request parameters', { 
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

      const {
        orgSlug,
        projectSlugs,
        start,
        end,
        environmentName,
        labelSlugs,
        teamSlugs,
      } = queryResult.data;

      logger.info('Received multi-project metrics request', {
        orgSlug,
        projectSlugs,
        start,
        end,
        environmentName,
        labelSlugs,
        teamSlugs,
      });

      const result = await metricsService.getMultiProjectMetrics(
        orgSlug,
        projectSlugs.split(','),
        start,
        end,
        environmentName,
        labelSlugs ? labelSlugs.split(',') : undefined,
        teamSlugs ? teamSlugs.split(',') : undefined,
      );

      return res.json(result);
    } catch (error) {
      logger.error('Failed to fetch multi-project metrics', {
        error: error instanceof Error ? error.message : String(error),
        orgSlug: req.query.orgSlug,
      });
      
      if (error instanceof Error && error.message === 'No data received from Sleuth API') {
        return res.status(404).json({ error: 'No metrics data available' });
      }
      
      return res.status(500).json({ error: 'Failed to fetch multi-project metrics' });
    }
  });

  // Batch metrics endpoint
  // router.post('/batch-metrics', async (req, res) => {
  //   try {
  //     const result = BatchMetricsRequestSchema.safeParse(req.body);
  //     if (!result.success) {
  //       logger.warn('Invalid batch metrics request', { 
  //         errors: result.error.errors.map(e => ({
  //           path: e.path.join('.'),
  //           message: e.message,
  //         }))
  //       });
  //       return res.status(400).json({ error: 'Invalid request format' });
  //     }

  //     const metrics = await metricsService.getBatchMetrics(result.data);
  //     return res.json(metrics);
  //   } catch (error) {
  //     logger.error('Failed to fetch batch metrics', {
  //       error: error instanceof Error ? error.message : String(error),
  //     });
  //     return res.status(500).json({ error: 'Failed to fetch batch metrics' });
  //   }
  // });

  // router.post('/deployments', async (req, res) => {
  //   try {
  //     const result = DeploymentRequestSchema.safeParse(req.body);
  //     if (!result.success) {
  //       logger.warn('Invalid deployments request', { 
  //         errors: result.error.errors.map(e => ({
  //           path: e.path.join('.'),
  //           message: e.message,
  //         }))
  //       });
  //       return res.status(400).json({ error: 'Invalid request format' });
  //     }
  
  //     logger.info('Received deployments request', {
  //       orgSlug: result.data.orgSlug,
  //       projectSlugs: result.data.projectSlugs,
  //       start: result.data.start,
  //       end: result.data.end,
  //     });
  
  //     const deployments = await metricsService.getDeployments(result.data);
  //     return res.json(deployments);
  //   } catch (error) {
  //     logger.error('Failed to fetch deployments', {
  //       error: error instanceof Error ? error.message : String(error),
  //     });
  //     return res.status(500).json({ error: 'Failed to fetch deployments' });
  //   }
  // });

  return router;
}