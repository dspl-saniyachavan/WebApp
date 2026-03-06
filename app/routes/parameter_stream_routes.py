from flask import Blueprint, request, jsonify

parameter_stream_bp = Blueprint('parameter_stream', __name__, url_prefix='/api/parameter-stream')

@parameter_stream_bp.route('/push', methods=['POST'])
def push_parameter_stream():
    """Receive parameter stream data"""
    try:
        data = request.get_json()
        client_id = data.get('client_id')
        parameters = data.get('parameters', [])
        
        print(f"[PARAM_STREAM] Received {len(parameters)} parameters from {client_id}")
        
        return jsonify({'message': 'Parameter stream received'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
