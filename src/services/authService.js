import axios from '../utils/axiosInstance';

class AuthService {
  setTokens(accessToken, refreshToken) {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  }

  async getCurrentUser() {
    try {
      const userId = this.getUserId();
      if (!userId) return null;

      const response = await axios.get(`users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }

  getAccessToken() {
    return localStorage.getItem('access_token');
  }

  getRefreshToken() {
    return localStorage.getItem('refresh_token');
  }

  isAuthenticated() {
    return !!this.getAccessToken();
  }

  getUserId() {
    const token = this.getAccessToken();
    if (!token) return null;

    try {
      const payloadBase64 = token.split('.')[1];
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);
      return payload.user_id;
    } catch (error) {
      return null;
    }
  }

  clear() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    delete axios.defaults.headers.common['Authorization'];
  }

  async logout() {
    this.clear();
  }

  async refreshToken() {
    try {
      const refresh = this.getRefreshToken();
      if (!refresh) throw new Error('No refresh token');

      const response = await axios.post('token/refresh/', { refresh });
      const { access } = response.data;
      
      this.setTokens(access, refresh);
      return access;
    } catch (error) {
      this.clear();
      throw error;
    }
  }
}

export default new AuthService(); 