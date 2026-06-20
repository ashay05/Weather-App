const searchForm = document.querySelector("#searchForm");
const cityInput = document.querySelector("#cityInput");
const statusText = document.querySelector("#status");
const cityPhotoFrame = document.querySelector("#cityPhotoFrame");
const cityPhoto = document.querySelector("#cityPhoto");
const cityPhotoCaption = document.querySelector("#cityPhotoCaption");
const currentWeather = document.querySelector("#currentWeather");
const forecast = document.querySelector("#forecast");
const locationButton = document.querySelector("#locationButton");

const placeName = document.querySelector("#placeName");
const dateText = document.querySelector("#dateText");
const weatherIcon = document.querySelector("#weatherIcon");
const temperature = document.querySelector("#temperature");
const condition = document.querySelector("#condition");
const feelsLike = document.querySelector("#feelsLike");
const wind = document.querySelector("#wind");
const humidity = document.querySelector("#humidity");
const rainChance = document.querySelector("#rainChance");
const forecastList = document.querySelector("#forecastList");
const forecastTitle = document.querySelector("#forecastTitle");
const updatedAt = document.querySelector("#updatedAt");

let currentPlace = null;
let photoRequestId = 0;
let cityClockTimer = null;

const weatherCodes = {
  0: ["Clear sky", "SUN"],
  1: ["Mainly clear", "SUN"],
  2: ["Partly cloudy", "CLD"],
  3: ["Overcast", "CLD"],
  45: ["Fog", "FOG"],
  48: ["Rime fog", "FOG"],
  51: ["Light drizzle", "DRZ"],
  53: ["Drizzle", "DRZ"],
  55: ["Heavy drizzle", "DRZ"],
  56: ["Freezing drizzle", "ICE"],
  57: ["Freezing drizzle", "ICE"],
  61: ["Light rain", "RAIN"],
  63: ["Rain", "RAIN"],
  65: ["Heavy rain", "RAIN"],
  66: ["Freezing rain", "ICE"],
  67: ["Freezing rain", "ICE"],
  71: ["Light snow", "SNOW"],
  73: ["Snow", "SNOW"],
  75: ["Heavy snow", "SNOW"],
  77: ["Snow grains", "SNOW"],
  80: ["Rain showers", "RAIN"],
  81: ["Rain showers", "RAIN"],
  82: ["Heavy showers", "RAIN"],
  85: ["Snow showers", "SNOW"],
  86: ["Snow showers", "SNOW"],
  95: ["Thunderstorm", "STRM"],
  96: ["Thunderstorm hail", "STRM"],
  99: ["Thunderstorm hail", "STRM"],
};

const famousPlaces = {
  agra: "Taj Mahal",
  amsterdam: "Rijksmuseum",
  athens: "Acropolis",
  bangalore: "Bangalore Palace",
  bengaluru: "Bangalore Palace",
  beijing: "Forbidden City",
  berlin: "Brandenburg Gate",
  chicago: "Millennium Park",
  delhi: "India Gate",
  dubai: "Burj Khalifa",
  hyderabad: "Charminar",
  jaipur: "Hawa Mahal",
  kolkata: "Victoria Memorial",
  london: "Big Ben",
  los: "Hollywood Sign",
  losangeles: "Hollywood Sign",
  madrid: "Royal Palace of Madrid",
  mumbai: "Gateway of India",
  new: "India Gate",
  newdelhi: "India Gate",
  newyork: "Statue of Liberty",
  newyorkcity: "Statue of Liberty",
  paris: "Eiffel Tower",
  pune: "Shaniwar Wada",
  rome: "Colosseum",
  san: "Golden Gate Bridge",
  sanfrancisco: "Golden Gate Bridge",
  singapore: "Marina Bay Sands",
  sydney: "Sydney Opera House",
  tokyo: "Tokyo Tower",
  toronto: "CN Tower",
};

function setStatus(message, isError = false) {
  statusText.textContent = message;
  statusText.classList.toggle("error", isError);
}

function describeOpenMeteo(code) {
  return weatherCodes[code] ?? ["Unknown", "TEMP"];
}

