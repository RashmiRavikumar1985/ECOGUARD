-- EcoGuard PostgreSQL Schema
-- Cold Storage + Write-Back for Kafka Consumers

-- Enable PostGIS for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================
-- STATIC DATA (READ - feeds Kafka producer)
-- ============================================

-- Zone definitions (geographic boundaries)
CREATE TABLE zones (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255),
    country_id VARCHAR(10) NOT NULL,
    region_id VARCHAR(100),
    center GEOGRAPHY(POINT, 4326) NOT NULL,
    radius_meters INTEGER DEFAULT 1000,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Soil type data (from geological surveys)
CREATE TABLE zone_soil (
    zone_id VARCHAR(50) PRIMARY KEY REFERENCES zones(id),
    soil_type VARCHAR(50) NOT NULL, -- Clay, Loam, Sand, Silt, Rock
    permeability VARCHAR(20), -- Low, Medium, High
    stability_index DECIMAL(4, 3), -- 0-1
    source VARCHAR(100),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Slope data (from DEM processing)
CREATE TABLE zone_slope (
    zone_id VARCHAR(50) PRIMARY KEY REFERENCES zones(id),
    slope_angle DECIMAL(5, 2) NOT NULL, -- degrees
    aspect VARCHAR(20), -- N, NE, E, SE, S, SW, W, NW
    elevation_meters INTEGER,
    dem_source VARCHAR(50), -- SRTM, ALOS
    updated_at TIMESTAMP DEFAULT NOW()
);

-- NDVI baseline (from Sentinel-2)
CREATE TABLE zone_vegetation (
    zone_id VARCHAR(50) PRIMARY KEY REFERENCES zones(id),
    ndvi_baseline DECIMAL(4, 3), -- 0-1
    vegetation_type VARCHAR(50), -- Forest, Grassland, Bare
    last_satellite_update TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Historical landslide events (for ML training)
CREATE TABLE historical_landslides (
    id SERIAL PRIMARY KEY,
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    event_date DATE NOT NULL,
    rainfall_prior_mm DECIMAL(8, 2),
    soil_moisture_prior DECIMAL(5, 2),
    slope_angle DECIMAL(5, 2),
    fatalities INTEGER DEFAULT 0,
    damage_usd DECIMAL(15, 2),
    source VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- WRITE-BACK DATA (from Kafka Consumers)
-- ============================================

-- Alert history (write-back from Alert Persister)
CREATE TABLE alert_history (
    id SERIAL PRIMARY KEY,
    zone_id VARCHAR(50) REFERENCES zones(id),
    risk_level VARCHAR(20) NOT NULL, -- WATCH, WARNING, CRITICAL
    risk_probability DECIMAL(4, 3),
    rainfall_48h DECIMAL(8, 2),
    soil_moisture DECIMAL(5, 2),
    ari DECIMAL(8, 2),
    alert_sent_at TIMESTAMP DEFAULT NOW()
);

-- Risk snapshots (write-back from Snapshot Service)
CREATE TABLE risk_snapshots (
    id SERIAL PRIMARY KEY,
    zone_id VARCHAR(50) REFERENCES zones(id),
    risk_level VARCHAR(20) NOT NULL,
    risk_probability DECIMAL(4, 3),
    rainfall_48h DECIMAL(8, 2),
    soil_moisture DECIMAL(5, 2),
    ari DECIMAL(8, 2),
    slope_angle DECIMAL(5, 2),
    ndvi DECIMAL(4, 3),
    snapshot_at TIMESTAMP DEFAULT NOW()
);

-- System health log (write-back from all services)
CREATE TABLE system_log (
    id SERIAL PRIMARY KEY,
    service_name VARCHAR(50) NOT NULL,
    log_level VARCHAR(20) NOT NULL, -- INFO, WARN, ERROR
    message TEXT,
    metadata JSONB,
    logged_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_zones_country ON zones(country_id);
CREATE INDEX idx_zones_region ON zones(country_id, region_id);
CREATE INDEX idx_zones_center ON zones USING GIST(center);
CREATE INDEX idx_landslides_location ON historical_landslides USING GIST(location);
CREATE INDEX idx_landslides_date ON historical_landslides(event_date);
CREATE INDEX idx_alerts_zone ON alert_history(zone_id, alert_sent_at DESC);
CREATE INDEX idx_snapshots_zone ON risk_snapshots(zone_id, snapshot_at DESC);
CREATE INDEX idx_system_log_service ON system_log(service_name, logged_at DESC);

-- ============================================
-- VIEW (for Kafka producer to read)
-- ============================================

CREATE VIEW zone_static_data AS
SELECT 
    z.id,
    z.name,
    z.country_id,
    z.region_id,
    ST_Y(z.center::geometry) as lat,
    ST_X(z.center::geometry) as lng,
    z.radius_meters,
    s.soil_type,
    s.permeability,
    s.stability_index,
    sl.slope_angle,
    sl.elevation_meters,
    v.ndvi_baseline,
    v.vegetation_type
FROM zones z
LEFT JOIN zone_soil s ON z.id = s.zone_id
LEFT JOIN zone_slope sl ON z.id = sl.zone_id
LEFT JOIN zone_vegetation v ON z.id = v.zone_id;

-- ============================================
-- SAMPLE DATA (Wayanad, Kerala)
-- ============================================

INSERT INTO zones (id, name, country_id, region_id, center, radius_meters) VALUES
('wayanad-001', 'Wayanad Sector 1', 'in', 'Kerala', ST_SetSRID(ST_MakePoint(76.13, 11.68), 4326), 1000),
('wayanad-002', 'Wayanad Sector 2', 'in', 'Kerala', ST_SetSRID(ST_MakePoint(76.15, 11.70), 4326), 1000),
('wayanad-003', 'Wayanad Sector 3', 'in', 'Kerala', ST_SetSRID(ST_MakePoint(76.11, 11.66), 4326), 1000);

INSERT INTO zone_soil (zone_id, soil_type, permeability, stability_index) VALUES
('wayanad-001', 'Clay', 'Low', 0.35),
('wayanad-002', 'Loam', 'Medium', 0.55),
('wayanad-003', 'Clay', 'Low', 0.30);

INSERT INTO zone_slope (zone_id, slope_angle, elevation_meters) VALUES
('wayanad-001', 32.5, 850),
('wayanad-002', 25.0, 720),
('wayanad-003', 38.0, 920);

INSERT INTO zone_vegetation (zone_id, ndvi_baseline, vegetation_type) VALUES
('wayanad-001', 0.45, 'Forest'),
('wayanad-002', 0.62, 'Forest'),
('wayanad-003', 0.28, 'Grassland');
