#  Black-Scholes Option Pricing App

This is a full-stack educational web application designed to **predict European option prices** using the **Black-Scholes model**. It leverages machine learning techniques (specifically **Artificial Neural Networks**) and incorporates the theoretical foundations of option pricing models.

---

##  About the Model

The **Black-Scholes formula** is one of the most widely used models for pricing derivatives. However, like many financial models, it is built on a set of simplifying assumptions that may not hold in real markets.

###  Model Assumptions

This implementation assumes the following:
- The underlying asset follows **Geometric Brownian Motion (GBM)**.
- There is **no arbitrage** opportunity in the market.
- The option is **European-style** (can only be exercised at maturity).
- The asset has **constant volatility** (or volatility as a function of moneyness and time).
- The risk-free interest rate is constant.
- The market is frictionless (no transaction costs).
- The dividend yield `q` is set to **0** for simplicity.

###  The Black-Scholes Equation

The price of a **call option** under the Black-Scholes model is given by:

#### Equation 5-1:

$$C = S e^{-q\tau} \Phi(d_1) - e^{-r\tau} K \Phi(d_2)$$

where:

$$d_1 = \frac{\ln(S/K) + (r - q + \frac{\sigma^2}{2}) \tau}{\sigma\sqrt{\tau}}, \quad d_2 = d_1 - \sigma\sqrt{\tau}$$

To simplify, we use:

- **Moneyness**: $M = \frac{K}{S}$
- **Dividend yield**: $q = 0$

###  Simplified Equation:

$$C = \Phi\left(\frac{-\ln(M)+(r+\frac{\sigma^2}{2})\tau}{\sigma\sqrt{\tau}}\right) - M e^{-r\tau} \Phi\left(\frac{-\ln(M)+(r-\frac{\sigma^2}{2})\tau}{\sigma\sqrt{\tau}}\right)$$

This form highlights that **moneyness**, **volatility**, and **time to maturity** are key factors.

---

##  Volatility Surface Assumption

Since volatility is not constant in real markets, we simulate it using a **volatility surface**. The assumed structure is:

#### Equation 5-2:

$$\sigma(M, \tau) = \sigma_0 + \alpha\tau + \beta(M - 1)^2$$

Where:
- $M$: Moneyness
- $\tau$: Time to maturity
- $\sigma_0, \alpha, \beta$: Constants controlling base level and curvature of the surface

This captures **volatility smiles/skews**, which are observed in real options markets.

---

##  Machine Learning Implementation

We train an **Artificial Neural Network (ANN)** to learn the option pricing function.

### Model Training:
- Implemented in **Jupyter Notebook**
- Data can be:
  - **Real-world options data**
  - **Synthetic data**, based on the simplified Black-Scholes formula  
    > To use synthetic data, **uncomment the relevant code block** in the notebook

### Inputs:
- Moneyness (M)
- Time to maturity (τ)
- Volatility (σ)

### Output:
- Predicted option price (C)

---

##  Tech Stack

| Layer         | Technology          |
|---------------|---------------------|
| Frontend      | ReactJS             |
| Backend API   | Python (Flask)      |
| ML Model      | Artificial Neural Network (ANN) |
| Dev Tools     | Jupyter Notebook    |
| Data          | Synthetic + Real Options Data   |

---

##  Running the App

### Step 1: Clone the repository

```bash
git clone https://github.com/2626245/black-scholes.io.git
cd black-scholes.io
npm install
python server.py
```

Make sure Flask is installed and the server runs on a port accessible from your frontend (e.g. http://localhost:5000).

```bash
npm run dev
```

##  Jupyter Notebook Details
The training logic and data preprocessing are included in the notebook.

You can customize:
- Volatility surface parameters
- Network architecture
- Dataset source (real vs. synthetic)

If you prefer to test with synthetic data, uncomment the lines of code that generate it within the notebook.

##  Disclaimer
This application is for educational purposes only and does not constitute financial advice.

 The assumptions behind the Black-Scholes model do not always hold in real-world markets.

For better real-world modeling, consider:
- Merton Jump-Diffusion Model
- Stochastic Volatility Models (e.g., Heston Model)
- Monte Carlo Simulations
- Implied Volatility Calibration from Market Prices

##  Contributing
We welcome contributions!

If you'd like to:
- Improve the prediction model
- Enhance the UI
- Add new pricing models

Feel free to fork the repository and submit a pull request.
