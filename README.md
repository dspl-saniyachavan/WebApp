<<<<<<< HEAD
# PrecisionPulse Backend

Flask REST API with MQTT integration, WebSocket support, and real-time data streaming.

## Features

- JWT authentication with role-based access control
- MQTT broker integration for telemetry streaming
- WebSocket support for real-time updates
- Parameter management and synchronization
- Telemetry data buffering and sync
- User and configuration management
- SQLAlchemy ORM with SQLite/PostgreSQL support
=======
# PrecisionPulse Desktop

Real-time telemetry monitoring desktop app with MQTT streaming and zero-refresh UI.

## Features

- Live telemetry dashboard with responsive UI
- MQTT-based data streaming (3-second intervals)
- Zero-refresh parameter updates
- Offline data buffering with auto-sync
- Role-based access control (Admin, Client, User)
- Local SQLite database
>>>>>>> 03035868208f04d97c99349fe0cd2242f260bd0d

## Quick Start

### Prerequisites
- Python 3.8+
<<<<<<< HEAD
- MQTT broker (Mosquitto or similar)
- PostgreSQL (optional, SQLite by default)
=======
- MQTT broker running (optional for standalone mode)
>>>>>>> 03035868208f04d97c99349fe0cd2242f260bd0d

### Installation

```bash
# Clone repository
<<<<<<< HEAD
git clone https://github.com/DevAngles-Interns-2026/dspl-precision-pulse-backend.git
cd backend
=======
git clone https://github.com/DevAngles-Interns-2026/dspl-precision-pulse-desktop.git
cd dspl-precision-pulse-desktop
>>>>>>> 03035868208f04d97c99349fe0cd2242f260bd0d

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt
<<<<<<< HEAD
```

### Configuration

Create `.env` file:

```env
FLASK_ENV=development
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///instance/precision_pulse.db
MQTT_BROKER=localhost
MQTT_PORT=8883
MQTT_USE_TLS=false
JWT_SECRET=your-jwt-secret
```

### Run Server

```bash
python run.py
```

Server runs on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user

### Parameters
- `GET /api/parameters` - Get all parameters
- `POST /api/parameters` - Create parameter
- `PUT /api/parameters/:id` - Update parameter
- `DELETE /api/parameters/:id` - Delete parameter

### Telemetry
- `GET /api/telemetry/latest` - Get latest telemetry data
- `GET /api/telemetry/history` - Get telemetry history

### Users (Admin only)
- `GET /api/users` - List all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Internal (Desktop sync)
- `GET /api/internal/parameters` - Get parameters for sync
- `PUT /api/internal/sync-parameter` - Sync parameter
- `DELETE /api/internal/sync-parameter-delete` - Delete parameter

## Project Structure

```
backend/
├── app/
│   ├── controllers/      # Request handlers
│   ├── models/           # Database models
│   ├── routes/           # API endpoints
│   ├── services/         # Business logic
│   ├── middleware/       # Auth middleware
│   ├── events/           # WebSocket events
│   └── utils/            # Utilities
├── config/               # Configuration & SSL certs
├── instance/             # SQLite database
├── run.py                # Entry point
├── requirements.txt      # Dependencies
└── .env                  # Environment variables
```

## Default Users
=======

# Configure environment
cp .env.example .env
# Edit .env with your MQTT broker settings
```

### Run Application

```bash
python main.py
```

## Default Credentials
>>>>>>> 03035868208f04d97c99349fe0cd2242f260bd0d

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@precisionpulse.com | admin123 |
| Client | client@precisionpulse.com | client123 |
| User | user@precisionpulse.com | user123 |

<<<<<<< HEAD
## Technologies

- **Framework**: Flask
- **ORM**: SQLAlchemy
- **Authentication**: JWT + Argon2
- **Real-time**: Socket.IO
- **Messaging**: MQTT (paho-mqtt)
- **Database**: SQLite/PostgreSQL

## MQTT Topics

- `precisionpulse/telemetry` - Telemetry data stream
- `precisionpulse/heartbeat` - Connection heartbeat
- `precisionpulse/sync/users/#` - User synchronization
- `precisionpulse/sync/config` - Configuration sync
- `precisionpulse/sync/parameters` - Parameter sync
- `precisionpulse/commands/config/update` - Remote config updates

## Development

### Initialize Database
```bash
python create_db.py
python init_users.py
python init_parameters.py
```

### Run with PostgreSQL
```bash
python init_postgres.py
# Update DATABASE_URL in .env
python run.py
```

## Troubleshooting

**Port 5000 already in use:**
```bash
python run.py --port 5001
```
=======
## Configuration

Edit `.env` file:

```env
MQTT_BROKER=localhost
MQTT_PORT=8883
MQTT_USE_TLS=false
TELEMETRY_INTERVAL=3
DATABASE_PATH=data/precision_pulse.db
```

## Architecture

- **Frontend**: PySide6 (Qt6 for Python)
- **Database**: SQLite (local storage)
- **Streaming**: MQTT (paho-mqtt)
- **Authentication**: JWT + Argon2

## Key Features

### Zero-Refresh UI
- Parameter toggles update instantly without full page reload
- Only affected rows refresh, not entire table
- Smooth user experience

### Responsive Design
- Adaptive UI for different screen sizes
- Responsive margins and spacing
- Mobile-friendly layouts

### Data Sync
- Automatic parameter synchronization with backend
- Real-time dashboard updates
- Offline buffering with auto-sync on reconnect

## Project Structure

```
dspl-precision-pulse-desktop/
├── src/
│   ├── ui/              # UI components
│   ├── services/        # MQTT, sync services
│   ├── core/            # Database, auth
│   └── models/          # Data models
├── config/              # SSL certificates
├── data/                # Local database
├── main.py              # Entry point
└── requirements.txt     # Dependencies
```

## Development

### Running Tests
```bash
pytest
```

### Code Style
- Follow PEP 8
- Use type hints
- Document complex functions

## Troubleshooting

**App won't start:**
- Check Python version (3.8+)
- Verify all dependencies: `pip install -r requirements.txt`
- Check database permissions
>>>>>>> 03035868208f04d97c99349fe0cd2242f260bd0d

**MQTT connection fails:**
- Verify broker is running
- Check MQTT_BROKER and MQTT_PORT in .env
- Ensure TLS certificates exist if MQTT_USE_TLS=true

**Database errors:**
<<<<<<< HEAD
- Delete `instance/precision_pulse.db` to reset
- Run `python create_db.py` to reinitialize

**JWT errors:**
- Verify JWT_SECRET is set in .env
- Check token expiration
=======
- Delete `data/precision_pulse.db` to reset
- Check write permissions in data folder
>>>>>>> 03035868208f04d97c99349fe0cd2242f260bd0d

## License

MIT License - See LICENSE file

## Support

For issues and questions, contact the development team.
