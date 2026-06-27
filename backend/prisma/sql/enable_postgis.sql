-- Run this once against the database after the first `prisma migrate dev`.
-- psql "$DATABASE_URL" -f prisma/sql/enable_postgis.sql

CREATE EXTENSION IF NOT EXISTS postgis;

-- Expression index: indexes the point built from existing lat/lng columns,
-- so no extra geometry column needs to be kept in sync.
CREATE INDEX IF NOT EXISTS idx_report_geo
  ON "Report"
  USING GIST ( (ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography) );
