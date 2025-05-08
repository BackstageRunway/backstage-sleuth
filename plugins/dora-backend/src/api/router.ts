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
    metricTypes: z.array(z.enum(['teamMetrics', 'teamDeploys', 'teamDeployFrequency', 'teamLeadTime', 'wipSummary'])),
    currentRangeStart: z.string(),
    currentRangeEnd: z.string(),
    previousRangeStart: z.string(),
    previousRangeEnd: z.string(),
  });

  // Metrics endpoint - GET
  router.get('/metrics/:projectId', async (req, res) => {
    try {
      const { projectId } = req.params;
      const { start, end } = req.query;

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
  router.post('/metrics', async (req, res) => {
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

  return router;
}