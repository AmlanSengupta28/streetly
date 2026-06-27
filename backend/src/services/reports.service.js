import { prisma } from '../config/prisma.js';
import { computeScore } from './score.service.js';

const PUBLIC_FIELDS = {
  id: true,
  lat: true,
  lng: true,
  areaLabel: true,
  photoUrl: true,
  ratings: true,
  tags: true,
  comment: true,
  score: true,
  createdAt: true,
  // deviceId, flagged, flagCount are intentionally excluded from public responses
};

export async function createReport(input) {
  const score = input.score ?? computeScore(input.ratings ?? {});
  if (score === null) {
    throw Object.assign(new Error('Provide a score or rate at least one category.'), { status: 400 });
  }

  return prisma.report.create({
    data: {
      lat: input.lat,
      lng: input.lng,
      areaLabel: input.areaLabel,
      photoUrl: input.photoUrl ?? null,
      ratings: input.ratings,
      tags: input.tags ?? [],
      comment: input.comment ?? null,
      score,
      deviceId: input.deviceId ?? null,
    },
    select: PUBLIC_FIELDS,
  });
}

export async function getReportById(id) {
  return prisma.report.findUnique({ where: { id }, select: PUBLIC_FIELDS });
}

/**
 * Newest-first feed, paginated. Used for the default "Nearby" tab
 * sort and as a fallback when the client has no location.
 */
export async function listRecent({ limit = 20, offset = 0 } = {}) {
  return prisma.report.findMany({
    where: { flagged: false },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
    select: PUBLIC_FIELDS,
  });
}

/**
 * Radius search using PostGIS ST_DWithin against the expression index
 * created in prisma/sql/enable_postgis.sql. This is the query that
 * doesn't scale as a client-side haversine loop once you have more
 * than a few hundred reports.
 */
export async function listNearby({ lat, lng, radiusKm = 5, limit = 20, offset = 0 }) {
  const radiusMeters = radiusKm * 1000;

  return prisma.$queryRaw`
    SELECT id, lat, lng, "areaLabel", "photoUrl", ratings, tags, comment, score, "createdAt",
           ST_Distance(
             ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
             ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
           ) / 1000 AS "distanceKm"
    FROM "Report"
    WHERE flagged = false
      AND ST_DWithin(
        ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
        ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
        ${radiusMeters}
      )
    ORDER BY "distanceKm" ASC
    LIMIT ${limit}
    OFFSET ${offset};
  `;
}

/**
 * Text search across area label, comment, and tags. Powers the
 * "search reports" box on the Nearby tab — separate from listNearby,
 * which searches by distance, not by keyword.
 */
export async function searchReports({ q, limit = 20, offset = 0 }) {
  return prisma.report.findMany({
    where: {
      flagged: false,
      OR: [
        { areaLabel: { contains: q, mode: 'insensitive' } },
        { comment: { contains: q, mode: 'insensitive' } },
        { tags: { has: q } },
      ],
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
    select: PUBLIC_FIELDS,
  });
}

/**
 * Area rollup — average score per rounded lat/lng "cell", a cheap
 * stand-in for real ward/RWA boundaries. Swap the GROUP BY for a
 * proper boundary join (e.g. a Ward table with polygon geometry)
 * once you have boundary data for Gurgaon's sectors.
 */
export async function listAreaRollup() {
  return prisma.$queryRaw`
    SELECT
      ROUND(lat::numeric, 3) AS "cellLat",
      ROUND(lng::numeric, 3) AS "cellLng",
      COUNT(*)::int AS "reportCount",
      ROUND(AVG(score)::numeric, 1) AS "avgScore"
    FROM "Report"
    WHERE flagged = false
    GROUP BY "cellLat", "cellLng"
    ORDER BY "reportCount" DESC;
  `;
}

export async function flagReport(id) {
  return prisma.report.update({
    where: { id },
    data: { flagCount: { increment: 1 }, flagged: true },
    select: { id: true, flagged: true, flagCount: true },
  });
}
