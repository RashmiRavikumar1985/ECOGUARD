# EcoGuard Kafka Producer Configuration

import os

# Kafka Configuration
KAFKA_BOOTSTRAP_SERVERS = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092')
KAFKA_TOPIC_RISK_ZONES = 'risk-zones-updates'
KAFKA_TOPIC_FEATURES = 'processed-features'
KAFKA_TOPIC_ALERTS = 'alerts'

# PostgreSQL Configuration (Cold Storage)
POSTGRES_HOST = os.getenv('POSTGRES_HOST', 'localhost')
POSTGRES_PORT = os.getenv('POSTGRES_PORT', '5432')
POSTGRES_DB = os.getenv('POSTGRES_DB', 'ecoguard')
POSTGRES_USER = os.getenv('POSTGRES_USER', 'ecoguard')
POSTGRES_PASSWORD = os.getenv('POSTGRES_PASSWORD', 'ecoguard')

# NASA API Configuration
NASA_EARTHDATA_TOKEN = os.getenv('NASA_EARTHDATA_TOKEN', '')
GPM_API_URL = 'https://gpm1.gesdisc.eosdis.nasa.gov/data/GPM_L3/'
SMAP_API_URL = 'https://n5eil01u.ecs.nsidc.org/SMAP/'

# ML Model Configuration
MODEL_PATH = os.getenv('MODEL_PATH', './models/landslide_rf.pkl')

# Risk Thresholds
RISK_THRESHOLDS = {
    'SAFE': (0, 0.3),
    'WATCH': (0.3, 0.6),
    'WARNING': (0.6, 0.8),
    'CRITICAL': (0.8, 1.0)
}

# ARI Configuration
ARI_DECAY_FACTOR = 0.85  # k value for Antecedent Rainfall Index
ARI_DAYS = 7  # Number of days to consider for ARI

# Update Intervals (seconds)
RAINFALL_UPDATE_INTERVAL = 1800  # 30 minutes
RISK_UPDATE_INTERVAL = 60  # 1 minute
