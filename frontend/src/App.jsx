import React, { useState, useEffect, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale,
} from 'chart.js';
import { Chart } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import 'chartjs-adapter-date-fns';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import { motion } from 'framer-motion';
import { X, RefreshCw, PlusCircle, Calendar } from 'lucide-react';
import './App.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,    // Register scales first
  LinearScale,
  TimeScale,
  PointElement,    // Then register elements
  LineElement,
  Title,           // Then register plugins
  Tooltip,
  Legend,
  Filler,
  zoomPlugin
);

// Ensure Interaction is available globally
Chart.Interaction = Chart.Interaction || {};

// Dynamic color generation function
const generateColor = (index) => {
  const hue = (index * 137.508) % 360; // Use golden angle approximation
  return `hsl(${hue}, 70%, 60%)`;
};

// Predefined date ranges are kept as they are configuration options, not dummy data
const dateRangeOptions = [
  { label: '1W', days: 7 },
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: 'YTD', type: 'ytd' },
  { label: 'All', type: 'all' }
];

const API_BASE_URL = 'http://localhost:5000/api';

export default function App() {
  const [stocks, setStocks] = useState([]);
  const [stockData, setStockData] = useState({});
  const [filteredStockData, setFilteredStockData] = useState({});
  const [newSymbol, setNewSymbol] = useState('');
  const [chartRef, setChartRef] = useState(null);
  const [chartHeight, setChartHeight] = useState(400);
  const [isMobile, setIsMobile] = useState(false);
  const [activeDateRange, setActiveDateRange] = useState('All');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({
    start: '',
    end: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Update fetchStockData with better error handling
  const fetchStockData = async (symbol) => {
    try {
      const response = await fetch(`${API_BASE_URL}/stocks/${symbol}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch ${symbol} data`);
      }
      const data = await response.json();
      if (!data || data.length === 0) {
        throw new Error(`No data available for ${symbol}`);
      }
      return data;
    } catch (error) {
      console.error(`Error fetching ${symbol} data:`, error);
      throw error;
    }
  };

  // Load stock data when stocks array changes
  useEffect(() => {
    const loadStockData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const newData = {};
        await Promise.all(
          stocks.map(async (symbol) => {
            try {
              newData[symbol] = await fetchStockData(symbol);
            } catch (error) {
              console.error(`Failed to fetch ${symbol}:`, error);
            }
          })
        );
        setStockData(newData);
        setFilteredStockData(newData);
      } catch (error) {
        setError('Failed to fetch stock data');
        console.error('Error loading stock data:', error);
      }
      setIsLoading(false);
    };

    if (stocks.length > 0) {
      loadStockData();
    }
  }, [stocks]);

  const addStock = async () => {
    const symbol = newSymbol.trim().toUpperCase();
    if (symbol && !stocks.includes(symbol)) {
      setIsLoading(true);
      try {
        const data = await fetchStockData(symbol);
        setStocks(prev => [...prev, symbol]);
        setStockData(prev => ({
          ...prev,
          [symbol]: data
        }));
        setFilteredStockData(prev => ({
          ...prev,
          [symbol]: data
        }));
        setNewSymbol('');
      } catch (error) {
        setError(`Failed to add ${symbol}. Please check if the symbol is correct.`);
      }
      setIsLoading(false);
    }
  };

  const removeStock = (symbol) => {
    setStocks(stocks.filter(s => s !== symbol));
  };

  const resetZoom = () => {
    if (chartRef) {
      chartRef.resetZoom();
    }
  };

  const handleDateRangeSelect = (range) => {
    setActiveDateRange(range);
    if (range !== 'Custom') {
      setShowDatePicker(false);
    } else {
      setShowDatePicker(true);
    }
  };

  const handleCustomDateChange = (e) => {
    setCustomDateRange({
      ...customDateRange,
      [e.target.name]: e.target.value
    });
  };

  const applyCustomDateRange = () => {
    if (customDateRange.start && customDateRange.end) {
      setActiveDateRange('Custom');
      applyCustomDateFilter();
      setShowDatePicker(false);
    }
  };

  const applyPredefinedDateFilter = useCallback((rangeType) => {
    let filteredData = {};
    const today = new Date();
    let startDate;
    
    switch (rangeType) {
      case '1W':
        startDate = new Date();
        startDate.setDate(today.getDate() - 7);
        break;
      case '1M':
        startDate = new Date();
        startDate.setMonth(today.getMonth() - 1);
        break;
      case '3M':
        startDate = new Date();
        startDate.setMonth(today.getMonth() - 3);
        break;
      case 'YTD':
        startDate = new Date(today.getFullYear(), 0, 1); // Jan 1 of current year
        break;
      case 'All':
      default:
        // No filtering needed for "All"
        setFilteredStockData(stockData);
        return;
    }
    
    const startDateStr = startDate.toISOString().split('T')[0];
    
    // Filter each stock's data
    Object.keys(stockData).forEach(symbol => {
      filteredData[symbol] = stockData[symbol].filter(entry => 
        entry.date >= startDateStr
      );
    });
    
    setFilteredStockData(filteredData);
  }, [stockData]);

  const applyCustomDateFilter = useCallback(() => {
    if (!customDateRange.start || !customDateRange.end) return;
    
    let filteredData = {};
    
    // Filter each stock's data
    Object.keys(stockData).forEach(symbol => {
      filteredData[symbol] = stockData[symbol].filter(entry => 
        entry.date >= customDateRange.start && entry.date <= customDateRange.end
      );
    });
    
    setFilteredStockData(filteredData);
  }, [customDateRange.start, customDateRange.end, stockData]);

  // Check for mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setChartHeight(window.innerWidth < 768 ? 300 : 400);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Apply date filter
  useEffect(() => {
    if (activeDateRange === 'Custom' && customDateRange.start && customDateRange.end) {
      applyCustomDateFilter();
    } else {
      applyPredefinedDateFilter(activeDateRange);
    }
  }, [activeDateRange, customDateRange, stockData, applyCustomDateFilter, applyPredefinedDateFilter]);

  const chartData = {
    labels: stocks.length > 0 && filteredStockData[stocks[0]] ? filteredStockData[stocks[0]].map(entry => entry.date) : [],
    datasets: stocks.map((symbol, idx) => {
      if (!filteredStockData[symbol]) return null;
      const color = generateColor(idx);
      return {
        label: symbol,
        data: filteredStockData[symbol].map(entry => entry.price),
        fill: true,
        tension: 0.4,
        borderColor: color,
        backgroundColor: `${color}15`,
        borderWidth: 2,
        pointRadius: isMobile ? 2 : 3,
        pointHoverRadius: isMobile ? 4 : 6,
        pointBackgroundColor: color,
        pointHoverBackgroundColor: '#fff',
        pointBorderColor: '#fff',
        pointHoverBorderColor: color,
      };
    }).filter(Boolean)
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: !isMobile, // Hide legend on mobile
        labels: { 
          color: '#fff',
          boxWidth: 12,
          padding: 15,
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          }
        } 
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        callbacks: {
          label: context => `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`,
        },
        titleFont: {
          size: 13,
          family: "'Inter', sans-serif",
          weight: '600'
        },
        bodyFont: {
          size: 12,
          family: "'Inter', sans-serif"
        }
      },
      zoom: {
        pan: {
          enabled: true,
          mode: 'x',
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true,
          },
          mode: 'x',
        },
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: determineDateUnit(),
          tooltipFormat: 'MMM d, yyyy'
        },
        ticks: {
          color: '#ccc',
          maxRotation: isMobile ? 45 : 0,
          autoSkip: true,
          maxTicksLimit: isMobile ? 5 : 10
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.06)',
          drawBorder: false
        },
        border: {
          display: false
        }
      },
      y: {
        ticks: {
          callback: value => `$${value}`,
          color: 'rgba(255, 255, 255, 0.6)',
          font: {
            size: 11,
            family: "'Inter', sans-serif"
          }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.06)',
          drawBorder: false
        },
        border: {
          display: false
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    elements: {
      line: {
        borderWidth: 2,
        borderJoinStyle: 'round'
      }
    }
  };

  // Determine appropriate date unit based on selected range
  function determineDateUnit() {
    switch (activeDateRange) {
      case '1W':
        return 'day';
      case '1M':
        return 'day';
      case '3M':
        return 'week';
      case 'YTD':
      case 'All':
      default:
        return 'month';
    }
  }

  // Update input handling to work better on mobile
  const handleInputKeyPress = (e) => {
    if (e.key === 'Enter' || e.keyCode === 13) {
      e.preventDefault();
      addStock();
    }
  };

  return (
    <div className="container">
      <motion.h1
        className="title"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Stock Market Dashboard
      </motion.h1>

      {error && (
        <div className="error-message bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg mb-4">
          <p className="font-medium">{error}</p>
          <p className="text-sm mt-1 opacity-80">Please try again or check your connection.</p>
        </div>
      )}

      <motion.div
        className="input-section"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="input-container">
          <div className="stock-input-wrapper">
            <Input
              className="stock-input"
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value)}
              placeholder="Enter stock symbol"
              onKeyPress={handleInputKeyPress}
              type="text" // Explicitly set input type
              inputMode="text" // Better mobile keyboard
              autoCapitalize="characters" // Auto capitalize for stock symbols
            />
            <Button 
              className="add-icon-button"
              onClick={addStock}
            >
              <PlusCircle size={18} className="add-icon" />
            </Button>
          </div>
          <Button 
            className="add-stock-button"
            onClick={addStock}
          >
            Add Stock
          </Button>
        </div>

        <div className="stock-tags">
          {stocks.map((symbol, idx) => (
            <div 
              key={symbol}
              className="stock-tag"
              style={{ backgroundColor: `${generateColor(idx)}15`, borderColor: generateColor(idx) }}
            >
              <span style={{ color: generateColor(idx) }}>{symbol}</span>
              <button 
                onClick={() => removeStock(symbol)}
                className="stock-tag-remove"
                aria-label={`Remove ${symbol}`}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        className="chart-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {isLoading ? (
          <div className="loading-state flex items-center justify-center h-[300px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="chart-header">
              <h2 className="chart-title">Stock Comparison Chart</h2>
              
              <div className="date-controls">
                <div className="date-buttons">
                  {dateRangeOptions.map(option => (
                    <Button
                      key={option.label}
                      className={`date-button ${activeDateRange === option.label ? 'active' : 'inactive'}`}
                      onClick={() => handleDateRangeSelect(option.label)}
                    >
                      {option.label}
                    </Button>
                  ))}
                  <Button
                    className={`date-button ${activeDateRange === 'Custom' ? 'active' : 'inactive'}`}
                    onClick={() => handleDateRangeSelect('Custom')}
                  >
                    <Calendar size={12} className="date-icon" /> 
                    <span className="date-custom-text">Custom</span>
                  </Button>
                  
                  <Button 
                    className="date-button reset-button"
                    onClick={resetZoom}
                  >
                    <RefreshCw size={14} /> Reset
                  </Button>
                </div>
                
                {showDatePicker && (
                  <div className="date-picker">
                    <div className="date-input-group">
                      <label htmlFor="start-date">From:</label>
                      <Input
                        id="start-date"
                        type="date"
                        name="start"
                        value={customDateRange.start}
                        onChange={handleCustomDateChange}
                        className="date-picker-input"
                      />
                    </div>
                    <div className="date-input-group">
                      <label htmlFor="end-date">To:</label>
                      <Input
                        id="end-date"
                        type="date"
                        name="end"
                        value={customDateRange.end}
                        onChange={handleCustomDateChange}
                        className="date-picker-input"
                      />
                    </div>
                    <Button
                      className="date-apply-button"
                      onClick={applyCustomDateRange}
                    >
                      Apply
                    </Button>
                  </div>
                )}
                
                {isMobile && (
                  <div className="mobile-legend">
                    <div className="legend-content">
                      {stocks.map((symbol, idx) => (
                        <div key={symbol} className="legend-item">
                          <div className="legend-dot" style={{ backgroundColor: generateColor(idx) }} />
                          <span>{symbol}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="chart-wrapper" style={{ height: `${chartHeight}px` }}>
              {stocks.length > 0 ? (
                <Line 
                  data={chartData} 
                  options={options} 
                  ref={setChartRef}
                />
              ) : (
                <div className="empty-state">
                  <p>No stocks selected.</p>
                  <p className="empty-state-subtitle">Add a stock symbol above to see the chart.</p>
                </div>
              )}
            </div>
            
            <div className="date-range-summary">
              {activeDateRange === 'Custom' ? (
                <>Showing data from {customDateRange.start} to {customDateRange.end}</>
              ) : (
                <>Showing {activeDateRange} data</>
              )}
            </div>
          </>
        )}
      </motion.div>
      
      {isMobile && (
        <motion.div 
          className="mobile-instructions"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p>Pinch to zoom • Drag to pan • Tap "Reset" to restore view</p>
        </motion.div>
      )}

      <motion.div 
        className="container mx-auto flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 py-8 mt-8 border-t border-gray-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <div className="text-sm text-gray-400">
          Created by Saiful Abidin
        </div>
        <div className="flex items-center space-x-6">
          <a href="https://twitter.com/syaifulosd" className="text-gray-400 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-x-twitter text-lg"></i>
          </a>
          <a href="https://github.com/saifulabidin" className="text-gray-400 hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-github text-lg"></i>
          </a>
        </div>
        <div className="text-sm text-gray-400">
          Powered by <a href="https://foursquare.com/" className="text-purple-400 hover:text-purple-300 transition-colors" target="_blank" rel="noopener noreferrer">Alpha Vantage API</a>
        </div>
      </motion.div>
    </div>
  );
}
