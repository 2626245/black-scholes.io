import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Card, TextField, Paper, Chip, Stack, Container, Typography, Box, Button, 
  AppBar, Toolbar, ThemeProvider, createTheme, Grid, Divider, CircularProgress,
  InputAdornment, Snackbar, Alert, Autocomplete, Tooltip, IconButton, useMediaQuery
} from "@mui/material";
import { 
  AttachMoney, Timeline, ShowChart, Calculate, Refresh, Info, 
  TrendingUp, ArrowUpward, ArrowDownward, Visibility
} from '@mui/icons-material';
import { styled } from '@mui/system';

// Create a dark financial theme
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#2e7d32', // Green for positive financial outcomes
    },
    secondary: {
      main: '#ff9800', // Orange/gold for financial
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    success: {
      main: '#4caf50',
    },
    error: {
      main: '#f44336',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        fullWidth: true,
        size: 'small',
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

// Styled components for financial UI
const StockTicker = styled(Box)(({ theme }) => ({
  background: '#0d1b2a',
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(0.5, 2),
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  transition: 'all 0.2s',
  '&:hover': {
    background: '#1b263b',
  }
}));

const ResultCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '4px',
    background: 'linear-gradient(90deg, #2e7d32 0%, #4caf50 100%)',
  }
}));

const GlassPanel = styled(Paper)(({ theme }) => ({
  background: 'rgba(30, 30, 30, 0.7)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
}));

// Mock data 
const stocksData = {
  'AAPL': { price: 187.42, change: +1.24, changePercent: +0.67 },
  'MSFT': { price: 333.14, change: -0.89, changePercent: -0.27 },
  'GOOG': { price: 142.65, change: +0.78, changePercent: +0.55 },
  'AMZN': { price: 127.84, change: +2.31, changePercent: +1.84 },
  'TSLA': { price: 254.33, change: -4.21, changePercent: -1.63 },
  'NVDA': { price: 418.76, change: +12.45, changePercent: +3.06 },
  'AMD': { price: 115.32, change: +1.65, changePercent: +1.45 },
};

