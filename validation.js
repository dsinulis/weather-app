export function validateCoordinates(lat, lon) {
    if (!lat || !lon) return 'Заполните все поля';
    
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    
    if (isNaN(latNum) || isNaN(lonNum)) return 'Координаты должны быть числами';
    if (latNum < -90 || latNum > 90) return 'Широта от -90 до 90';
    if (lonNum < -180 || lonNum > 180) return 'Долгота от -180 до 180';
    
    return null;
}