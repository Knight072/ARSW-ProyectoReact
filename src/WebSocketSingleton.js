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

    this.websocket.onopen = () => {
      this.isConnected = true;
      console.log('Conexión establecida');
    };

    this.websocket.onmessage = (event) => {
      if (event.data === "Connection established.") {
        console.log(event.data);
        return;
      }
      
      try {
        const data = JSON.parse(event.data);
        if (Array.isArray(data)) {
          console.log('Maze updated:', data);
        } else if (typeof data === 'object' && data.id && data.positionX !== undefined && data.positionY !== undefined) {
          console.log(`Actor ${data.id} se movió a (${data.positionX}, ${data.positionY})`);
        } else {
          console.log('Mensaje no reconocido: ' + event.data);
        }
      } catch (e) {
        console.error('Error al procesar el mensaje:', e);
        console.log('Mensaje original:', event.data);
      }
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