function formatDay(dateString, style = "short") {
  return new Intl.DateTimeFormat("en", {
    weekday: style,
    month: "short",
    day: "numeric",
  }).format(new Date(`${dateString}T12:00:00`));
}

function round(value) {
  return Math.round(Number(value));
}

function titleCase(value) {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function hashText(value) {
  return Array.from(value).reduce((hash, character) => {
    return (hash * 31 + character.charCodeAt(0)) % 100000;
  }, 7);
}

function cityImageDataUrl(city, conditionText) {
  const hash = hashText(`${city}-${conditionText}`);
  const hue = hash % 360;
  const accentHue = (hue + 52) % 360;
  const skylineHue = (hue + 205) % 360;
  const escapedCity = city.replace(/[&<>"']/g, (character) => {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&apos;",
    }[character];
  });
  const escapedCondition = conditionText.replace(/[&<>"']/g, (character) => {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&apos;",
    }[character];
  });
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="hsl(${hue} 74% 52%)"/>
          <stop offset="58%" stop-color="hsl(${accentHue} 68% 62%)"/>
          <stop offset="100%" stop-color="hsl(${skylineHue} 58% 24%)"/>
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#sky)"/>
      <circle cx="${220 + (hash % 260)}" cy="${140 + (hash % 90)}" r="92" fill="rgba(255,255,255,0.58)"/>
      <circle cx="${1080 + (hash % 180)}" cy="${150 + (hash % 120)}" r="130" fill="rgba(255,255,255,0.16)"/>
      <path d="M0 650 C220 570 340 690 560 610 C780 530 900 640 1110 570 C1320 500 1420 575 1600 515 L1600 900 L0 900 Z" fill="rgba(255,255,255,0.18)"/>
      <g fill="hsl(${skylineHue} 48% 18%)">
        <rect x="80" y="510" width="120" height="390"/>
        <rect x="230" y="430" width="170" height="470"/>
        <rect x="430" y="560" width="110" height="340"/>
        <rect x="590" y="470" width="210" height="430"/>
        <rect x="840" y="530" width="135" height="370"/>
        <rect x="1010" y="390" width="180" height="510"/>
        <rect x="1235" y="500" width="125" height="400"/>
        <rect x="1400" y="455" width="150" height="445"/>
      </g>
      <g fill="rgba(255,255,255,0.22)">
        <rect x="120" y="560" width="28" height="28"/>
        <rect x="275" y="490" width="32" height="32"/>
        <rect x="335" y="490" width="32" height="32"/>
        <rect x="650" y="530" width="34" height="34"/>
        <rect x="720" y="530" width="34" height="34"/>
        <rect x="1070" y="455" width="34" height="34"/>
        <rect x="1135" y="455" width="34" height="34"/>
        <rect x="1445" y="520" width="32" height="32"/>
      </g>
      <rect x="0" y="0" width="1600" height="900" fill="rgba(0,0,0,0.18)"/>
      <text x="90" y="690" fill="white" font-family="Inter, Arial, sans-serif" font-size="96" font-weight="800">${escapedCity}</text>
      <text x="94" y="765" fill="rgba(255,255,255,0.86)" font-family="Inter, Arial, sans-serif" font-size="42" font-weight="700">${escapedCondition}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function famousPlaceImageDataUrl(city, famousPlace) {
  const hash = hashText(`${city}-${famousPlace}`);
  const hue = (hash + 18) % 360;
  const darkHue = (hue + 210) % 360;
  const escapedCity = city.replace(/[&<>"']/g, (character) => {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&apos;",
    }[character];
  });
  const escapedPlace = famousPlace.replace(/[&<>"']/g, (character) => {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&apos;",
    }[character];
  });
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="hsl(${hue} 78% 54%)"/>
          <stop offset="54%" stop-color="hsl(${(hue + 34) % 360} 72% 64%)"/>
          <stop offset="100%" stop-color="hsl(${darkHue} 46% 20%)"/>
        </linearGradient>
      </defs>
      <rect width="1600" height="900" fill="url(#sky)"/>
      <circle cx="1240" cy="160" r="118" fill="rgba(255,255,255,0.38)"/>
      <path d="M0 650 C180 590 355 690 535 610 C760 510 910 650 1125 555 C1325 470 1440 545 1600 500 L1600 900 L0 900 Z" fill="rgba(255,255,255,0.18)"/>
      <g fill="hsl(${darkHue} 45% 18%)">
        <rect x="475" y="385" width="650" height="360" rx="18"/>
        <rect x="560" y="300" width="480" height="95" rx="12"/>
        <path d="M515 300 L800 145 L1085 300 Z"/>
        <rect x="385" y="470" width="90" height="275" rx="12"/>
        <rect x="1125" y="470" width="90" height="275" rx="12"/>
        <path d="M360 470 L430 345 L500 470 Z"/>
        <path d="M1100 470 L1170 345 L1240 470 Z"/>
      </g>
      <g fill="rgba(255,255,255,0.2)">
        <rect x="605" y="455" width="70" height="90" rx="35"/>
        <rect x="765" y="455" width="70" height="90" rx="35"/>
        <rect x="925" y="455" width="70" height="90" rx="35"/>
        <rect x="705" y="610" width="190" height="135" rx="95"/>
      </g>
      <rect x="0" y="0" width="1600" height="900" fill="rgba(0,0,0,0.14)"/>
      <text x="90" y="690" fill="white" font-family="Inter, Arial, sans-serif" font-size="92" font-weight="800">${escapedPlace}</text>
      <text x="94" y="765" fill="rgba(255,255,255,0.86)" font-family="Inter, Arial, sans-serif" font-size="40" font-weight="700">${escapedCity}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function getCityName(place) {
  return place.name.split(",")[0].trim() || "weather";
}

