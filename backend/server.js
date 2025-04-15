const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/stocks/:symbol', async (req, res) => {
    try {
        const { symbol } = req.params;
        const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
        
        // Fetching daily time series data
        const response = await axios.get(
            `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}&outputsize=compact`
        );

        if (response.data['Error Message']) {
            return res.status(404).json({ error: 'Stock symbol not found' });
        }

        const timeSeriesData = response.data['Time Series (Daily)'];
        
        // Transform the data to match frontend format
        const formattedData = Object.entries(timeSeriesData).map(([date, values]) => ({
            date,
            price: parseFloat(values['4. close'])
        })).reverse(); // Reverse to get chronological order

        res.json(formattedData);
    } catch (error) {
        console.error('Error fetching stock data:', error.message);
        res.status(500).json({ error: 'Failed to fetch stock data' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});