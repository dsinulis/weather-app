export function processData(data) {
    const conditionText = data.weather[0].description;
    const capitalizedCondition = conditionText.charAt(0).toUpperCase() + conditionText.slice(1);
    
    return {
        location: data.name,
        lat: data.coord.lat.toFixed(4),
        lon: data.coord.lon.toFixed(4),
        temp: Math.round(data.main.temp),
        feelslike: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        wind: data.wind.speed,
        pressure: Math.round(data.main.pressure * 0.75),
        condition: data.weather[0].main,
        conditionText: capitalizedCondition,
        timezone: data.timezone || 0
    };
}

export function getWeatherClass(condition) {
    const conditionMap = {
        'Clear': 'weather-widget--sunny',
        'Clouds': 'weather-widget--cloudy',
        'Rain': 'weather-widget--rainy',
        'Drizzle': 'weather-widget--rainy',
        'Thunderstorm': 'weather-widget--storm',
        'Snow': 'weather-widget--snow',
        'Mist': 'weather-widget--cloudy',
        'Fog': 'weather-widget--cloudy'
    };
    return conditionMap[condition] || 'weather-widget--default';
}

export function calculateLocalTime(timezone) {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    return new Date(utc + (timezone * 1000));
}

export function formatTime(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}