function famousPlaceForCity(city) {
  const normalized = city.toLowerCase().replace(/[^a-z]/g, "");
  const firstWord = city.toLowerCase().split(/\s+/)[0];
  return famousPlaces[normalized] ?? famousPlaces[firstWord] ?? `${city} landmark`;
}

function formatCityDateTime(place) {
  const options = {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  };

  if (place.timezone && place.timezone !== "auto") {
    options.timeZone = place.timezone;
  }

  return new Intl.DateTimeFormat("en", options).format(new Date());
}

function updateCityClock() {
  if (!currentPlace) {
    return;
  }

  dateText.textContent = formatCityDateTime(currentPlace);
}

function startCityClock() {
  updateCityClock();
  window.clearInterval(cityClockTimer);
  cityClockTimer = window.setInterval(updateCityClock, 60000);
}

async function fetchJson(url, message) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(message);
  }

  return response.json();
}

async function searchPlace(query) {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.search = new URLSearchParams({
    name: query,
    count: "1",
    language: "en",
    format: "json",
  });

  const data = await fetchJson(url, "Could not search that location.");
  const result = data.results?.[0];

  if (!result) {
    throw new Error("No matching city found.");
  }

  return {
    name: [result.name, result.admin1, result.country].filter(Boolean).join(", "),
    latitude: result.latitude,
    longitude: result.longitude,
    timezone: result.timezone,
  };
}

async function reversePlace(latitude, longitude) {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/reverse");
  url.search = new URLSearchParams({
    latitude,
    longitude,
    count: "1",
    language: "en",
    format: "json",
  });

  const data = await fetchJson(url, "Could not identify your location.");
  const result = data.results?.[0];

  return {
    name: result ? [result.name, result.admin1, result.country].filter(Boolean).join(", ") : "Current location",
    latitude,
    longitude,
    timezone: result?.timezone ?? "auto",
  };
}

async function fetchOpenMeteoWeather(place) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.search = new URLSearchParams({
    latitude: place.latitude,
    longitude: place.longitude,
    timezone: place.timezone || "auto",
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
  });

  const data = await fetchJson(url, "Could not load the forecast.");
  const [summary, iconLabel] = describeOpenMeteo(data.current.weather_code);

  return {
    provider: "Open-Meteo",
    current: {
      time: data.current.time,
      temperature: data.current.temperature_2m,
      feelsLike: data.current.apparent_temperature,
      humidity: data.current.relative_humidity_2m,
      windKmh: data.current.wind_speed_10m,
      rainChance: data.daily.precipitation_probability_max?.[0] ?? 0,
      summary,
      iconLabel,
    },
    daily: data.daily.time.map((date, index) => {
      const [daySummary, dayIconLabel] = describeOpenMeteo(data.daily.weather_code[index]);
      return {
        date,
        summary: daySummary,
        iconLabel: dayIconLabel,
        high: data.daily.temperature_2m_max[index],
        low: data.daily.temperature_2m_min[index],
        rainChance: data.daily.precipitation_probability_max[index] ?? 0,
      };
    }),
  };
}

