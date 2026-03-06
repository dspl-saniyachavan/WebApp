import io from 'socket.io-client';

class SocketIOService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = {};
  }

  connect(url = 'http://localhost:5000') {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(url, {
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: 5,
          transports: ['websocket', 'polling']
        });

        this.socket.on('connect', () => {
          this.isConnected = true;
          console.log('[Socket.IO] Connected to server');
          this.emit('connection_status', { connected: true });
          resolve();
        });

        this.socket.on('disconnect', () => {
          this.isConnected = false;
          console.log('[Socket.IO] Disconnected from server');
          this.emit('connection_status', { connected: false });
        });

        this.socket.on('telemetry_update', (data) => {
          this.emit('telemetry_update', data);
        });

        this.socket.on('connection_response', (data) => {
          console.log('[Socket.IO] Server response:', data);
        });

        this.socket.on('error', (error) => {
          console.error('[Socket.IO] Error:', error);
          this.emit('connection_error', error);
        });

        this.socket.on('connect_error', (error) => {
          console.error('[Socket.IO] Connection error:', error);
          this.emit('connection_error', error);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
    }
  }

  authenticate(userId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('authenticate', { user_id: userId });
    }
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}

export default new SocketIOService();
