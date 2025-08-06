import React, { useState } from 'react';

const LoginModal = ({ onClose, onLogin, onRegister, loading, error }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isManufacturer, setIsManufacturer] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegister) {
      onRegister(username, password, isManufacturer);
    } else {
      onLogin(username, password);
    }
  };

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <button style={styles.closeButton} onClick={onClose}>×</button>
        <h2 style={styles.title}>{isRegister ? 'Register' : 'Login'}</h2>
        
        {error && <div style={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label htmlFor="username" style={styles.label}>Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          
          <div style={styles.formGroup}>
            <label htmlFor="password" style={styles.label}>Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
            />
          </div>

          {isRegister && (
            <div style={styles.formGroup}>
              <label style={styles.label}>
                <input
                  type="checkbox"
                  checked={isManufacturer}
                  onChange={(e) => setIsManufacturer(e.target.checked)}
                />
                &nbsp; Register as Manufacturer
              </label>
            </div>
          )}
          
          <button type="submit" style={styles.submitButton} disabled={loading}>
            {loading ? 'Processing...' : isRegister ? 'Register' : 'Login'}
          </button>
        </form>
        
        <p style={styles.switchText}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}
          <button 
            style={styles.switchButton} 
            onClick={() => setIsRegister(!isRegister)}
          >
            {isRegister ? 'Login' : 'Register'}
          </button>
        </p>
      </div>
    </div>
  );
};

const styles = {
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '30px',
    width: '400px',
    maxWidth: '90%',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: '15px',
    right: '15px',
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#7f8c8d',
  },
  title: {
    textAlign: 'center',
    color: '#2c3e50',
    marginBottom: '25px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    color: '#7f8c8d',
  },
  input: {
    padding: '12px 15px',
    borderRadius: '5px',
    border: '1px solid #ddd',
    fontSize: '16px',
  },
  submitButton: {
    padding: '12px',
    backgroundColor: '#4a6fa5',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '10px',
  },
  switchText: {
    textAlign: 'center',
    marginTop: '20px',
    color: '#7f8c8d',
  },
  switchButton: {
    background: 'none',
    border: 'none',
    color: '#4a6fa5',
    textDecoration: 'underline',
    cursor: 'pointer',
    marginLeft: '5px',
  },
  error: {
    color: '#e74c3c',
    backgroundColor: '#fadbd8',
    padding: '10px',
    borderRadius: '5px',
    marginBottom: '20px',
    textAlign: 'center',
  },
};

export default LoginModal;
