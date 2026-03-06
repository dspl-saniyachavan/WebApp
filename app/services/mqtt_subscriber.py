"""
MQTT Subscriber for backend to receive telemetry and sync messages
"""

import paho.mqtt.client as mqtt
import json
import logging

logger = logging.getLogger(__name__)

class MQTTSubscriber:
    """MQTT subscriber for backend"""
    
    def __init__(self, broker='localhost', port=1883, use_tls=False, ca_certs=None):
        self.broker = broker
        self.port = port
        self.use_tls = use_tls
        self.ca_certs = ca_certs
        self.client = mqtt.Client()
        self.client.on_connect = self._on_connect
        self.client.on_message = self._on_message
    
    def connect(self):
        """Connect to MQTT broker"""
        try:
            if self.use_tls:
                import ssl
                self.client.tls_set(
                    ca_certs=self.ca_certs,
                    certfile=None,
                    keyfile=None,
                    cert_reqs=ssl.CERT_NONE,
                    tls_version=ssl.PROTOCOL_TLSv1_2
                )
                self.client.tls_insecure_set(True)
            
            logger.info(f"Connecting to MQTT broker at {self.broker}:{self.port} (TLS: {self.use_tls})")
            self.client.connect(self.broker, self.port, 60)
            self.client.loop_forever()
        except Exception as e:
            logger.error(f"MQTT connection error: {e}")
    
    def _on_connect(self, client, userdata, flags, rc):
        """Handle connection"""
        if rc == 0:
            logger.info("MQTT subscriber connected")
            client.subscribe("precisionpulse/+/telemetry")
            client.subscribe("precisionpulse/sync/#")
        else:
            logger.error(f"MQTT connection failed: {rc}")
    
    def _on_message(self, client, userdata, msg):
        """Handle incoming messages"""
        try:
            topic = msg.topic
            payload = json.loads(msg.payload.decode())
            logger.info(f"MQTT message received on {topic}")
            
            if "telemetry" in topic:
                self._handle_telemetry(payload)
            elif "sync" in topic:
                self._handle_sync(payload)
        except Exception as e:
            logger.error(f"Message handling error: {e}")
    
    def _handle_telemetry(self, payload):
        """Handle telemetry messages"""
        client_id = payload.get('client_id')
        parameters = payload.get('parameters', [])
        logger.info(f"Telemetry from {client_id}: {len(parameters)} parameters")
    
    def _handle_sync(self, payload):
        """Handle sync messages"""
        action = payload.get('action')
        logger.info(f"Sync message: {action}")
