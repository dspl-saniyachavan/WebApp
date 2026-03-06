from flask import Blueprint, request, jsonify, current_app
from datetime import datetime

telemetry_bp = Blueprint('telemetry', __name__, url_prefix='/api/telemetry')

# In-memory storage for latest telemetry
latest_telemetry = {}

@telemetry_bp.route('/stream', methods=['POST'])
def stream_telemetry():
    """Receive telemetry stream from desktop client"""
    try:
        data = request.get_json()
        client_id = data.get('client_id')
        timestamp = data.get('timestamp')
        parameters = data.get('parameters', [])
        
        # Normalize parameter data
        normalized_params = []
        for p in parameters:
            normalized_params.append({
                'id': p.get('parameter_id') or p.get('id'),
                'name': p.get('name'),
                'value': float(p.get('value', 0)),
                'unit': p.get('unit', '')
            })
        
        # Store latest telemetry
        latest_telemetry[client_id] = {
            'timestamp': timestamp,
            'parameters': normalized_params
        }
        
        # Broadcast via Socket.IO
        if hasattr(current_app, 'socketio'):
            current_app.socketio.emit(
                'telemetry_update',
                {
                    'client_id': client_id,
                    'timestamp': timestamp,
                    'data': {'parameters': normalized_params}
                },
                namespace='/'
            )
        
        print(f"[TELEMETRY] Received {len(normalized_params)} parameters from {client_id}")
        for p in normalized_params:
            print(f"  - {p['name']}: {p['value']} {p['unit']}")
        
        return jsonify({'message': 'Telemetry received'}), 200
    except Exception as e:
        print(f"[TELEMETRY] Error: {e}")
        return jsonify({'error': str(e)}), 500

@telemetry_bp.route('/latest', methods=['GET'])
def get_latest_telemetry():
    """Get latest telemetry data"""
    try:
        if latest_telemetry:
            first_client = list(latest_telemetry.values())[0]
            return jsonify({'data': first_client}), 200
        return jsonify({'data': {'timestamp': None, 'parameters': []}}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@telemetry_bp.route('/client/<client_id>', methods=['GET'])
def get_client_telemetry(client_id):
    """Get telemetry for specific client"""
    try:
        if client_id in latest_telemetry:
            return jsonify(latest_telemetry[client_id]), 200
        return jsonify({'error': 'Client not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@telemetry_bp.route('/debug', methods=['GET'])
def debug_telemetry():
    """Debug endpoint to see all stored telemetry"""
    return jsonify({'stored': latest_telemetry}), 200
