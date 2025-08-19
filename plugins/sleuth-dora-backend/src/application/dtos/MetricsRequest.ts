import { z } from 'zod';

export const MetricsRequestSchema = z.object({
  projectId: z.string(),
  timeRange: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }),
});

export type MetricsRequest = z.infer<typeof MetricsRequestSchema>; 