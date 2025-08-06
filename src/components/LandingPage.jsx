import React from 'react';

const LandingPage = ({ onLoginClick, onScanClick }) => {
  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h1 style={styles.title}>AuthentiScan</h1>
        <p style={styles.subtitle}>Verify product authenticity in seconds</p>
        
        <div style={styles.buttonContainer}>
          <button style={styles.primaryButton} onClick={onScanClick}>
            Scan QR
          </button>
          <button style={styles.secondaryButton} onClick={onLoginClick}>
            Login
          </button>
        </div>
      </div>
      
      <div style={styles.features}>
        <div style={styles.featureCard}>
          <h3 style={styles.featureTitle}>Instant Verification</h3>
          <p style={styles.featureText}>Quickly check if your product is genuine with our advanced scanning technology</p>
        </div>
        <div style={styles.featureCard}>
          <h3 style={styles.featureTitle}>Fraud Detection</h3>
          <p style={styles.featureText}>Get alerted about counterfeit products and suspicious activity</p>
        </div>
        <div style={styles.featureCard}>
          <h3 style={styles.featureTitle}>Secure Tracking</h3>
          <p style={styles.featureText}>Maintain a complete history of all your product verifications</p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    textAlign: 'center',
    padding: '40px 20px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '90%',
  },
  hero: {
    marginBottom: '80px',
  },
  title: {
    fontSize: '3.5rem',
    color: '#1e293b',
    marginBottom: '20px',
    fontWeight: '800',
    letterSpacing: '-0.5px',
    lineHeight: '1.2',
  },
  subtitle: {
    fontSize: '1.25rem',
    color: '#64748b',
    marginBottom: '48px',
    fontWeight: '400',
    maxWidth: '600px',
    marginLeft: 'auto',
    marginRight: 'auto',
    lineHeight: '1.6',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
  },
  primaryButton: {
    padding: '16px 32px',
    backgroundColor: '#4a6fa5',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 6px rgba(74, 111, 165, 0.2)',
    ':hover': {
      backgroundColor: '#3a5a80',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 8px rgba(74, 111, 165, 0.3)',
    },
  },
  secondaryButton: {
    padding: '16px 32px',
    backgroundColor: 'white',
    color: '#4a6fa5',
    border: '2px solid #4a6fa5',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ':hover': {
      backgroundColor: '#f8fafc',
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 6px rgba(74, 111, 165, 0.1)',
    },
  },
  features: {
    display: 'flex',
    justifyContent: 'center',
    gap: '30px',
    flexWrap: 'wrap',
  },
  featureCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '32px',
    width: '300px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    ':hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    },
  },
  featureTitle: {
    color: '#1e293b',
    fontSize: '1.25rem',
    marginBottom: '16px',
    fontWeight: '600',
  },
  featureText: {
    color: '#64748b',
    fontSize: '1rem',
    lineHeight: '1.6',
  },
};

export default LandingPage;