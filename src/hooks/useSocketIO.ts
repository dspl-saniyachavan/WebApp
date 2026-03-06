import { useEffect, useState, useCallback } from 'react';
import io, { Socket } from 'socket.io-client';

interface UseSocketIOOptions {
  url?: string;
  autoConnect?: boolean;
}

export function useSocketIO(options: UseSocketIOOptions = {}) {
  const { url = 'http://localhost:5000', autoConnect = true } = options;
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [telemetryData, setTelemetryData] = useState<any>(null);

  useEffect(() => {
    if (!autoConnect) return;

    const newSocket = io(url, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('[Socket.IO] Connected');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('[Socket.IO] Disconnected');
    });

    newSocket.on('telemetry_update', (data) => {
      setTelemetryData(data);
    });

    newSocket.on('error', (error) => {
      console.error('[Socket.IO] Error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [url, autoConnect]);

  const authenticate = useCallback((userId: string) => {
    if (socket && isConnected) {
      socket.emit('authenticate', { user_id: userId });
    }
  }, [socket, isConnected]);

  return {
    socket,
    isConnected,
    telemetryData,
    authenticate
  };
}
