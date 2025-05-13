// plugins/dora-backend/src/api/router.ts

import express from 'express';
import { Router } from 'express';
import { HttpAuthService, LoggerService } from '@backstage/backend-plugin-api';
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
  const MetricsRequestSchema = z.object({
    projectId: z.string(),
    timeRange: z.object({
      start: z.string(),
      end: z.string(),
    }),
  });

  const BatchMetricsRequestSchema = z.object({
    orgSlug: z.string(),
    teamSlug: z.string(),
    metricTypes: z.array(z.enum(['metrics'])),
    currentRangeStart: z.string(),
    currentRangeEnd: z.string(),
  });

  const DeploymentRequestSchema = z.object({
    orgSlug: z.string(),
    teamSlugs: z.array(z.string()).optional(),
    projectSlugs: z.array(z.string()),
    environmentSlugs: z.array(z.string()),
    deploymentSlugs: z.array(z.string()),
    start: z.string(),
    end: z.string(),
    page: z.number(),
    deploymentType: z.array(z.string()),
    size: z.array(z.string()),
    healthTimes: z.array(z.string()),
    onlyFailedDeploys: z.boolean().optional(),
    orderBy: z.string().nullable().optional(),
  });

  // Metrics endpoint - GET
  router.get('/metrics/:projectId', async (req, res) => {
    try {
      const { projectId } = req.params;
      const { start, end } = req.query;

      logger.info('Received metrics request', {
        projectId,
        start,
        end,
        path: req.path,
        url: req.url,
        method: req.method,
      });

      if (!start || !end) {
        logger.warn('Missing time range parameters', { query: req.query });
        return res.status(400).json({ error: 'Missing time range parameters' });
      }

      const timeRange = {
        start: start as string,
        end: end as string,
      };

      const metrics = await metricsService.getMetrics(projectId, timeRange);
      return res.json(metrics);
    } catch (error) {
      logger.error('Failed to fetch metrics', {
        error: error instanceof Error ? error.message : String(error),
      });
      return res.status(500).json({ error: 'Failed to fetch metrics' });
    }
  });

  // Metrics endpoint - POST (for backward compatibility)
  router.get('/metrics', async (req, res) => {
    try {
      const result = MetricsRequestSchema.safeParse(req.body);
      if (!result.success) {
        logger.warn('Invalid metrics request', { 
          errors: result.error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message,
          }))
        });
        return res.status(400).json({ error: 'Invalid request format' });
      }

      const { projectId, timeRange } = result.data;
      const metrics = await metricsService.getMetrics(projectId, timeRange);
      return res.json(metrics);
    } catch (error) {
      logger.error('Failed to fetch metrics', {
        error: error instanceof Error ? error.message : String(error),
      });
      return res.status(500).json({ error: 'Failed to fetch metrics' });
    }
  });

  // Batch metrics endpoint
  router.post('/batch-metrics', async (req, res) => {
    try {
      const result = BatchMetricsRequestSchema.safeParse(req.body);
      if (!result.success) {
        logger.warn('Invalid batch metrics request', { 
          errors: result.error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message,
          }))
        });
        return res.status(400).json({ error: 'Invalid request format' });
      }

      const metrics = await metricsService.getBatchMetrics(result.data);
      return res.json(metrics);
    } catch (error) {
      logger.error('Failed to fetch batch metrics', {
        error: error instanceof Error ? error.message : String(error),
      });
      return res.status(500).json({ error: 'Failed to fetch batch metrics' });
    }
  });

  router.post('/deployments', async (req, res) => {
    try {
      const result = DeploymentRequestSchema.safeParse(req.body);
      if (!result.success) {
        logger.warn('Invalid deployments request', { 
          errors: result.error.errors.map(e => ({
            path: e.path.join('.'),
            message: e.message,
          }))
        });
        return res.status(400).json({ error: 'Invalid request format' });
      }
  
      logger.info('Received deployments request', {
        orgSlug: result.data.orgSlug,
        projectSlugs: result.data.projectSlugs,
        start: result.data.start,
        end: result.data.end,
      });
  
      const deployments = await metricsService.getDeployments(result.data);
      return res.json(deployments);
    } catch (error) {
      logger.error('Failed to fetch deployments', {
        error: error instanceof Error ? error.message : String(error),
      });
      return res.status(500).json({ error: 'Failed to fetch deployments' });
    }
  });

  return router;
}