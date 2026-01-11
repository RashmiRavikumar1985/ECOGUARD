# Antecedent Rainfall Index (ARI) Calculator
# Core algorithm for landslide prediction

from typing import List
from config import ARI_DECAY_FACTOR, ARI_DAYS


def calculate_ari(rainfall_history: List[float], k: float = ARI_DECAY_FACTOR) -> float:
    """
    Calculate Antecedent Rainfall Index (ARI)
    
    Formula: ARI = R_t + Σ(k^i × R_{t-i})
    
    Where:
    - R_t = Rainfall today
    - k = Recession coefficient (0.85) - represents soil drainage
    - i = Days ago
    
    Args:
        rainfall_history: List of daily rainfall in mm [today, yesterday, 2 days ago, ...]
        k: Decay factor (default 0.85)
    
    Returns:
        ARI value (higher = more saturated soil = higher risk)
    """
    if not rainfall_history:
        return 0.0
    
    ari = 0.0
    for i, rain in enumerate(rainfall_history):
        ari += (k ** i) * rain
    
    return round(ari, 2)


def calculate_48h_rainfall(rainfall_history: List[float]) -> float:
    """
    Calculate total rainfall in last 48 hours
    
    Args:
        rainfall_history: List of hourly rainfall in mm (most recent first)
    
    Returns:
        Total rainfall in mm
    """
    # Take first 48 entries (48 hours)
    last_48h = rainfall_history[:48] if len(rainfall_history) >= 48 else rainfall_history
    return round(sum(last_48h), 2)


def get_rainfall_trend(rainfall_history: List[float]) -> str:
    """
    Determine rainfall trend (increasing, decreasing, stable)
    
    Args:
        rainfall_history: List of hourly rainfall (most recent first)
    
    Returns:
        'increasing', 'decreasing', or 'stable'
    """
    if len(rainfall_history) < 6:
        return 'stable'
    
    # Compare last 3 hours vs previous 3 hours
    recent = sum(rainfall_history[:3])
    previous = sum(rainfall_history[3:6])
    
    diff = recent - previous
    
    if diff > 5:  # More than 5mm increase
        return 'increasing'
    elif diff < -5:  # More than 5mm decrease
        return 'decreasing'
    else:
        return 'stable'


def get_soil_moisture_status(moisture_percent: float) -> str:
    """
    Classify soil moisture status
    
    Args:
        moisture_percent: Soil moisture percentage (0-100)
    
    Returns:
        'Dry', 'Normal', 'Wet', or 'Saturated'
    """
    if moisture_percent < 30:
        return 'Dry'
    elif moisture_percent < 60:
        return 'Normal'
    elif moisture_percent < 80:
        return 'Wet'
    else:
        return 'Saturated'