const Dashboard = () => {
  const [optionSymbol, setOptionSymbol] = useState('');
  const [selectedStock, setSelectedStock] = useState(null);
  const [optionData, setOptionData] = useState({
    spot_price: '',
    strike_price: '',
    time_to_maturity: '',
    volatility: '',
    risk_free_rate: '0.0433'
  });
  const [predictPrice, setPredictPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAlert, setShowAlert] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Reset fields when stock selection changes
  useEffect(() => {
    if (selectedStock) {
      setOptionData({
        ...optionData,
        spot_price: stocksData[selectedStock]?.price.toString() || ''
      });
    }
  }, [selectedStock]);

  const handleStockSelect = (stock) => {
    setSelectedStock(stock);
    // Generate a sample option symbol
    const strikeExample = Math.round(stocksData[stock]?.price * 1.05);
    setOptionSymbol(`${stock}220617C00${strikeExample}000`);
  };

  const handleChange = (e) => {
    setOptionData({ ...optionData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    // Validate inputs
    const requiredFields = ['spot_price', 'strike_price', 'time_to_maturity', 'volatility', 'risk_free_rate'];
    const missingFields = requiredFields.filter(field => !optionData[field]);
    
    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      setShowAlert(true);
      return;
    }

    setLoading(true);
    setPredictPrice(null);
    setError(null);

    try {
      const res = await axios.post('http://localhost:5000/predict', {
        ...optionData,
        spot_price: parseFloat(optionData.spot_price),
        strike_price: parseFloat(optionData.strike_price),
        time_to_maturity: parseFloat(optionData.time_to_maturity),
        volatility: parseFloat(optionData.volatility),
        risk_free_rate: parseFloat(optionData.risk_free_rate)
      });
      
      setPredictPrice(res.data.predicted_price);
    } catch (error) {
      console.error("Prediction Error:", error);
      setError('Error fetching prediction. Please check your inputs and try again.');
      setShowAlert(true);
    } finally {
      setLoading(false);
    }
  };

  // Calculate moneyness for display
  const moneyness = optionData.spot_price && optionData.strike_price ? 
    (parseFloat(optionData.spot_price) / parseFloat(optionData.strike_price)).toFixed(4) : '-';

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
        minHeight: '100vh', 
        backgroundColor: '#121212',
        background: 'linear-gradient(135deg, #121212 0%, #1e1e1e 100%)',
        py: 3
      }}>
        <Container maxWidth="lg">
          {/* Header */}
          <AppBar position="static" color="transparent" elevation={0} sx={{ mb: 4, borderRadius: 2 }}>
            <Toolbar sx={{ justifyContent: 'space-between' }}>
              <Typography variant="h4" sx={{ 
                fontWeight: 'bold', 
                background: 'linear-gradient(45deg, #4caf50, #81c784)',
                backgroundClip: 'text',
                textFillColor: 'transparent',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                <ShowChart sx={{ mr: 1, verticalAlign: 'middle' }} />
                OptionPricer Pro
              </Typography>
              
              <Button 
                variant="outlined" 
                color="secondary" 
                startIcon={<Refresh />}
                onClick={() => {
                  setOptionData({
                    spot_price: selectedStock ? stocksData[selectedStock]?.price.toString() : '',
                    strike_price: '',
                    time_to_maturity: '',
                    volatility: '',
                    risk_free_rate: '0.05'
                  });
                  setPredictPrice(null);
                }}
              >
                Reset
              </Button>
            </Toolbar>
          </AppBar>

          <Grid container spacing={3}>
            {/* Stock Ticker Panel */}
            <Grid item xs={12}>
              <GlassPanel sx={{ p: 2, mb: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Select Underlying Asset
                </Typography>
                <Stack 
                  direction="row" 
                  spacing={1.5} 
                  sx={{ 
                    overflowX: 'auto', 
                    py: 1, 
                    '&::-webkit-scrollbar': { height: '6px' },
                    '&::-webkit-scrollbar-track': { backgroundColor: 'rgba(0,0,0,0.1)' },
                    '&::-webkit-scrollbar-thumb': { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px' } 
                  }}
                >
                  {Object.keys(stocksData).map((stock) => (
                    <StockTicker 
                      key={stock} 
                      onClick={() => handleStockSelect(stock)}
                      sx={{ 
                        border: selectedStock === stock ? `1px solid ${theme.palette.primary.main}` : 'none',
                        boxShadow: selectedStock === stock ? `0 0 8px ${theme.palette.primary.main}` : 'none'
                      }}
                    >
                      <Box sx={{ mr: 2, fontWeight: 'bold' }}>{stock}</Box>
                      <Box sx={{ mr: 1 }}>${stocksData[stock].price.toFixed(2)}</Box>
                      <Box 
                        sx={{ 
                          color: stocksData[stock].change >= 0 ? 'success.main' : 'error.main',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                      >
                        {stocksData[stock].change >= 0 ? 
                          <ArrowUpward fontSize="small" sx={{ mr: 0.5 }} /> : 
                          <ArrowDownward fontSize="small" sx={{ mr: 0.5 }} />}
                        {stocksData[stock].changePercent > 0 ? '+' : ''}
                        {stocksData[stock].changePercent.toFixed(2)}%
                      </Box>
                    </StockTicker>
                  ))}
                </Stack>
              </GlassPanel>
            </Grid>

            {/* Left Column - Input Form */}
            <Grid item xs={12} md={7}>
              <GlassPanel sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Visibility sx={{ mr: 1 }} /> Option Pricing Parameters
                </Typography>
                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 3 }}>
                  <TextField
                    label="Option Symbol"
                    value={optionSymbol}
                    onChange={(e) => setOptionSymbol(e.target.value)}
                    placeholder="e.g. AAPL220617C00150000"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Timeline />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title="Format: Symbol + Expiry Date + Call/Put + Strike Price">
                            <IconButton size="small">
                              <Info fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </InputAdornment>
                      )
                    }}
                  />
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField 
                      label="Spot Price ($)" 
                      name="spot_price"
                      value={optionData.spot_price} 
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AttachMoney />
                          </InputAdornment>
                        )
                      }} 
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField 
                      label="Strike Price ($)" 
                      name="strike_price" 
                      value={optionData.strike_price} 
                      onChange={handleChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AttachMoney />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField 
                      label="Time to Maturity (years)" 
                      name="time_to_maturity" 
                      value={optionData.time_to_maturity} 
                      onChange={handleChange}
                      placeholder="e.g. 0.5 for 6 months"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <TrendingUp />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField 
                      label="Volatility (decimal)" 
                      name="volatility" 
                      value={optionData.volatility} 
                      onChange={handleChange}
                      placeholder="e.g. 0.25 for 25%"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <ShowChart />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField 
                      label="Risk-Free Rate (decimal)" 
                      name="risk_free_rate" 
                      value={optionData.risk_free_rate} 
                      onChange={handleChange}
                      placeholder="e.g. 0.05 for 5%"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <ShowChart />
                          </InputAdornment>
                        )
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sx={{ mt: 2 }}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      fullWidth 
                      size="large"
                      onClick={handleSubmit}
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : <Calculate />}
                      sx={{ py: 1.5 }}
                    >
                      {loading ? 'Computing Price...' : 'Calculate Option Price'}
                    </Button>
                  </Grid>
                </Grid>
              </GlassPanel>
            </Grid>

            {/* Right Column - Results & Stats */}
            <Grid item xs={12} md={5}>
              <Stack spacing={3}>
                {/* Key Metrics */}
                <GlassPanel sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    <ShowChart sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Option Metrics
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Moneyness (S/K)</Typography>
                      <Typography variant="h6">{moneyness}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Option Type</Typography>
                      <Chip 
                        label="Call Option" 
                        color="success" 
                        size="small" 
                        sx={{ fontWeight: 'bold' }} 
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Days to Expiry</Typography>
                      <Typography variant="h6">
                        {optionData.time_to_maturity ? 
                          Math.round(parseFloat(optionData.time_to_maturity) * 365) : '-'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Implied Vol</Typography>
                      <Typography variant="h6">
                        {optionData.volatility ? 
                          `${(parseFloat(optionData.volatility) * 100).toFixed(2)}%` : '-'}
                      </Typography>
                    </Grid>
                  </Grid>
                </GlassPanel>

                {/* Result Card */}
                <ResultCard elevation={6}>
                  <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                    Option Price Model Prediction
                  </Typography>
                  
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : predictPrice ? (
                    <>
                      <Typography 
                        variant="h4" 
                        color="primary" 
                        sx={{ 
                          fontWeight: 'bold', 
                          fontSize: '2.5rem',
                          textShadow: '0 0 10px rgba(76, 175, 80, 0.3)' 
                        }}
                      >
                        ${predictPrice.toFixed(2)}
                      </Typography>
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
                        <Chip 
                          label={`IV: ${optionData.volatility ? 
                            (parseFloat(optionData.volatility) * 100).toFixed(1) : 0}%`} 
                          color="secondary" 
                          variant="outlined" 
                          size="small" 
                        />
                        <Chip 
                          label={optionData.spot_price && optionData.strike_price && 
                            parseFloat(optionData.spot_price) > parseFloat(optionData.strike_price) ? 
                            "In The Money" : "Out of The Money"} 
                          color={optionData.spot_price && optionData.strike_price && 
                            parseFloat(optionData.spot_price) > parseFloat(optionData.strike_price) ? 
                            "success" : "error"} 
                          variant="outlined" 
                          size="small" 
                        />
                      </Box>
                    </>
                  ) : (
                    <Box sx={{ py: 3, px: 2 }}>
                      <Typography variant="body1" color="text.secondary">
                        Fill in the parameters and click Calculate to get a price prediction
                      </Typography>
                    </Box>
                  )}

                  {/* Black-Scholes Reference Card */}
                  {predictPrice && (
                    <Box sx={{ mt: 3, pt: 3, borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Black-Scholes Reference Price
                      </Typography>
                      <Typography variant="h6">
                        ${calculateBlackScholes().toFixed(2)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Difference: {calculatePriceDifference()}%
                      </Typography>
                    </Box>
                  )}
                </ResultCard>

                {/* Additional Financial Information */}
                {selectedStock && (
                  <GlassPanel sx={{ p: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {selectedStock} Market Data
                    </Typography>
                    <Divider sx={{ my: 1 }} />
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Market Cap</Typography>
                        <Typography variant="body1">$2.45T</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">P/E Ratio</Typography>
                        <Typography variant="body1">28.5</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">52W High</Typography>
                        <Typography variant="body1">$198.23</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">52W Low</Typography>
                        <Typography variant="body1">$124.17</Typography>
                      </Grid>
                    </Grid>
                  </GlassPanel>
                )}
              </Stack>
            </Grid>
          </Grid>

          {/* Footer */}
          <Box sx={{ mt: 4, textAlign: 'center', opacity: 0.7 }}>
            <Typography variant="caption" color="text.secondary">
              Powered by AI-Enhanced Black-Scholes • Options pricing is approximate and for educational purposes only
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* Error Alert */}
      <Snackbar 
        open={showAlert} 
        autoHideDuration={6000} 
        onClose={() => setShowAlert(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setShowAlert(false)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );

  // Helper function to calculate Black-Scholes price (simplified)
  function calculateBlackScholes() {
    // This is a simplified Black-Scholes implementation
    if (!optionData.spot_price || !optionData.strike_price || 
        !optionData.time_to_maturity || !optionData.volatility || 
        !optionData.risk_free_rate) {
      return 0;
    }

    const S = parseFloat(optionData.spot_price);
    const K = parseFloat(optionData.strike_price);
    const T = parseFloat(optionData.time_to_maturity);
    const sigma = parseFloat(optionData.volatility);
    const r = parseFloat(optionData.risk_free_rate);
    
    // Standard normal cumulative distribution function
    function normalCDF(x) {
      const a1 = 0.254829592;
      const a2 = -0.284496736;
      const a3 = 1.421413741;
      const a4 = -1.453152027;
      const a5 = 1.061405429;
      const p = 0.3275911;
      
      const sign = x < 0 ? -1 : 1;
      x = Math.abs(x) / Math.sqrt(2);
      
      const t = 1 / (1 + p * x);
      const erf = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
      
      return 0.5 * (1 + sign * erf);
    }
    
    const d1 = (Math.log(S / K) + (r + sigma * sigma / 2) * T) / (sigma * Math.sqrt(T));
    const d2 = d1 - sigma * Math.sqrt(T);
    
    // Call option price
    return S * normalCDF(d1) - K * Math.exp(-r * T) * normalCDF(d2);
  }

  // Calculate percentage difference between ML and Black-Scholes
  function calculatePriceDifference() {
    if (!predictPrice) return 0;
    
    const bsPrice = calculateBlackScholes();
    if (bsPrice === 0) return 0;
    
    const difference = ((predictPrice - bsPrice) / bsPrice) * 100;
    return difference > 0 ? `+${difference.toFixed(2)}` : difference.toFixed(2);
  }
};

export default Dashboard;