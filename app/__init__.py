from flask import Flask, request
from flask_cors import CORS
from flask_socketio import SocketIO
from config.config import Config
from app.models import db
from app.models.user import User
from app.models.parameter import Parameter
from app.models.telemetry import Telemetry
from app.models.telemetry_buffer import TelemetryBuffer
from app.models.parameter_stream import ParameterStream
from app.routes.auth_routes import auth_bp
from app.routes.user_routes import user_bp
from app.routes.parameter_routes import parameter_bp
from app.routes.sync_routes import sync_bp
from app.routes.internal_routes import internal_bp
from app.routes.telemetry_routes import telemetry_bp
from app.routes.buffer_routes import buffer_bp
from app.routes.parameter_stream_routes import parameter_stream_bp
from app.routes.mqtt_bridge_routes import mqtt_bridge_bp
import asyncio
import threading
import logging

logger = logging.getLogger(__name__)

socketio = None

def create_app():
    global socketio
    
    app = Flask(__name__)
    app.config.from_object(Config)
    
    db.init_app(app)
    CORS(app)
    
    # Initialize Socket.IO
    socketio = SocketIO(
        app,
        cors_allowed_origins="*",
        async_mode='threading',
        ping_timeout=60,
        ping_interval=25
    )
    
    # Store socketio in app for access in routes
    app.socketio = socketio
    
    with app.app_context():
        db.create_all()
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(parameter_bp)
    app.register_blueprint(sync_bp)
    app.register_blueprint(internal_bp)
    app.register_blueprint(telemetry_bp)
    app.register_blueprint(buffer_bp)
    app.register_blueprint(parameter_stream_bp)
    app.register_blueprint(mqtt_bridge_bp)
    
    # Socket.IO event handlers
    @socketio.on('connect')
    def handle_connect():
        client_id = request.sid
        logger.info(f"Client connected: {client_id}")
        socketio.emit('connection_response', {'data': 'Connected to server'})
    
    @socketio.on('disconnect')
    def handle_disconnect():
        client_id = request.sid
        logger.info(f"Client disconnected: {client_id}")
    
    @socketio.on('authenticate')
    def handle_authenticate(data):
        user_id = data.get('user_id')
        logger.info(f"Client authenticated as user {user_id}")
        socketio.emit('auth_response', {'status': 'authenticated'})
    
    # Start MQTT subscriber in background thread
    def start_mqtt_subscriber():
        from app.services.mqtt_subscriber import MQTTSubscriber
        from config.config import Config
        
        subscriber = MQTTSubscriber(
            broker=Config.MQTT_BROKER,
            port=Config.MQTT_PORT,
            use_tls=Config.MQTT_USE_TLS,
            ca_certs=Config.MQTT_CA_CERTS
        )
        subscriber.connect()
    
    mqtt_sub_thread = threading.Thread(target=start_mqtt_subscriber, daemon=True)
    mqtt_sub_thread.start()
    
    return app

def get_socketio():
    """Get Socket.IO instance"""
    return socketio
