import joblib
from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np

app = Flask(__name__)
CORS(app)

model = joblib.load('option_pricing_model.pkl')

# Your model's parameters
true_alpha = 0.1
true_beta = 0.1
true_sigma0 = 0.2

def option_vol_from_surface(moneyness, time_to_maturity):
    vol = true_sigma0 + time_to_maturity * true_alpha + true_beta * np.square(moneyness - 1)
    return vol

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    print("Received data:", data)

    try:
        # Calculate moneyness from spot and strike prices
        spot_price = data['spot_price']
        strike_price = data['strike_price']
        time_to_maturity = data['time_to_maturity']
        
        # Calculate moneyness (K/S)
        moneyness = strike_price / spot_price
        
        # Calculate volatility using your surface function
        volatility = option_vol_from_surface(moneyness, time_to_maturity)
        
        # Prepare input for model (Moneyness, Time, Vol)
        X_input = [[moneyness, time_to_maturity, volatility]]
        
        # Make prediction
        prediction = model.predict(X_input)[0]
        
        # Since your model predicts normalized prices, multiply by spot price
        actual_price = prediction * spot_price
        
        return jsonify({'predicted_price': float(actual_price)})

    except Exception as e:
        print("Error:", str(e))
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)