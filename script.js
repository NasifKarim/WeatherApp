// DOM element selections
// Selects the input field for city name and the search button
const cityInput = document.querySelector('.city-input');
const searchBtn = document.querySelector('.search-btn');

// Sections for displaying results or errors
const weatherInfoSection = document.querySelector('.weather-info');
const notFoundSection = document.querySelector('.not-found');
const searchCitySection = document.querySelector('.search-city');

// Elements where specific weather details will be shown
const countryTxt = document.querySelector('.country-txt');
const tempTxt = document.querySelector('.temp-txt');
const conditionTxt = document.querySelector('.condition-txt');
const humidityTxt = document.querySelector('.humidity-value-txt');
const windTxt = document.querySelector('.wind-value-txt');
const weatherSummaryImg = document.querySelector('.weather-summary-img');
const currentDateTxt = document.querySelector('.current-date-txt');

// Container for weather forecast items
const forecastItemsContainer = document.querySelector('.forecast-items-container');

// OpenWeatherMap API key
const apiKey = '4b7f61e0c5acf7b5a7db987305c62366';

// Event listener for search button click
// When the search button is clicked, it checks if the input field is not empty and triggers weather info update
searchBtn.addEventListener('click', () => {
    if (cityInput.value.trim() != '') {
        updateWeatherInfo(cityInput.value);  // Call function to fetch and update weather info
        cityInput.value = '';  // Clear the input field after search
        cityInput.blur();  // Remove focus from input field
    }
});

// Event listener for Enter key press in the input field
// Triggers the search when the Enter key is pressed and the input field is not empty
cityInput.addEventListener('keydown', (event) => {
    if (event.key == 'Enter' && cityInput.value.trim() != '') {
        updateWeatherInfo(cityInput.value);  // Fetch and update weather info
        cityInput.value = '';  // Clear the input field
        cityInput.blur();  // Remove focus from input field
    }
});

// Function to fetch data from OpenWeatherMap API
// Builds the API URL using the city name and fetches data in imperial units
async function getFetchData(endpoint, city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/${endpoint}?q=${city}&appid=${apiKey}&units=imperial`;
    
    const response = await fetch(apiUrl);  // Fetch data from the API
    return response.json();  // Parse the response as JSON
}

// Function to get appropriate weather icon based on weather condition ID
// Maps the weather condition ID from OpenWeatherMap to a specific icon
function getWeatherIcon(id) {
    if (id <= 232) return 'thunderstorm.svg';  // Thunderstorm conditions
    if (id <= 321) return 'drizzle.svg';       // Drizzle conditions
    if (id <= 531) return 'rain.svg';          // Rain conditions
    if (id <= 622) return 'snow.svg';          // Snow conditions
    if (id <= 781) return 'atmosphere.svg';    // Atmospheric conditions (fog, mist, etc.)
    if (id === 800) return 'clear.svg';        // Clear weather
    return 'clouds.svg';                       // Default to clouds if ID doesn't match above
}

// Function to get current date (not used in the current implementation)
// Formats the current date into 'weekday day month' format
function getCurrentDate() {
    const currentDate = new Date();
    const options = {
        weekday: 'short',
        day: '2-digit',
        month: 'short'
    };
    return currentDate.toLocaleDateString('en-GB', options);  // Returns formatted date
}

// Main function to update weather information
// Fetches the weather data, handles errors, and updates the DOM with weather info
async function updateWeatherInfo(city) {
    const weatherData = await getFetchData('weather', city);  // Fetch weather data for the city
    if (weatherData.cod != 200) {  // Check if the API returns a valid response
        showDisplaySection(notFoundSection);  // Show 'Not Found' section if city is invalid
        return;
    }

    // Destructuring relevant weather data from the API response
    const {
        name: country,
        main: { temp, humidity },
        weather: [{ id, main }],
        wind: { speed },
        timezone
    } = weatherData;
    
    // Calculate local time for the city based on its timezone
    const currentUtcTime = new Date().getTime() + new Date().getTimezoneOffset() * 60000;
    const localTime = new Date(currentUtcTime + timezone * 1000);
    const options = { weekday: 'short', day: '2-digit', month: 'short' };
    const localDateString = localTime.toLocaleDateString('en-GB', options);

    // Update DOM with weather information for the city
    countryTxt.textContent = country;
    tempTxt.textContent = Math.round(temp) + ' °F';
    conditionTxt.textContent = main;
    humidityTxt.textContent = humidity + '%';
    windTxt.textContent = Math.round(speed) + ' mph';
    currentDateTxt.textContent = localDateString;
    weatherSummaryImg.src = `assets/weather/${getWeatherIcon(id)}`;  // Update icon based on weather condition

    // Update forecast information
    await updateForecastInfo(city);  // Fetch and display forecast data
    showDisplaySection(weatherInfoSection);  // Show the weather information section
}

// Function to update forecast information
// Fetches forecast data and updates the forecast section with relevant entries
async function updateForecastInfo(city) {
    const forecastsData = await getFetchData('forecast', city);  // Fetch forecast data for the city

    const timeTaken = '12:00:00';  // Target time to display daily forecast (midday)
    const todayDate = new Date().toISOString().split('T')[0];  // Get today's date in ISO format
    
    forecastItemsContainer.innerHTML = '';  // Clear previous forecast items
    forecastsData.list.forEach(forecastWeather =>  {
        // Update forecast if it's the target time and not today's date
        if (forecastWeather.dt_txt.includes(timeTaken) && !forecastWeather.dt_txt.includes(todayDate)) {
            updateForecastItems(forecastWeather);  // Add forecast item to the DOM
        }
    });
}

// Function to update individual forecast items
// Generates and inserts the HTML for each forecast item
function updateForecastItems(weatherData) {
    console.log(weatherData);
    
    // Destructuring weather data for each forecast entry
    const {
        dt_txt: date,
        weather: [{ id }],
        main: { temp }
    } = weatherData;

    // Format the date for display
    const forecastDate = new Date(date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short'
    });

    // Create the HTML structure for a forecast item
    const foreCastItem = `
        <div class="forecast-item">
            <h5 class="forecast-item-date regular-txt">${forecastDate}</h5>
            <img src="assets/weather/${getWeatherIcon(id)}" class="forecast-item-img"/>
            <h5 class="forecast-item-temp">${Math.round(temp)} °F</h5>
        </div>
    `;

    // Insert the forecast item into the forecast container in the DOM
    forecastItemsContainer.insertAdjacentHTML('beforeend', foreCastItem);
}

// Function to show/hide different sections of the app
// Hides all sections and only displays the requested section
function showDisplaySection(section) {
    [weatherInfoSection, searchCitySection, notFoundSection].forEach(sec => sec.style.display = 'none');
    section.style.display = 'flex';  // Show the requested section
}
