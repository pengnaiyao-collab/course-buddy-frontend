import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

/**
 * WebSocket配置常量
 */
const WS_CONFIG = {
  // 从环境变量读取或使用默认值
  endpoint: process.env.REACT_APP_WS_ENDPOINT || `${window.location.origin}/ws/collaboration`,
  reconnectDelay: 3000,
  maxReconnectAttempts: 5,
};

class WebSocketService {
  constructor() {
    this.client = null;
    this.subscriptions = {};
    this.connectionPromise = null;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = WS_CONFIG.maxReconnectAttempts;
    this.reconnectDelay = WS_CONFIG.reconnectDelay;
  }

  /**
   * Connect to WebSocket server
   * @param {string} token - JWT token for authentication
   * @param {Function} onConnected - Callback when connected
   * @param {Function} onError - Callback on connection error
   * @returns {Promise}
   */
  connect(token, onConnected, onError) {
    if (this.client && this.client.connected) {
      return Promise.resolve();
    }

    if (this.isConnecting && this.connectionPromise) {
      return this.connectionPromise;
    }

    this.isConnecting = true;

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        const socket = new SockJS(WS_CONFIG.endpoint);
        this.client = Stomp.over(socket);
        this.client.debug = () => {}; // Suppress debug logs

        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        this.client.connect(
          headers,
          () => {
            console.log('WebSocket connected');
            this.isConnecting = false;
            this.reconnectAttempts = 0;
            if (onConnected) onConnected();
            resolve();
          },
          (error) => {
            console.error('WebSocket connection error:', error);
            this.isConnecting = false;
            if (onError) onError(error);
            reject(error);
            this.attemptReconnect(token, onConnected, onError);
          }
        );
      } catch (error) {
        console.error('WebSocket initialization error:', error);
        this.isConnecting = false;
        if (onError) onError(error);
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  attemptReconnect(token, onConnected, onError) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(() => {
      console.log(`Reconnecting... (attempt ${this.reconnectAttempts})`);
      this.connectionPromise = null;
      this.connect(token, onConnected, onError);
    }, delay);
  }

  /**
   * Subscribe to a WebSocket topic
   * @param {string} channel - Topic channel (e.g., /topic/collaboration/123)
   * @param {Function} callback - Function to call when message is received
   */
  subscribe(channel, callback) {
    if (!this.client || !this.client.connected) {
      console.warn('WebSocket not connected, cannot subscribe');
      return;
    }

    if (this.subscriptions[channel]) {
      console.warn(`Already subscribed to ${channel}`);
      return;
    }

    this.subscriptions[channel] = this.client.subscribe(channel, (message) => {
      try {
        const data = JSON.parse(message.body);
        callback(data);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
        callback(message.body);
      }
    });

    console.log(`Subscribed to ${channel}`);
  }

  /**
   * Unsubscribe from a WebSocket topic
   * @param {string} channel - Topic channel
   */
  unsubscribe(channel) {
    if (this.subscriptions[channel]) {
      this.subscriptions[channel].unsubscribe();
      delete this.subscriptions[channel];
      console.log(`Unsubscribed from ${channel}`);
    }
  }

  /**
   * Send a message to a WebSocket destination
   * @param {string} destination - Destination (e.g., /app/message)
   * @param {Object} data - Message data
   */
  send(destination, data) {
    if (!this.client || !this.client.connected) {
      console.warn('WebSocket not connected, cannot send message');
      return;
    }

    try {
      this.client.send(destination, {}, JSON.stringify(data));
      console.log(`Message sent to ${destination}`);
    } catch (error) {
      console.error('Failed to send WebSocket message:', error);
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.client) {
      Object.keys(this.subscriptions).forEach((channel) => {
        this.unsubscribe(channel);
      });

      this.client.disconnect(() => {
        console.log('WebSocket disconnected');
      });

      this.client = null;
      this.subscriptions = {};
    }
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected() {
    return this.client && this.client.connected;
  }

  /**
   * Get number of active subscriptions
   */
  getSubscriptionCount() {
    return Object.keys(this.subscriptions).length;
  }
}

export default new WebSocketService();
