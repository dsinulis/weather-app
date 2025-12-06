const API_KEY = '854d868bc88a2295cdb828aef76aded0';

export async function fetchWeather(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=ru`;
    const response = await fetch(url);
    
    if (!response.ok) throw new Error('Ошибка сети');
    
    const data = await response.json();
    if (data.cod !== 200) throw new Error(data.message);
    
    return data;
}