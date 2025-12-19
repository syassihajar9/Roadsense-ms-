# simulation.py

COST_TABLE = {
    "pothole": 500,
    "crack": 300,
    "open_manhole": 800
}

def calculate_cost(damage_type: str, severity: int) -> int:
    base_cost = COST_TABLE.get(damage_type.lower(), 400)
    return base_cost + severity * 20


def future_risk(severity: int, days: int) -> int:
    """
    Estime le risque (%) en fonction de la gravité et du temps.
    """
    risk = min(100, int(severity * (days / 30)))
    return risk


def recommendation(severity: int) -> str:
    if severity >= 80:
        return "Intervention immédiate requise"
    elif severity >= 50:
        return "Intervention recommandée sous 30 jours"
    else:
        return "Surveillance recommandée"