async function fetchOpenWeatherMapWeather(place, apiKey) {
  const commonParams = {
    lat: place.latitude,
    lon: place.longitude,
    appid: apiKey,
    units: "metric",
  };

  const currentUrl = new URL("https://api.openweathermap.org/data/2.5/weather");
  currentUrl.search = new URLSearchParams(commonParams);

  const forecastUrl = new URL("https://api.openweathermap.org/data/2.5/forecast");
  forecastUrl.search = new URLSearchParams(commonParams);

  const [currentData, forecastData] = await Promise.all([
    fetchJson(currentUrl, "OpenWeatherMap current weather failed. Check the API key."),
    fetchJson(forecastUrl, "OpenWeatherMap forecast failed. Check the API key."),
  ]);

  const days = new Map();

  forecastData.list.forEach((item) => {
    const date = item.dt_txt.slice(0, 10);
    const hour = Number(item.dt_txt.slice(11, 13));
    const rainChanceValue = round((item.pop ?? 0) * 100);
    const sample = {
      summary: titleCase(item.weather?.[0]?.description ?? "Forecast"),
      iconUrl: item.weather?.[0]?.icon ? `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png` : "",
      distanceFromNoon: Math.abs(hour - 12),
    };

    if (!days.has(date)) {
      days.set(date, {
        date,
        high: item.main.temp_max,
        low: item.main.temp_min,
        rainChance: rainChanceValue,
        ...sample,
      });
      return;
    }

    const day = days.get(date);
    day.high = Math.max(day.high, item.main.temp_max);
    day.low = Math.min(day.low, item.main.temp_min);
    day.rainChance = Math.max(day.rainChance, rainChanceValue);

    if (sample.distanceFromNoon < day.distanceFromNoon) {
      day.summary = sample.summary;
      day.iconUrl = sample.iconUrl;
      day.distanceFromNoon = sample.distanceFromNoon;
    }
  });

  return {
    provider: "OpenWeatherMap",
    current: {
      time: new Date(currentData.dt * 1000).toISOString(),
      temperature: currentData.main.temp,
      feelsLike: currentData.main.feels_like,
      humidity: currentData.main.humidity,
      windKmh: currentData.wind.speed * 3.6,
      rainChance: round((forecastData.list[0]?.pop ?? 0) * 100),
      summary: titleCase(currentData.weather?.[0]?.description ?? "Current Weather"),
      iconUrl: currentData.weather?.[0]?.icon ? `https://openweathermap.org/img/wn/${currentData.weather[0].icon}@2x.png` : "",
    },
    daily: Array.from(days.values()).slice(0, 5),
  };
}

function renderIcon(container, weather) {
  container.textContent = "";

  if (weather.iconUrl) {
    const image = document.createElement("img");
    image.src = weather.iconUrl;
    image.alt = "";
    container.append(image);
    return;
  }

  container.textContent = weather.iconLabel ?? "TEMP";
}

function setCityPhoto(src, alt, caption) {
  cityPhoto.style.opacity = "0";
  cityPhoto.src = src;
  cityPhoto.alt = alt;
  cityPhotoCaption.textContent = caption;
  cityPhotoFrame.hidden = false;
  window.requestAnimationFrame(() => {
    cityPhoto.style.opacity = "1";
  });
}

async function fetchWikipediaCityImage(city) {
  const url = new URL("https://en.wikipedia.org/w/api.php");
  url.search = new URLSearchParams({
    action: "query",
    origin: "*",
    format: "json",
    generator: "search",
    gsrsearch: `${city} city`,
    gsrlimit: "1",
    prop: "pageimages",
    piprop: "original",
  });

  const data = await fetchJson(url, "Could not load city image.");
  const page = Object.values(data.query?.pages ?? {})[0];
  return page?.original?.source ?? "";
}

