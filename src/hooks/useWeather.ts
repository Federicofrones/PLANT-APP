"use client";

import { useState, useEffect } from "react";
import { WeatherInfo } from "@/lib/utils";

interface WeatherData extends WeatherInfo {
    windSpeed: number;
    condition: string;
    isAlert: boolean;
    alertMsg: string;
    loading: boolean;
}

export const useWeather = () => {
    const [weather, setWeather] = useState<WeatherData>({
        temp: 0,
        rain: 0,
        humidity: 0,
        windSpeed: 0,
        condition: "Cargando...",
        isAlert: false,
        alertMsg: "",
        loading: true
    });

    const fetchWeather = async () => {
        try {
            // San José de Mayo, Uruguay
            const lat = -34.3375;
            const lon = -56.7136;
            const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,rain,wind_speed_10m,weather_code&hourly=precipitation_probability&forecast_days=1`;

            const response = await fetch(url);
            const data = await response.json();

            const current = data.current;
            const code = current.weather_code;

            let condition = "Despejado";
            if (code > 0 && code < 45) condition = "Nublado";
            if (code >= 45 && code < 60) condition = "Niebla";
            if (code >= 60 && code < 70) condition = "Lluvia";
            if (code >= 70 && code < 80) condition = "Nieve";
            if (code >= 80) condition = "Tormenta";

            let alertMsg = "";
            let isAlert = false;

            if (current.wind_speed_10m > 50) {
                isAlert = true;
                alertMsg = "Vientos fuertes";
            }
            if (code === 85 || code === 86 || code >= 95) {
                isAlert = true;
                alertMsg = "Riesgo de granizo";
            }

            setWeather({
                temp: Math.round(current.temperature_2m),
                humidity: current.relative_humidity_2m,
                rain: current.rain,
                windSpeed: current.wind_speed_10m,
                condition,
                isAlert,
                alertMsg,
                loading: false
            });
        } catch (error) {
            console.error("Error fetching weather:", error);
            setWeather(prev => ({ ...prev, loading: false }));
        }
    };

    useEffect(() => {
        fetchWeather();
        const timer = setInterval(fetchWeather, 300000); // 5 mins
        return () => clearInterval(timer);
    }, []);

    return weather;
};
