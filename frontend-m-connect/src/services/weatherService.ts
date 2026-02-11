// src/services/weatherService.ts

interface WeatherData {
  id: number;
  title: string;
  description: string;
  image: string;
  type: string;
  ctaText?: string;
  bgColor?: string;
  temperature?: number;
  precipitation?: number;
}

export async function getWeatherTips(): Promise<WeatherData> {
  try {
    // For Dar es Salaam coordinates
    const url =
      "https://api.open-meteo.com/v1/forecast?latitude=-6.8&longitude=39.2&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode&timezone=Africa/Nairobi&forecast_days=1";

    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    
    const data = await res.json();

    const maxTemp = data.daily.temperature_2m_max[0];
    const minTemp = data.daily.temperature_2m_min[0];
    const rain = data.daily.precipitation_sum[0];
    const weatherCode = data.daily.weathercode[0];

    // Weather code mapping (WMO)
    const weatherConditions: Record<number, { text: string; icon: string }> = {
      0: { text: "Clear sky", icon: "sunny" },
      1: { text: "Mainly clear", icon: "partly-sunny" },
      2: { text: "Partly cloudy", icon: "partly-sunny" },
      3: { text: "Overcast", icon: "cloudy" },
      45: { text: "Foggy", icon: "cloudy" },
      48: { text: "Depositing rime fog", icon: "cloudy" },
      51: { text: "Light drizzle", icon: "rainy" },
      53: { text: "Moderate drizzle", icon: "rainy" },
      55: { text: "Dense drizzle", icon: "rainy" },
      61: { text: "Slight rain", icon: "rainy" },
      63: { text: "Moderate rain", icon: "rainy" },
      65: { text: "Heavy rain", icon: "rainy" },
      80: { text: "Rain showers", icon: "rainy" },
      95: { text: "Thunderstorm", icon: "thunderstorm" },
    };

    const condition = weatherConditions[weatherCode] || { text: "Fair", icon: "partly-sunny" };
    
    let tip = "";
    let bgColor = "#3b82f6"; // Default blue
    
    if (rain > 10) {
      tip = "Heavy rain expected today. Avoid field work and postpone pesticide application.";
      bgColor = "#1d4ed8"; // Dark blue
    } else if (rain > 5) {
      tip = "Rain expected. Good day for planting and soil preparation.";
      bgColor = "#2563eb"; // Medium blue
    } else if (rain > 1) {
      tip = "Light rain forecasted. Perfect for watering seedlings naturally.";
      bgColor = "#60a5fa"; // Light blue
    } else if (maxTemp > 32) {
      tip = "Hot day ahead. Ensure proper irrigation and avoid midday fieldwork.";
      bgColor = "#dc2626"; // Red
    } else if (maxTemp > 28) {
      tip = "Warm day. Good for drying harvests and outdoor activities.";
      bgColor = "#ea580c"; // Orange
    } else if (minTemp < 18) {
      tip = "Cool night expected. Protect sensitive plants and seedlings.";
      bgColor = "#0369a1"; // Teal blue
    } else {
      tip = "Excellent weather for all farming activities today.";
      bgColor = "#059669"; // Green
    }

    return {
      id: 999,
      title: `Weather Alert: ${condition.text}`,
      description: `${tip} Temp: ${maxTemp}°C (Max), ${minTemp}°C (Min)`,
      image: getWeatherImage(weatherCode),
      type: "weather",
      ctaText: "View Full Forecast",
      bgColor,
      temperature: maxTemp,
      precipitation: rain,
    };
  } catch (error) {
    console.error("Weather API error:", error);
    return {
      id: 999,
      title: "Weather Updates",
      description: "Real-time weather data temporarily unavailable. Check local forecasts.",
      image: "https://images.pexels.com/photos/125510/pexels-photo-125510.jpeg",
      type: "weather",
      ctaText: "Try Again",
      bgColor: "#6b7280",
    };
  }
}

function getWeatherImage(weatherCode: number): string {
  const imageMap: Record<number, string> = {
    0: "https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg", // Clear
    1: "https://images.pexels.com/photos/125510/pexels-photo-125510.jpeg", // Mainly clear
    2: "https://images.pexels.com/photos/912364/pexels-photo-912364.jpeg", // Partly cloudy
    3: "https://images.pexels.com/photos/167699/pexels-photo-167699.jpeg", // Overcast
    45: "https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg", // Fog
    48: "https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg", // Fog
    51: "https://images.pexels.com/photos/39811/pexels-photo-39811.jpeg", // Drizzle
    53: "https://images.pexels.com/photos/39811/pexels-photo-39811.jpeg", // Drizzle
    55: "https://images.pexels.com/photos/39811/pexels-photo-39811.jpeg", // Drizzle
    61: "https://images.pexels.com/photos/459451/pexels-photo-459451.jpeg", // Rain
    63: "https://images.pexels.com/photos/459451/pexels-photo-459451.jpeg", // Rain
    65: "https://images.pexels.com/photos/459451/pexels-photo-459451.jpeg", // Rain
    80: "https://images.pexels.com/photos/125510/pexels-photo-125510.jpeg", // Showers
    95: "https://images.pexels.com/photos/1162251/pexels-photo-1162251.jpeg", // Thunderstorm
  };
  
  return imageMap[weatherCode] || "https://images.pexels.com/photos/125510/pexels-photo-125510.jpeg";
}

// Get weather for specific location
export async function getLocationWeather(lat: number, lon: number): Promise<WeatherData> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Africa/Nairobi`;
    
    const res = await fetch(url);
    const data = await res.json();
    
    // Process data similar to getWeatherTips
    return getWeatherTips(); // Simplified for now
  } catch (error) {
    throw new Error("Failed to fetch location weather");
  }
}