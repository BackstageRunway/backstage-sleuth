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

  const OrgTrendMetricsQuerySchema = MetricsQuerySchema.pick({ timeRange: true });


  //"http://localhost:7007/api/dora-backend/metrics/sleuth/sleuth?environment=production&deploymentId=application&timeRange=last28days"
  //"http://localhost:7007/api/dora-backend/organization-trend-metrics/sleuth?timeRange=last28days"
  // Metrics endpoint - GET - EntityDoraMetrics.tsx
  router.get('/metrics/:orgId/:projectSlug', async (req, res) => {
    try {
      const { orgId, projectSlug } = req.params;
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
        projectSlug,
        timeRange,
        environment,
        deploymentId,
        path: req.path,
        url: req.url,
        method: req.method,
      });

      const metrics = await metricsService.getProjectMetrics(
        orgId,
        projectSlug,
        environment,
        deploymentId,
        timeRange
      );

      return res.json(metrics);
    } catch (error) {
      logger.error('Failed to fetch metrics', {
        error: error instanceof Error ? error.message : String(error),
        orgId: req.params.orgId,
        projectId: req.params.projectSlug,
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

 
  // Organization trend metrics endpoint
  router.get('/org-trend-metrics/:orgId', async (req, res) => {

      try {
        const { orgId } = req.params;
       
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
          orgId,
          timeRange,
          path: req.path,
          url: req.url,
          method: req.method,
        });
  
        const result = await metricsService.getOrganizationTrendMetrics(
          orgId,
          timeRange
        );

      return res.json(result);
    } catch (error) {
      logger.error('Failed to fetch organization trend metrics', {
        error: error instanceof Error ? error.message : String(error),
        orgSlug: req.query.orgSlug,
      });
      return res.status(500).json({ error: 'Failed to fetch organization trend metrics' });
    }
  });


  // Team metrics endpoint - GET
  router.get('/team-metrics/:orgId/:teamSlug', async (req, res) => {
    try {
      const { orgId, teamSlug } = req.params;
      const queryResult = MetricsQuerySchema.safeParse(req.query);

      if (!queryResult.success) {
        logger.warn('Invalid team metrics request parameters', { 
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

      logger.info('Received team metrics request', {
        orgId,
        teamSlug,
        timeRange,
        environment,
        deploymentId,
        path: req.path,
        url: req.url,
        method: req.method,
      });

      const metrics = await metricsService.getTeamMetrics(
        orgId,
        teamSlug,
        environment,
        deploymentId,
        timeRange
      );

      return res.json(metrics);
    } catch (error) {
      logger.error('Failed to fetch team metrics', {
        error: error instanceof Error ? error.message : String(error),
        orgId: req.params.orgId,
        teamSlug: req.params.teamSlug,
      });
      
      if (error instanceof Error && error.message === 'No team metrics data available') {
        return res.status(404).json({ error: 'No team metrics data available' });
      }
      
      return res.status(500).json({ error: 'Failed to fetch team metrics' });
    }
  });

  // Team metrics insights endpoint - GET
  router.get('/team-metrics-insights/:orgId/:teamSlug', async (req, res) => {
    try {
      const { orgId, teamSlug } = req.params;
      const queryResult = MetricsQuerySchema.safeParse(req.query);

      if (!queryResult.success) {
        logger.warn('Invalid team metrics insights request parameters', { 
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

      logger.info('Received team metrics insights request', {
        orgId,
        teamSlug,
        timeRange,
        environment,
        deploymentId,
        path: req.path,
        url: req.url,
        method: req.method,
      });

      const metrics = await metricsService.getTeamMetricsInsights(
        orgId,
        teamSlug,
        environment,
        deploymentId,
        timeRange
      );

      return res.json(metrics);
    } catch (error) {
      logger.error('Failed to fetch team metrics insights', {
        error: error instanceof Error ? error.message : String(error),
        orgId: req.params.orgId,
        teamSlug: req.params.teamSlug,
      });
      
      if (error instanceof Error && error.message === 'No team metrics insights data available') {
        return res.status(404).json({ error: 'No team metrics insights data available' });
      }
      
      return res.status(500).json({ error: 'Failed to fetch team metrics insights' });
    }
  });

  // Batch team metrics endpoint - POST
  router.post('/batch-team-metrics/:orgId', async (req, res) => {
    try {
      const { orgId } = req.params;
      const { teamSlugs, timeRange, environment, deploymentId } = req.body;

      // Validate required fields
      if (!teamSlugs || !Array.isArray(teamSlugs) || teamSlugs.length === 0) {
        return res.status(400).json({ 
          error: 'teamSlugs is required and must be a non-empty array' 
        });
      }

      if (!timeRange || !environment || !deploymentId) {
        return res.status(400).json({ 
          error: 'timeRange, environment, and deploymentId are required' 
        });
      }

      logger.info('Received batch team metrics request', {
        orgId,
        teamSlugs,
        timeRange,
        environment,
        deploymentId,
        path: req.path,
        url: req.url,
        method: req.method,
      });

      const metrics = await metricsService.getBatchTeamMetrics(
        orgId,
        teamSlugs,
        environment,
        deploymentId,
        timeRange
      );

      return res.json(metrics);
    } catch (error) {
      logger.error('Failed to fetch batch team metrics', {
        error: error instanceof Error ? error.message : String(error),
        orgId: req.params.orgId,
        teamSlugs: req.body.teamSlugs,
      });
      
      if (error instanceof Error && error.message === 'No batch team metrics data available') {
        return res.status(404).json({ error: 'No batch team metrics data available' });
      }
      
      return res.status(500).json({ error: 'Failed to fetch batch team metrics' });
    }
  });

  return router;
}