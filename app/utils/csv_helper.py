import csv
import io
from typing import List, Dict, Any

def generar_csv(datos: List[Dict[str, Any]], campos: List[str]) -> str:
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=campos)
    writer.writeheader()
    for fila in datos:
        writer.writerow(fila)
    return output.getvalue()
