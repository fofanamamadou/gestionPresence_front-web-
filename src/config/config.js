const config = {
  API_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1/',
  TOKEN_REFRESH_INTERVAL: 4 * 60 * 1000, // 4 minutes
  REQUEST_TIMEOUT: 30000, // 30 secondes
  RETRY_ATTEMPTS: 3,
};

export default config; 