<<<<<<< HEAD
# PrecisionPulse Frontend

Next.js web dashboard for real-time telemetry monitoring with responsive design and zero-refresh UI.

## Features

- Real-time telemetry dashboard
- Responsive design (mobile, tablet, desktop)
- Zero-refresh parameter updates
- Role-based access control
- Live data streaming with charts
- Parameter management interface
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
<<<<<<< HEAD
- Node.js 16+
- npm or yarn
=======
- Python 3.8+
- MQTT broker running (optional for standalone mode)
>>>>>>> 03035868208f04d97c99349fe0cd2242f260bd0d

### Installation

```bash
# Clone repository
<<<<<<< HEAD
git clone https://github.com/DevAngles-Interns-2026/dspl-precision-pulse-frontend.git
cd dspl-precision-pulse-frontend

# Install dependencies
npm install
# or
yarn install
```

### Configuration

Create `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### Development

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
=======
git clone https://github.com/DevAngles-Interns-2026/dspl-precision-pulse-desktop.git
cd dspl-precision-pulse-desktop

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your MQTT broker settings
```

### Run Application

```bash
python main.py
>>>>>>> 03035868208f04d97c99349fe0cd2242f260bd0d
```

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@precisionpulse.com | admin123 |
| Client | client@precisionpulse.com | client123 |
| User | user@precisionpulse.com | user123 |

<<<<<<< HEAD
## Project Structure

```
dspl-precision-pulse-frontend/
├── src/
│   ├── app/              # Next.js pages and layouts
│   ├── components/       # Reusable UI components
│   ├── services/         # API and data services
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities and helpers
│   └── models/           # TypeScript interfaces
├── public/               # Static assets
├── docs/                 # Documentation
├── package.json
└── next.config.ts
```

## Pages

- **Login** (`/login`) - User authentication
- **Dashboard** (`/dashboard`) - Real-time telemetry display
- **Parameters** (`/parameters`) - Parameter configuration
- **Users** (`/users`) - User management (admin only)
- **Profile** (`/profile`) - User profile settings

## Key Features

### Responsive Design
- Mobile-first approach
- Adaptive layouts for all screen sizes
- Responsive tables with hidden columns on small screens

### Zero-Refresh UI
- Parameter updates without page reload
- Instant status changes
- Smooth user experience

### Real-Time Updates
- Live telemetry data streaming
- Auto-updating charts
- WebSocket integration

## API Integration

Frontend connects to backend at `http://localhost:5000`:

- `POST /api/auth/login` - User login
- `GET /api/parameters` - Fetch parameters
- `PUT /api/parameters/:id` - Update parameter
- `GET /api/telemetry/latest` - Get latest telemetry data

## Technologies

- **Framework**: Next.js 16+
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: React Hooks
- **HTTP**: Fetch API
- **Real-time**: Socket.IO

## Development

### Code Style
- Follow ESLint configuration
- Use TypeScript for type safety
- Format with Prettier

### Testing
```bash
npm run lint
```

## Troubleshooting

**Port 3000 already in use:**
```bash
npm run dev -- -p 3001
```

**API connection fails:**
- Verify backend is running on `http://localhost:5000`
- Check `NEXT_PUBLIC_API_URL` in `.env.local`

**Build errors:**
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
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

**MQTT connection fails:**
- Verify broker is running
- Check MQTT_BROKER and MQTT_PORT in .env
- Ensure TLS certificates exist if MQTT_USE_TLS=true

**Database errors:**
- Delete `data/precision_pulse.db` to reset
- Check write permissions in data folder
>>>>>>> 03035868208f04d97c99349fe0cd2242f260bd0d

## License

MIT License - See LICENSE file

## Support

For issues and questions, contact the development team.
