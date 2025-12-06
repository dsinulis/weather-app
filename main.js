import { fetchWeather } from './weatherApi.js';
import { validateCoordinates } from './validation.js';
import { processData, getWeatherClass, calculateLocalTime, formatTime } from './weatherUtilities.js';

class WeatherApp {
    constructor() {
        this.widgets = [];
        this.init();
    }

    init() {
        document.getElementById('showWeather').addEventListener('click', () => this.addWeatherWidget());
        this.loadWidgets();
    }

    async addWeatherWidget() {
        const lat = document.getElementById('latitude').value;
        const lon = document.getElementById('longitude').value;
        const errorDiv = document.getElementById('errorMessage');

        const error = validateCoordinates(lat, lon);
        if (error) return errorDiv.textContent = error;

        errorDiv.textContent = '';
        this.setLoading(true);

        try {
            const weatherData = await fetchWeather(lat, lon);
            const weatherInfo = processData(weatherData);
            this.createWidget(weatherInfo, lat, lon);
            this.saveWidgets();
            this.clearInputs();
        } catch {
            errorDiv.textContent = 'Ошибка загрузки погоды';
        } finally {
            this.setLoading(false);
        }
    }

    createWidget(weatherInfo, lat, lon) {
        const widgetId = Date.now().toString();
        const widget = document.createElement('div');
        widget.className = `weather-widget ${getWeatherClass(weatherInfo.condition)}`;
        widget.id = widgetId;
        widget.dataset.timezone = weatherInfo.timezone;

        this.updateWidgetTime(widget);
        widget.innerHTML = this.getWidgetHTML(weatherInfo, lat, lon);

        document.getElementById('widgetsContainer').appendChild(widget);
        
        const timeInterval = setInterval(() => this.updateWidgetTime(widget), 1000);
        widget.dataset.intervalId = timeInterval;
        
        widget.querySelector('.weather-widget__delete').addEventListener('click', () => {
            clearInterval(widget.dataset.intervalId);
            this.deleteWidget(widgetId);
        });

        this.widgets.push({ id: widgetId, data: weatherInfo, lat, lon });
    }

    updateWidgetTime(widget) {
        const timezone = widget.dataset.timezone || 0;
        const localDate = calculateLocalTime(timezone);
        const currentTime = formatTime(localDate);
        
        const timeElement = widget.querySelector('.weather-widget__time');
        if (timeElement) timeElement.textContent = currentTime;
    }

    getWidgetHTML(weatherInfo, lat, lon) {
        const localDate = calculateLocalTime(weatherInfo.timezone);
        const currentTime = formatTime(localDate);
        
        return `
            <button class="weather-widget__delete">
                <img src="images/close.png" alt="Удалить" class="weather-widget__delete-icon">
            </button>
            <div class="weather-widget__header">
                <h3 class="weather-widget__title">${weatherInfo.location}</h3>
                <div class="weather-widget__time">${currentTime}</div>
            </div>
            <div class="weather-widget__coordinates">Координаты: ${weatherInfo.lat}, ${weatherInfo.lon}</div>
            <div class="weather-widget__temp">${weatherInfo.temp}°</div>
            <div class="weather-widget__condition">${weatherInfo.conditionText}</div>
            <div class="weather-widget__details">
                <div class="weather-widget__detail">
                    <div>Ощущается</div>
                    <div>${weatherInfo.feelslike}°</div>
                </div>
                <div class="weather-widget__detail">
                    <div>Влажность</div>
                    <div>${weatherInfo.humidity}%</div>
                </div>
                <div class="weather-widget__detail">
                    <div>Ветер</div>
                    <div>${weatherInfo.wind} м/с</div>
                </div>
                <div class="weather-widget__detail">
                    <div>Давление</div>
                    <div>${weatherInfo.pressure} мм</div>
                </div>
            </div>
            <div class="weather-widget__map">
                <iframe 
                    class="weather-widget__map-iframe"
                    frameborder="0" 
                    src="https://yandex.ru/map-widget/v1/?ll=${lon},${lat}&z=12&pt=${lon},${lat},pm2rdm">
                </iframe>
            </div>
        `;
    }

    deleteWidget(id) {
        const widget = document.getElementById(id);
        if (widget?.dataset.intervalId) clearInterval(widget.dataset.intervalId);
        widget?.remove();
        this.widgets = this.widgets.filter(w => w.id !== id);
        this.saveWidgets();
    }

    setLoading(loading) {
        const btn = document.getElementById('showWeather');
        btn.disabled = loading;
        btn.textContent = loading ? 'Загрузка...' : 'Показать погоду';
    }

    clearInputs() {
        document.getElementById('latitude').value = '';
        document.getElementById('longitude').value = '';
    }

    saveWidgets() {
        localStorage.setItem('weatherWidgets', JSON.stringify(this.widgets));
    }

    loadWidgets() {
        const saved = localStorage.getItem('weatherWidgets');
        if (!saved) return;

        this.widgets = JSON.parse(saved);
        this.widgets.forEach(widget => {
            const widgetElement = document.createElement('div');
            widgetElement.className = `weather-widget ${getWeatherClass(widget.data.condition)}`;
            widgetElement.id = widget.id;
            widgetElement.dataset.timezone = widget.data.timezone || 0;
            
            const localDate = calculateLocalTime(widget.data.timezone || 0);
            const currentTime = formatTime(localDate);
            
            widgetElement.innerHTML = this.getWidgetHTML(
                {...widget.data, localTime: currentTime}, 
                widget.lat, 
                widget.lon
            );

            document.getElementById('widgetsContainer').appendChild(widgetElement);
            
            const timeInterval = setInterval(() => this.updateWidgetTime(widgetElement), 1000);
            widgetElement.dataset.intervalId = timeInterval;
            
            widgetElement.querySelector('.weather-widget__delete').addEventListener('click', () => {
                clearInterval(widgetElement.dataset.intervalId);
                this.deleteWidget(widget.id);
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new WeatherApp();
});