async function updateCityPhoto(place, data) {
  const requestId = ++photoRequestId;
  const city = getCityName(place);
  const conditionText = data.current.summary || "weather";
  const generatedUrl = cityImageDataUrl(city, conditionText);

  setCityPhoto(generatedUrl, `${place.name} city image`, place.name);

  try {
    const wikipediaImage = await fetchWikipediaCityImage(city);
    if (requestId !== photoRequestId) {
      return;
    }
    setCityPhoto(wikipediaImage || generatedUrl, `${place.name} city view`, place.name);
  } catch {
    if (requestId !== photoRequestId) {
      return;
    }
    setCityPhoto(generatedUrl, `${place.name} city view`, place.name);
  }
}

function showFamousPlace() {
  if (!currentPlace) {
    return;
  }

  photoRequestId += 1;
  const city = getCityName(currentPlace);
  const famousPlace = famousPlaceForCity(city);
  const famousPlaceUrl = famousPlaceImageDataUrl(city, famousPlace);
  setCityPhoto(famousPlaceUrl, `${famousPlace} in ${currentPlace.name}`, famousPlace);
}

async function fetchWeather(place) {
  return fetchOpenMeteoWeather(place);
}

function renderWeather(place, data) {
  const current = data.current;
  currentPlace = place;

  updateCityPhoto(place, data);
  placeName.textContent = place.name;
  startCityClock();
  renderIcon(weatherIcon, current);
  temperature.textContent = round(current.temperature);
  condition.textContent = current.summary;
  feelsLike.textContent = round(current.feelsLike);
  wind.textContent = round(current.windKmh);
  humidity.textContent = round(current.humidity);
  rainChance.textContent = current.rainChance;
  forecastTitle.textContent = `${data.daily.length}-day forecast`;
  updatedAt.textContent = data.provider;

  forecastList.textContent = "";
  data.daily.forEach((day, index) => {
    const article = document.createElement("article");
    article.className = "forecast-day";

    const dayName = document.createElement("p");
    dayName.className = "day";
    dayName.textContent = index === 0 ? "Today" : formatDay(day.date);

    const icon = document.createElement("div");
    icon.className = "mini-icon";
    icon.setAttribute("aria-hidden", "true");
    renderIcon(icon, day);

    const summary = document.createElement("p");
    summary.textContent = day.summary;

    const temps = document.createElement("p");
    temps.className = "temps";
    temps.innerHTML = `${round(day.high)}&deg; / ${round(day.low)}&deg;`;

    const rain = document.createElement("p");
    rain.className = "rain";
    rain.textContent = `${day.rainChance}% rain`;

    article.append(dayName, icon, summary, temps, rain);
    forecastList.append(article);
  });

  currentWeather.hidden = false;
  forecast.hidden = false;
}

async function loadPlace(place) {
  setStatus("Loading forecast...");

  try {
    const data = await fetchWeather(place);
    renderWeather(place, data);
    setStatus("");
  } catch (error) {
    setStatus(error.message, true);
  }
}

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const query = cityInput.value.trim();

  if (!query) {
    setStatus("Enter a city to search.", true);
    return;
  }

  setStatus("Searching...");

  try {
    const place = await searchPlace(query);
    await loadPlace(place);
  } catch (error) {
    setStatus(error.message, true);
  }
});

locationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    setStatus("Your browser does not support location lookup.", true);
    return;
  }

  setStatus("Requesting your location...");
  navigator.geolocation.getCurrentPosition(
    async ({ coords }) => {
      try {
        const place = await reversePlace(coords.latitude, coords.longitude);
        await loadPlace(place);
      } catch (error) {
        setStatus(error.message, true);
      }
    },
    () => setStatus("Location permission was denied.", true),
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
  );
});

placeName.addEventListener("click", showFamousPlace);

loadPlace({
  name: "New Delhi, Delhi, India",
  latitude: 28.6139,
  longitude: 77.209,
  timezone: "Asia/Kolkata",
});
