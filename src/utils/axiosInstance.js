// Ce fichier permet de gerer les requel axios de maniere personnalise, pas besoin de toutjours repeter les autorisation, ou rafraichir le token ou se deconnecter apres expiration etc...   C'est une version personnalise
// src/utils/axiosInstance.js
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import config from "../config/config";
import { handleError } from "./errorHandler";

// Création d'une instance axios avec la configuration de base
const axiosInstance = axios.create({
  baseURL: config.API_URL,
  timeout: config.REQUEST_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
  withCredentials: true
});

// Variable pour stocker la requête de rafraîchissement du token en cours
let refreshTokenRequest = null;

// Fonction pour rafraîchir le token
const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await axios.post(`${config.API_URL}token/refresh/`, {
      refresh: refreshToken,
    });

    localStorage.setItem("access_token", response.data.access);
    return response.data.access;
  } catch (error) {
    localStorage.clear();
    window.location.href = "/login";
    throw error;
  }
};

// Fonction pour gérer les réponses de pagination Django
const handleDjangoPagination = (response) => {
  if (response.data && typeof response.data === 'object' && 'results' in response.data) {
    return {
      data: response.data.results,
      pagination: {
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous,
        currentPage: response.data.current_page,
        totalPages: response.data.total_pages,
        pageSize: response.data.page_size
      }
    };
  }
  return response;
};

// Intercepteur pour les requêtes
axiosInstance.interceptors.request.use(async (config) => {
  const accessToken = localStorage.getItem("access_token");

  if (accessToken) {
    try {
      const decoded = jwtDecode(accessToken);
      const currentTime = Date.now() / 1000;

      // Si le token expire dans moins de 5 minutes
      if (decoded.exp < currentTime + 300) {
        refreshTokenRequest = refreshTokenRequest || refreshToken();
        const newToken = await refreshTokenRequest;
        config.headers.Authorization = `Bearer ${newToken}`;
        refreshTokenRequest = null;
      } else {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      localStorage.clear();
      window.location.href = "/login";
    }
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Intercepteur pour les réponses
axiosInstance.interceptors.response.use(
  (response) => handleDjangoPagination(response),
  async (error) => {
    const originalRequest = error.config;

    // Si l'erreur est due à un token expiré et que nous n'avons pas déjà tenté de rafraîchir
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    handleError(error);
    return Promise.reject(error);
  }
);

// Fonction utilitaire pour les requêtes avec retry et gestion de la pagination
export const withRetry = async (requestFn, maxRetries = config.RETRY_ATTEMPTS) => {
  let attempts = 0;
  
  while (attempts < maxRetries) {
    try {
      const response = await requestFn();
      return response;
    } catch (error) {
      attempts++;
      if (attempts === maxRetries) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempts) * 1000));
    }
  }
};

// Fonctions utilitaires pour les requêtes API
export const get = async (url, params = {}, config = {}) => {
  return withRetry(() => axiosInstance.get(url, { ...config, params }));
};

export const post = async (url, data = {}, config = {}) => {
  return withRetry(() => axiosInstance.post(url, data, config));
};

export const put = async (url, data = {}, config = {}) => {
  return withRetry(() => axiosInstance.put(url, data, config));
};

export const patch = async (url, data = {}, config = {}) => {
  return withRetry(() => axiosInstance.patch(url, data, config));
};

export const del = async (url, config = {}) => {
  return withRetry(() => axiosInstance.delete(url, config));
};

// Fonction utilitaire pour gérer les formulaires avec fichiers

export const postForm = async (url, formData, config = {}) => {
  return withRetry(() => 
    axiosInstance.post(url, formData, {
      ...config,
      headers: {
        ...config.headers,
        'Content-Type': 'multipart/form-data',
      },
    })
  );
};

export const putForm = async (url, formData, config = {}) => {
  return withRetry(() => 
    axiosInstance.put(url, formData, {
      ...config,
      headers: {
        ...config.headers,
        'Content-Type': 'multipart/form-data',
      },
    })
  );
};

export default axiosInstance;
