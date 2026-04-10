import { z } from 'zod';

// Match status constants
export const MATCH_STATUS = {
  scheduled: 'scheduled',
  live: 'live',
  finished: 'finished',
};

// Query schema for listing matches
export const listMatchesQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(100)
    .optional(),
});

// Param schema for match ID
export const matchIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// Helper for ISO date validation
const isValidISODate = (val) => {
  return typeof val === 'string' && !isNaN(new Date(val).getTime());
};

// Schema for creating a match
export const createMatchSchema = z
  .object({
    sport: z.string().min(1, 'Sport is required'),
    homeTeam: z.string().min(1, 'Home team is required'),
    awayTeam: z.string().min(1, 'Away team is required'),
    startTime: z.string().refine(isValidISODate, {
      message: 'startTime must be a valid ISO date string',
    }),
    endTime: z.string().refine(isValidISODate, {
      message: 'endTime must be a valid ISO date string',
    }),
    homeScore: z.coerce.number().int().min(0).optional(),
    awayScore: z.coerce.number().int().min(0).optional(),
  })
  .superRefine((data, ctx) => {
    if (isValidISODate(data.startTime) && isValidISODate(data.endTime)) {
      const start = new Date(data.startTime);
      const end = new Date(data.endTime);
      if (end <= start) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'endTime must be after startTime',
          path: ['endTime'],
        });
      }
    }
  });

// Schema for updating match score
export const updateScoreSchema = z.object({
  homeScore: z.coerce.number().int().min(0),
  awayScore: z.coerce.number().int().min(0),
});
