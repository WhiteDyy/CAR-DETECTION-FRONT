// import { useAuthStore } from '@/store';
// import { EventSourcePolyfill } from 'event-source-polyfill';

// export default class SSEService {
//   constructor(url = 'http://localhost:8089/api/sensor') { // 确保 URL 正确
//     this.url = url;
//     this.eventSource = null;
//     this.listeners = new Map(); // 支持多种事件类型
//     this.reconnectDelay = 1000;
//     this.maxReconnectDelay = 10000;
//     this.maxRetries = 5;
//     this.retryCount = 0;
//   }

//   addEventListener(eventType, callback) {
//     if (!this.listeners.has(eventType)) {
//       this.listeners.set(eventType, new Set());
//     }
//     this.listeners.get(eventType).add(callback);
//   }

//   removeEventListener(eventType, callback) {
//     if (this.listeners.has(eventType)) {
//       this.listeners.get(eventType).delete(callback);
//     }
//   }

//   start() {
//     if (this.eventSource) return;
//     this.createEventSource();
//   }

//   createEventSource() {
//     const authStore = useAuthStore();
//     const token = authStore.accessToken;
//     this.eventSource = new EventSourcePolyfill(this.url, {
//       headers: {
//         Authorization: 'Bearer ' + (token || ''),
//         Accept: 'text/event-stream',
//       },
//       heartbeatTimeout: 60000,
//     });

//     this.eventSource.addEventListener('sensorData', (event) => {
//       try {
//         // 在收到有效数据后，重置所有重连状态
//         this.reconnectDelay = 1000;
//         this.retryCount = 0;
//         const data = JSON.parse(event.data);
//         this.listeners.get('sensorData')?.forEach((callback) => callback(data));
//       } catch (error) {
//         console.error('Failed to parse sensorData:', error);
//       }
//     });

//     this.eventSource.addEventListener('heartbeat', () => {
//       this.reconnectDelay = 1000;
//       this.retryCount = 0;
//     });

//     this.eventSource.onmessage = (event) => {
//       try {
//         const data = JSON.parse(event.data);
//         this.listeners.get('sensorData')?.forEach((callback) => callback(data));
//       } catch (error) {
//         console.error('Failed to parse default message:', error);
//       }
//     };

//     this.eventSource.onerror = (error) => {
//       this.stop();
//       if (this.retryCount < this.maxRetries) {
//         this.retryConnection();
//       } else {
//         console.error('达到最大重试次数，停止重连');
//       }
//     };
//   }

//   retryConnection() {
//     setTimeout(() => {
//       console.warn(`尝试重连 SSE... 当前延迟: ${this.reconnectDelay}ms`);
//       this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
//       this.retryCount++;
//       this.start();
//       this.listeners.get('reconnect')?.forEach((callback) => callback());
//     }, this.reconnectDelay);
//   }

//   stop() {
//     if (this.eventSource) {
//       console.warn('Stopping SSE connection');
//       this.eventSource.close();
//       this.eventSource = null;
//     }
//     this.reconnectDelay = 1000;
//     this.retryCount = 0;
//   }
// }

import { useAuthStore } from '@/store';
import { EventSourcePolyfill } from 'event-source-polyfill';

export default class SSEService {
  constructor(url) { // 移除构造函数中的默认URL，强制使用者传入
    if (!url) {
      throw new Error("SSEService: URL must be provided.");
    }
    this.url = url;
    this.eventSource = null;
    this.listeners = new Map();
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

  /**
   * 【核心修改】重构此方法以动态处理所有注册的事件
   */
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

    // 1. 遍历所有已经通过 addEventListener 注册的事件类型
    for (const eventType of this.listeners.keys()) {
      // 2. 为每种事件类型动态地添加一个监听器
      this.eventSource.addEventListener(eventType, (event) => {
        try {
          // 当事件发生时，重置所有重连状态
          this.reconnectDelay = 1000;
          this.retryCount = 0;

          const data = event.data ? JSON.parse(event.data) : {}; // 解析数据

          // 3. 找到对应的回调函数集合并执行它们
          this.listeners.get(eventType)?.forEach((callback) => callback(data));

        } catch (error) {
          console.error(`Failed to parse or handle SSE event [${eventType}]:`, error);
        }
      });
    }

    // 4. 【可选但推荐】移除通用的 onmessage 处理器，因为我们现在只处理具名事件
    // this.eventSource.onmessage = ...

    // 5. onerror 处理器保持不变，它负责处理连接级别的错误
    this.eventSource.onerror = (error) => {
      console.error("SSE connection error:", error);
      this.stop();
      if (this.retryCount < this.maxRetries) {
        this.retryConnection();
      } else {
        console.error('SSE max retries reached. Stopping reconnection.');
      }
    };
  }

  retryConnection() {
    setTimeout(() => {
      console.warn(`Attempting to reconnect SSE... Current delay: ${this.reconnectDelay}ms`);
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
      this.retryCount++;
      this.start();
      this.listeners.get('reconnect')?.forEach((callback) => callback());
    }, this.reconnectDelay);
  }

  stop() {
    if (this.eventSource) {
      console.warn('Stopping SSE connection');
      this.eventSource.close();
      this.eventSource = null;
    }
    this.reconnectDelay = 1000;
    this.retryCount = 0;
  }
}