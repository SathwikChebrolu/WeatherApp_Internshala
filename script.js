// Weather Dashboard Script

// API key for OpenWeatherMap
const apiKey = '6674019b4b9b17375c49f4a1d739dec2';

// DOM Elements
const cityInput = document.getElementById('city');
const searchBtn = document.getElementById('searchBtn');
const currentLocationBtn = document.getElementById('currentLocationBtn');
const recentCitiesDropdown = document.getElementById('recentCitiesDropdown');
const recentCities = document.getElementById('recentCities');
const weatherData = document.getElementById('weatherData');
const cityName = document.getElementById('cityName');
const weatherIcon = document.getElementById('weatherIcon');
const temperature = document.getElementById('temperature');
const conditions = document.getElementById('conditions');
const wind = document.getElementById('wind');
const humidity = document.getElementById('humidity');
const forecast = document.getElementById('forecast');
const errorMessage = document.getElementById('errorMessage');

// Retrieve recent cities from localStorage
const recentCitiesList = JSON.parse(localStorage.getItem('recentCities')) || [];

// Update dropdown with recent cities
function updateDropdown() {
  recentCities.innerHTML = '';
  recentCitiesList.forEach(city => {
    const option = document.createElement('option');
    option.value = city;
    option.textContent = city;
    recentCities.appendChild(option);
  });
  recentCitiesDropdown.classList.toggle('hidden', recentCitiesList.length === 0);
}

// Fetch current weather data for a city
function fetchWeatherData(city) {
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
    .then(response => {
      if (!response.ok) throw new Error('City not found');
      return response.json();
    })
    .then(data => {
      displayCurrentWeather(data);
      return fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`);
    })
    .then(response => response.json())
    .then(displayForecast)
    .catch(err => {
      errorMessage.textContent = err.message;
      errorMessage.classList.remove('hidden');
    });
}

// Display current weather information
function displayCurrentWeather(data) {
  cityName.textContent = `${data.name} (${new Date().toISOString().split('T')[0]})`;
  weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  temperature.textContent = `Temperature: ${data.main.temp} °C`;
  conditions.textContent = data.weather[0].description;
  wind.textContent = `Wind: ${data.wind.speed} m/s`;
  humidity.textContent = `Humidity: ${data.main.humidity}%`;
  weatherData.classList.remove('hidden');
  errorMessage.classList.add('hidden');
}

// Display 5-day forecast
function displayForecast(data) {
  forecast.innerHTML = '';
  data.list.filter((_, index) => index % 8 === 0).forEach(day => {
    const div = document.createElement('div');
    div.classList.add('bg-gray-200', 'p-4', 'rounded', 'text-center');
    div.innerHTML = `
      <p>${day.dt_txt.split(' ')[0]}</p>
      <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="" class="mx-auto">
      <p>${day.main.temp} °C</p>
      <p>Wind: ${day.wind.speed} m/s</p>
      <p>Humidity: ${day.main.humidity}%</p>
    `;
    forecast.appendChild(div);
  });
}

// Event listeners for buttons
searchBtn.addEventListener('click', () => {
  const city = cityInput.value.trim();
  if (!city) {
    errorMessage.textContent = 'Please enter a city name';
    errorMessage.classList.remove('hidden');
    return;
  }
  fetchWeatherData(city);
  if (!recentCitiesList.includes(city)) {
    recentCitiesList.push(city);
    localStorage.setItem('recentCities', JSON.stringify(recentCitiesList));
    updateDropdown();
  }
});

currentLocationBtn.addEventListener('click', () => {
  navigator.geolocation.getCurrentPosition(position => {
    const { latitude, longitude } = position.coords;
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`)
      .then(response => response.json())
      .then(data => {
        displayCurrentWeather(data);
      })
      .catch(err => {
        errorMessage.textContent = err.message;
        errorMessage.classList.remove('hidden');
      });
  });
});

// Initialize dropdown on page load
updateDropdown();
