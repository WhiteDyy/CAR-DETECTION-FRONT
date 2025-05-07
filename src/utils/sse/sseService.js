export default class SSEService {
  constructor(url) {
    this.url = url
    this.eventSource = null
    this.listeners = []
    this.reconnectDelay = 1000 // 初始重连延迟，单位：毫秒
    this.maxReconnectDelay = 10000 // 最大重连延迟，单位：毫秒
  }

  // 添加事件监听器
  addEventListener(callback) {
    this.listeners.push(callback)
  }

  // 移除事件监听器
  removeEventListener(callback) {
    this.listeners = this.listeners.filter((listener) => listener !== callback)
  }

  // 启动 SSE 连接
  start() {
    if (this.eventSource) return // 如果已有连接，则不再重新连接
    
    this.createEventSource()
  }

  // 创建 EventSource 并处理消息和错误
  createEventSource() {
    this.eventSource = new EventSource(this.url)

    this.eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data)
      this.listeners.forEach((callback) => callback(data)) // 将收到的数据传递给所有监听器
    }

    this.eventSource.onerror = (error) => {
      console.error('SSE Error:', error)
      this.stop() // 关闭当前的 SSE 连接
      this.retryConnection() // 尝试重连
    }
  }

  // 尝试重连
  retryConnection() {
    setTimeout(() => {
      console.log(`尝试重连 SSE... 当前延迟: ${this.reconnectDelay}ms`)
      this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay) // 延迟指数退避
      this.start() // 重新启动连接
    }, this.reconnectDelay)
  }

  // 关闭 SSE 连接
  stop() {
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }
    this.reconnectDelay = 1000 // 重置重连延迟
  }
}
