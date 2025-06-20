import { useAuthStore } from '@/store';
import { EventSourcePolyfill } from 'event-source-polyfill';

export default class SSEService {
  constructor(url = 'http://localhost:8089/api/sensor') { // 确保 URL 正确
    this.url = url;
    this.eventSource = null;
    this.listeners = new Map(); // 支持多种事件类型
    this.reconnectDelay = 1000;
    this.maxReconnectDelay = 10000;
    this.maxRetries = 5;
    this.retryCount = 0;
  }

  addEventListener(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType).add(callback);
  }

  removeEventListener(eventType, callback) {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).delete(callback);
    }
  }

  start() {
    if (this.eventSource) return;
    this.createEventSource();
  }

  createEventSource() {
    const authStore = useAuthStore();
    const token = authStore.accessToken;
    this.eventSource = new EventSourcePolyfill(this.url, {
      headers: {
        Authorization: 'Bearer ' + (token || ''),
        Accept: 'text/event-stream',
      },
      heartbeatTimeout: 60000,
    });

    this.eventSource.addEventListener('sensorData', (event) => {
      try {
        const data = JSON.parse(event.data);
        this.listeners.get('sensorData')?.forEach((callback) => callback(data));
      } catch (error) {
        console.error('Failed to parse sensorData:', error);
      }
    });

    this.eventSource.addEventListener('heartbeat', () => {
      this.retryCount = 0;
    });

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.listeners.get('sensorData')?.forEach((callback) => callback(data));
      } catch (error) {
        console.error('Failed to parse default message:', error);
      }
    };

    this.eventSource.onerror = (error) => {
      this.stop();
      if (this.retryCount < this.maxRetries) {
        this.retryConnection();
      } else {
        console.error('达到最大重试次数，停止重连');
      }
    };
  }

  retryConnection() {
    setTimeout(() => {
      console.log(`尝试重连 SSE... 当前延迟: ${this.reconnectDelay}ms`);
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
      this.retryCount++;
      this.start();
      this.listeners.get('reconnect')?.forEach((callback) => callback());
    }, this.reconnectDelay);
  }

  stop() {
    if (this.eventSource) {
      console.log('Stopping SSE connection');
      this.eventSource.close();
      this.eventSource = null;
    }
    this.reconnectDelay = 1000;
    this.retryCount = 0;
  }
}