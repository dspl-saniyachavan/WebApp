from app.models import db
from datetime import datetime


class ParameterStream(db.Model):
    """Model to store parameter streaming data from devices"""
    __tablename__ = 'parameter_stream'
    
    id = db.Column(db.Integer, primary_key=True)
    device_id = db.Column(db.String(255), nullable=False, index=True)
    parameter_id = db.Column(db.Integer, nullable=False, index=True)
    parameter_name = db.Column(db.String(255), nullable=False)
    value = db.Column(db.Float, nullable=False)
    unit = db.Column(db.String(50), nullable=True)
    min_value = db.Column(db.Float, nullable=True)
    max_value = db.Column(db.Float, nullable=True)
    color = db.Column(db.String(50), nullable=True)
    timestamp = db.Column(db.DateTime, nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'device_id': self.device_id,
            'parameter_id': self.parameter_id,
            'parameter_name': self.parameter_name,
            'value': self.value,
            'unit': self.unit,
            'min': self.min_value,
            'max': self.max_value,
            'color': self.color,
            'timestamp': self.timestamp.isoformat(),
            'created_at': self.created_at.isoformat()
        }
