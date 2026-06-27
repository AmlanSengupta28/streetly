import { z } from 'zod';
import {
  createReport,
  getReportById,
  listRecent,
  listNearby,
  searchReports,
  listAreaRollup,
  flagReport,
} from '../services/reports.service.js';
import { CATEGORY_KEYS } from '../constants/categories.js';

const ratingsSchema = z
  .object(Object.fromEntries(CATEGORY_KEYS.map((k) => [k, z.number().min(1).max(5).optional()])))
  .optional()
  .default({});

const createReportSchema = z.object({
  lat: z.number().gte(-90).lte(90),
  lng: z.number().gte(-180).lte(180),
  areaLabel: z.string().trim().min(1).max(200),
  photoUrl: z.string().url().optional().nullable(),
  ratings: ratingsSchema,
  score: z.number().int().min(0).max(100).optional(),
  tags: z.array(z.string()).max(20).optional(),
  comment: z.string().trim().max(1000).optional(),
  deviceId: z.string().max(100).optional(),
});

export async function postReport(req, res, next) {
  try {
    const parsed = createReportSchema.parse(req.body);
    const report = await createReport(parsed);
    res.status(201).json(report);
  } catch (err) {
    if (err.issues) return res.status(400).json({ error: err.issues[0].message });
    next(err);
  }
}

export async function getReport(req, res, next) {
  try {
    const report = await getReportById(req.params.id);
    if (!report) return res.status(404).json({ error: 'Report not found.' });
    res.json(report);
  } catch (err) {
    next(err);
  }
}

export async function listReports(req, res, next) {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const offset = Number(req.query.offset) || 0;
    const { lat, lng, radiusKm, q } = req.query;

    if (q && q.trim()) {
      const results = await searchReports({ q: q.trim(), limit, offset });
      return res.json(results);
    }

    if (lat && lng) {
      const results = await listNearby({
        lat: Number(lat),
        lng: Number(lng),
        radiusKm: radiusKm ? Number(radiusKm) : 5,
        limit,
        offset,
      });
      return res.json(results);
    }

    const results = await listRecent({ limit, offset });
    res.json(results);
  } catch (err) {
    next(err);
  }
}

export async function getAreaRollup(req, res, next) {
  try {
    const results = await listAreaRollup();
    res.json(results);
  } catch (err) {
    next(err);
  }
}

export async function postFlag(req, res, next) {
  try {
    const result = await flagReport(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
