import io from 'socket.io-client';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

class SocketIOService {
  private socket: any = null;
  private listeners: Map<string, Function[]> = new Map();

  connect() {
    if (this.socket?.connected) return;

    this.socket = io(BACKEND_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('[SOCKETIO] Connected to backend');
      this.emit('connected');
    });

    this.socket.on('disconnect', () => {
      console.log('[SOCKETIO] Disconnected from backend');
      this.emit('disconnected');
    });

    // Listen for telemetry from HTTP bridge
    this.socket.on('telemetry', (data: any) => {
      console.log('[SOCKETIO] Received telemetry:', data);
      this.emit('telemetry', data);
    });

    // Listen for MQTT messages (direct from MQTT broker)
    this.socket.on('mqtt_message', (data: any) => {
      console.log('[SOCKETIO] Received MQTT message:', data);
      // Convert MQTT message to telemetry format
      if (data.message && data.message.parameters) {
        const telemetryData = {
          timestamp: data.message.server_timestamp || data.message.timestamp,
          data: data.message
        };
        this.emit('telemetry', telemetryData);
      }
      this.emit('mqtt_message', data);
    });

    this.socket.on('error', (error: any) => {
      console.error('[SOCKETIO] Error:', error);
      this.emit('error', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event)!;
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any) {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.forEach(callback => callback(data));
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketIOService = new SocketIOService();
