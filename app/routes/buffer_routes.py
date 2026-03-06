from flask import Blueprint, request, jsonify
from datetime import datetime

buffer_bp = Blueprint('buffer', __name__, url_prefix='/api/buffer')

# In-memory buffer storage
telemetry_buffer = []

@buffer_bp.route('/telemetry', methods=['POST'])
def buffer_telemetry():
    """Buffer telemetry data when offline"""
    try:
        data = request.get_json()
        device_id = data.get('device_id')
        timestamp = data.get('timestamp')
        parameters = data.get('parameters', [])
        
        buffer_entry = {
            'id': len(telemetry_buffer) + 1,
            'device_id': device_id,
            'timestamp': timestamp,
            'parameters': parameters,
            'created_at': datetime.utcnow().isoformat(),
            'synced': False
        }
        
        telemetry_buffer.append(buffer_entry)
        print(f"[BUFFER] Buffered {len(parameters)} parameters from {device_id}")
        
        return jsonify({'message': 'Data buffered'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@buffer_bp.route('/telemetry/latest', methods=['GET'])
def get_buffered_telemetry():
    """Get unsynced buffered telemetry"""
    try:
        unsynced = [b for b in telemetry_buffer if not b['synced']]
        return jsonify({'buffer': unsynced}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@buffer_bp.route('/telemetry/mark-synced', methods=['PUT'])
def mark_synced():
    """Mark buffered records as synced"""
    try:
        data = request.get_json()
        ids = data.get('ids', [])
        
        for buffer_entry in telemetry_buffer:
            if buffer_entry['id'] in ids:
                buffer_entry['synced'] = True
        
        print(f"[BUFFER] Marked {len(ids)} records as synced")
        return jsonify({'message': 'Records marked as synced'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
