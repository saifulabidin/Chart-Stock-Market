# Chart Stock Market

A real-time stock market charting application built with React and Chart.js that allows users to track and visualize stock price movements.

## Technology Stack

- **Frontend:**
  - React 19.x
  - Chart.js 4.x with zoom plugin
  - TailwindCSS 3.x
  - Framer Motion for animations
- **Backend:**
  - Node.js with Express
  - Alpha Vantage API for stock data

## Features

- Real-time stock price tracking
- Interactive line charts with zoom and pan capabilities
- Multiple stock comparison
- Customizable date ranges
- Responsive design for mobile and desktop
- Color-coded stock indicators

## Prerequisites

- Node.js 14.x or higher
- npm 6.x or higher or yarn 1.22.x
- A Railway account for deployment
- Alpha Vantage API key (get it from [Alpha Vantage](https://www.alphavantage.co/support/#api-key))

## Environment Setup

1. Set up environment variables:
   ```bash
   # In the frontend directory
   cp .env.example .env

   # In the backend directory
   cp .env.example .env
   ```

2. Configure the environment files:
   - Backend `.env`:
     ```
     PORT=5000
     ALPHA_VANTAGE_API_KEY=your_api_key_here
     ```
   - Frontend `.env`:
     ```
     REACT_APP_API_URL=http://localhost:5000/api
     ```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/saifulabidin/Chart-Stock-Market.git
cd Chart-Stock-Market
```

2. Install dependencies for both frontend and backend:
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

## Development

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
cd frontend
npm start
```

The application will be available at http://localhost:3000

## API Endpoints

### Stock Data

- `GET /api/stocks/:symbol` - Get historical stock data for a symbol
- `GET /api/health` - Health check endpoint

## Available Scripts

### Frontend

- `npm start` - Start development server
- `npm build` - Create production build
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

### Backend

- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload

## Deployment to Railway

### Backend Deployment

1. Create a new Railway project:
   - Go to [Railway](https://railway.app/)
   - Click "New Project"
   - Choose "Deploy from GitHub"
   - Select your repository

2. Configure environment variables:
   - In your Railway project, go to "Variables"
   - Add any necessary environment variables

3. Set up the deployment:
   - In the "Settings" tab, set the build command:
     ```bash
     cd backend && npm install
     ```
   - Set the start command:
     ```bash
     cd backend && npm start
     ```

### Frontend Deployment

1. Create another service in your Railway project:
   - Click "New Service"
   - Choose "Deploy from GitHub"
   - Select the same repository

2. Configure the service:
   - Set the build command:
     ```bash
     cd frontend && npm install && npm run build
     ```
   - Set the start command:
     ```bash
     cd frontend && npm start
     ```
   - Add environment variables:
     - `REACT_APP_API_URL`: Your backend service URL

3. Configure domains:
   - Go to the "Settings" tab
   - Under "Domains", you can set up a custom domain or use the Railway-provided URL

### Verify Deployment

1. Check your deployment status in the Railway dashboard
2. Test your application by accessing the provided URLs
3. Monitor the logs for any potential issues

## Project Structure

```
├── frontend/               # React frontend
│   ├── public/            # Static files
│   └── src/              
│       ├── components/    # React components
│       └── ui/           # Reusable UI components
└── backend/               # Express backend
    └── server.js         # Main server file
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Troubleshooting

### Common Issues

1. **API Key Issues**
   - Ensure your Alpha Vantage API key is correctly set in the backend `.env` file
   - Check API rate limits (5 calls per minute for free tier)

2. **Build Issues**
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall: `rm -rf node_modules && npm install`

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Alpha Vantage](https://www.alphavantage.co/) for providing stock market data
- [Chart.js](https://www.chartjs.org/) for charting capabilities
- [Railway](https://railway.app/) for deployment platform
