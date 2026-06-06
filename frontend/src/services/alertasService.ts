const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class AlertasService {
async obtenerMisNotificaciones() {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/alertas/mis-notificaciones`, {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    },
    });
    if (!res.ok) throw new Error('Error al obtener notificaciones');
    return res.json();
}

async marcarComoLeidas() {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/alertas/marcar-leidas`, {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    },
    });
    if (!res.ok) throw new Error('Error al marcar notificaciones');
    return res.json();
}
}

const alertasService = new AlertasService();
export default alertasService;