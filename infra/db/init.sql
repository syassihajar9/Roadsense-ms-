CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE videos (
                        id UUID PRIMARY KEY,
                        filename TEXT NOT NULL,
                        uploaded_at TIMESTAMP NOT NULL DEFAULT NOW(),
                        source_type TEXT,
                        duration_seconds NUMERIC
);

CREATE TABLE frames (
                        id UUID PRIMARY KEY,
                        video_id UUID REFERENCES videos(id),
                        frame_index INT,
                        timestamp_ms BIGINT,
                        image_path TEXT,
                        gps_lat DOUBLE PRECISION,
                        gps_lon DOUBLE PRECISION,
                        gps_alt DOUBLE PRECISION,
                        imu_yaw DOUBLE PRECISION,
                        imu_pitch DOUBLE PRECISION,
                        imu_roll DOUBLE PRECISION
);

CREATE TABLE detections (
                            id UUID PRIMARY KEY,
                            frame_id UUID REFERENCES frames(id),
                            model_name TEXT,
                            class_label TEXT,
                            confidence NUMERIC,
                            bbox_xmin NUMERIC,
                            bbox_ymin NUMERIC,
                            bbox_xmax NUMERIC,
                            bbox_ymax NUMERIC,
                            mask_path TEXT,
                            created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE road_segments (
                               id UUID PRIMARY KEY,
                               osm_id BIGINT,
                               name TEXT,
                               importance TEXT,
                               geom GEOMETRY(LineString, 4326)
);

CREATE TABLE defects (
                         id UUID PRIMARY KEY,
                         detection_id UUID REFERENCES detections(id),
                         segment_id UUID REFERENCES road_segments(id),
                         location GEOMETRY(Point, 4326),
                         created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE severity_scores (
                                 id UUID PRIMARY KEY,
                                 defect_id UUID REFERENCES defects(id),
                                 severity_score NUMERIC,
                                 severity_class TEXT,
                                 computed_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE segment_priority (
                                  id UUID PRIMARY KEY,
                                  segment_id UUID REFERENCES road_segments(id),
                                  priority_score NUMERIC,
                                  cost_estimate NUMERIC,
                                  traffic_level NUMERIC,
                                  last_updated TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS georef (
                                      id SERIAL PRIMARY KEY,
                                      image_id UUID NOT NULL,
                                      geom GEOMETRY(Point, 4326)
    );
