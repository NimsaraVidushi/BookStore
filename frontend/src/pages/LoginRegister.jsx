import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const LoginRegister = () => {
  const { user, login, register, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoginTab, setIsLoginTab] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regAddress, setRegAddress] = useState({
    street: '',
    city: '',
    postalCode: ''
  });

  // Redirect if user already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [user, navigate]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!loginEmail || !loginPassword) {
      setErrorMsg('Please fill out all fields');
      return;
    }

    const result = await login(loginEmail, loginPassword);
    if (result.success) {
      if (result.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      setErrorMsg(result.message);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!regName || !regEmail || !regPassword || !regConfirmPassword) {
      setErrorMsg('Please fill out all required fields');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long');
      return;
    }

    const result = await register(regName, regEmail, regPassword, regAddress);
    if (result.success) {
      if (result.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } else {
      setErrorMsg(result.message);
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setRegAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="auth-page-container">
      <div className="auth-portal-card">
        {/* Toggle tabs */}
        <div className="auth-tabs-header">
          <button
            onClick={() => { setIsLoginTab(true); setErrorMsg(''); }}
            className={`auth-tab-btn ${isLoginTab ? 'active-tab' : ''}`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsLoginTab(false); setErrorMsg(''); }}
            className={`auth-tab-btn ${!isLoginTab ? 'active-tab' : ''}`}
          >
            Create Account
          </button>
        </div>

        {errorMsg && <div className="alert-message alert-error auth-error-alert">{errorMsg}</div>}

        {isLoginTab ? (
          /* LOGIN FORM */
          <form onSubmit={handleLoginSubmit} className="auth-portal-form">
            <h2>Welcome Back</h2>
            <p className="auth-subtitle">Please log in to continue managing your books and orders.</p>

            <div className="form-group-item">
              <label htmlFor="login-email">Email Address</label>
              <input
                type="email"
                id="login-email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                placeholder="e.g. email@domain.com"
                className="auth-input-field"
              />
            </div>

            <div className="form-group-item">
              <label htmlFor="login-password">Password</label>
              <input
                type="password"
                id="login-password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                placeholder="Enter password"
                className="auth-input-field"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`btn-auth-submit-action ${loading ? 'btn-disabled' : ''}`}
            >
              {loading ? 'Authenticating...' : 'Sign In 🗝️'}
            </button>
          </form>
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handleRegisterSubmit} className="auth-portal-form">
            <h2>Create Account</h2>
            <p className="auth-subtitle">Join us today to explore, purchase and review books!</p>

            <div className="form-group-item">
              <label htmlFor="reg-name">Full Name *</label>
              <input
                type="text"
                id="reg-name"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                required
                placeholder="e.g. John Doe"
                className="auth-input-field"
              />
            </div>

            <div className="form-group-item">
              <label htmlFor="reg-email">Email Address *</label>
              <input
                type="email"
                id="reg-email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
                placeholder="e.g. email@domain.com"
                className="auth-input-field"
              />
            </div>

            <div className="form-group-row">
              <div className="form-group-item">
                <label htmlFor="reg-password">Password *</label>
                <input
                  type="password"
                  id="reg-password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                  placeholder="Min 6 characters"
                  className="auth-input-field"
                />
              </div>

              <div className="form-group-item">
                <label htmlFor="reg-confirm">Confirm Password *</label>
                <input
                  type="password"
                  id="reg-confirm"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-enter password"
                  className="auth-input-field"
                />
              </div>
            </div>

            {/* Optional Address section */}
            <div className="auth-address-collapsible">
              <h3>Shipping Address (Optional)</h3>
              
              <div className="form-group-item">
                <label htmlFor="reg-street">Street Address</label>
                <input
                  type="text"
                  id="reg-street"
                  name="street"
                  value={regAddress.street}
                  onChange={handleAddressChange}
                  placeholder="e.g. 123 Main St"
                  className="auth-input-field"
                />
              </div>

              <div className="form-group-row">
                <div className="form-group-item">
                  <label htmlFor="reg-city">City</label>
                  <input
                    type="text"
                    id="reg-city"
                    name="city"
                    value={regAddress.city}
                    onChange={handleAddressChange}
                    placeholder="e.g. Colombo"
                    className="auth-input-field"
                  />
                </div>

                <div className="form-group-item">
                  <label htmlFor="reg-postal">Postal Code</label>
                  <input
                    type="text"
                    id="reg-postal"
                    name="postalCode"
                    value={regAddress.postalCode}
                    onChange={handleAddressChange}
                    placeholder="e.g. 00100"
                    className="auth-input-field"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`btn-auth-submit-action ${loading ? 'btn-disabled' : ''}`}
            >
              {loading ? 'Creating Account...' : 'Register 🚀'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginRegister;
