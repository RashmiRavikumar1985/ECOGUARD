// src/services/kafkaService.ts
// Pure Kafka consumer service - NO calculations, only message handling

export type KafkaMessage<T = any> = {
  topic: string;
  partition?: number;
  offset?: number;
  timestamp: string; // ISO 8601
  key?: string;
  value: T;
  headers?: Record<string, string>;
};

type SubscriptionCallback<T = any> = (message: KafkaMessage<T>) => void;

class KafkaService {
  private ws: WebSocket | null = null;
  private subscriptions: Map<string, Set<SubscriptionCallback>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  private reconnectDelay = 1000; // Start with 1 second
  private url: string | null = null;
  private isConnecting = false;

  // Get WebSocket URL from environment or use default
  private getWebSocketUrl(): string {
    // In production, this should come from environment variables
    const wsUrl = import.meta.env.VITE_KAFKA_WS_URL || 'ws://localhost:8080/kafka';
    return wsUrl;
  }

  // Connect to Kafka WebSocket proxy
  connect(url?: string): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return Promise.resolve();
    }

    if (this.isConnecting) {
      return Promise.reject(new Error('Connection already in progress'));
    }

    this.isConnecting = true;
    this.url = url || this.getWebSocketUrl();

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url!);

        this.ws.onopen = () => {
          console.log('[KafkaService] Connected to WebSocket');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.reconnectDelay = 1000;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: KafkaMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('[KafkaService] Failed to parse message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('[KafkaService] WebSocket error:', error);
          this.isConnecting = false;
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('[KafkaService] WebSocket closed');
          this.isConnecting = false;
          this.ws = null;
          this.attemptReconnect();
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  // Attempt reconnection with exponential backoff
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[KafkaService] Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), 30000);

    console.log(`[KafkaService] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    setTimeout(() => {
      if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
        this.connect(this.url || undefined).catch(() => {
          // Reconnection will be attempted again
        });
      }
    }, delay);
  }

  // Handle incoming Kafka message
  private handleMessage(message: KafkaMessage): void {
    const callbacks = this.subscriptions.get(message.topic);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(message);
        } catch (error) {
          console.error(`[KafkaService] Error in subscription callback for ${message.topic}:`, error);
        }
      });
    }
  }

  // Subscribe to a Kafka topic
  subscribe<T = any>(topic: string, callback: SubscriptionCallback<T>): () => void {
    if (!this.subscriptions.has(topic)) {
      this.subscriptions.set(topic, new Set());
    }

    this.subscriptions.get(topic)!.add(callback as SubscriptionCallback);

    // Send subscription message to WebSocket if connected
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'subscribe', topic }));
    }

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscriptions.get(topic);
      if (callbacks) {
        callbacks.delete(callback as SubscriptionCallback);
        if (callbacks.size === 0) {
          this.subscriptions.delete(topic);
          // Send unsubscribe message
          if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'unsubscribe', topic }));
          }
        }
      }
    };
  }

  // Get connection status
  getConnectionStatus(): 'connected' | 'connecting' | 'disconnected' {
    if (!this.ws) return 'disconnected';
    if (this.ws.readyState === WebSocket.OPEN) return 'connected';
    if (this.isConnecting) return 'connecting';
    return 'disconnected';
  }

  // Disconnect
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.subscriptions.clear();
    this.reconnectAttempts = 0;
  }
}

// Singleton instance
export const kafkaService = new KafkaService();
