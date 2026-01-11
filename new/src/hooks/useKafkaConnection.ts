// src/hooks/useKafkaConnection.ts
// Hook to manage Kafka WebSocket connection

import { useEffect, useState, useCallback } from "react";
import { kafkaService } from "../services/kafkaService";

type ConnectionStatus = "connected" | "connecting" | "disconnected";

export function useKafkaConnection(autoConnect: boolean = true) {
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");
  const [error, setError] = useState<Error | null>(null);

  const connect = useCallback(async () => {
    try {
      setStatus("connecting");
      setError(null);
      await kafkaService.connect();
      setStatus("connected");
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Connection failed");
      setError(error);
      setStatus("disconnected");
    }
  }, []);

  const disconnect = useCallback(() => {
    kafkaService.disconnect();
    setStatus("disconnected");
    setError(null);
  }, []);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    // Update status periodically
    const interval = setInterval(() => {
      const currentStatus = kafkaService.getConnectionStatus();
      setStatus(currentStatus);
    }, 1000);

    return () => {
      clearInterval(interval);
      if (autoConnect) {
        disconnect();
      }
    };
  }, [autoConnect, connect, disconnect]);

  return {
    status,
    error,
    connect,
    disconnect,
    isConnected: status === "connected",
    isConnecting: status === "connecting",
  };
}
