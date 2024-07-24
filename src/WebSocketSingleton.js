
class WebSocketSingleton {
  constructor(url) {
      if (WebSocketSingleton.instance) {
          return WebSocketSingleton.instance;
      }

      this.url = url;
      this.websocket = null;
      this.isConnected = false;
      this.initializeWebSocket();

      WebSocketSingleton.instance = this;
  }

  initializeWebSocket() {
    this.websocket = new WebSocket(this.url);

    this.websocket.onopen = async () => {
      this.isConnected = true;
      console.log('Conexión establecida');
    };

    this.websocket.onerror = (error) => {
      console.error('Error de WebSocket:', error);
    };

    this.websocket.onclose = () => {
      this.isConnected = false;
      sessionStorage.removeItem('authToken');
      console.log('Conexión cerrada');
    };
  }

  static getInstance(url) {
      if (!WebSocketSingleton.instance) {
          WebSocketSingleton.instance = new WebSocketSingleton(url);
      }
      return WebSocketSingleton.instance;
  }

  disconnect() {
      if (this.websocket) {
          this.websocket.close();
      }
  }
}

export default WebSocketSingleton;