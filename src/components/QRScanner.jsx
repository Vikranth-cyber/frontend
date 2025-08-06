import React, { useState, useRef, useEffect } from 'react';
import QrScanner from 'qr-scanner';
import 'qr-scanner/qr-scanner-worker.min.js';
import { scanProduct } from '../services/api';

const QRScanner = ({ onClose, token }) => {
  const videoRef = useRef(null);
  const scannerRef = useRef(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pincode, setPincode] = useState('');
  const [useWebcam, setUseWebcam] = useState(true);
  const [hasCamera, setHasCamera] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleScanSubmit = async (scanData) => {
    setLoading(true);
    setError('');
    try {
      const response = await scanProduct(scanData);
      setResult(response);
    } catch (err) {
      setError(err.message);
      setResult({
        status: 'error',
        message: err.message
      });
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
    if (!formSubmitted) return;

    const initScanner = async () => {
      try {
        const cameras = await QrScanner.listCameras();
        if (cameras.length === 0) {
          setUseWebcam(false);
          return;
        }

        setHasCamera(true);
        
        if (useWebcam && videoRef.current) {
          scannerRef.current = new QrScanner(
            videoRef.current,
            async (result) => {
              try {
                await handleScanSubmit({
                  product_id: result.data,
                  name,
                  phone,
                  pincode
                });
              } catch (err) {
                console.error('Scan error:', err);
              }
            },
            {
              highlightScanRegion: true,
              maxScansPerSecond: 1,
              preferredCamera: 'environment',
              returnDetailedScanResult: true
            }
          );
          
          await scannerRef.current.start();
          setIsScanning(true);
        }
      } catch (err) {
        console.error('Camera error:', err);
        setUseWebcam(false);
      }
    };

    initScanner();

    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop();
        scannerRef.current.destroy();
      }
    };
  }, [useWebcam, formSubmitted, name, phone, pincode]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!name || !phone || !pincode) {
      return;
    }
    setFormSubmitted(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const result = await QrScanner.scanImage(file);
      await handleScanSubmit({
        product_id: result,
        name,
        phone,
        pincode
      });
    } catch (err) {
      console.error('File scan error:', err);
      setError('Failed to scan QR code from image');
    }
  };

  const resetScanner = () => {
    setFormSubmitted(false);
    setResult(null);
  };

  const renderResult = () => {
    if (!result) return null;

    if (result.status === 'invalid') {
      return (
        <div style={styles.errorResult}>
          <h3>❌ Invalid Product</h3>
          <p>{result.message}</p>
          {result.scanned_code && (
            <div style={styles.scannedData}>
              <p><strong>Scanned Code:</strong> {result.scanned_code}</p>
            </div>
          )}
        </div>
      );
    }

    if (result.status === 'error') {
      return (
        <div style={styles.errorResult}>
          <h3>❌ Error</h3>
          <p>{result.message}</p>
        </div>
      );
    }

    return (
      <div style={result.status === 'already_scanned' ? styles.warningResult : styles.successResult}>
        <h3>
          {result.status === 'genuine' ? '✅ Genuine Product' : '⚠️ Already Scanned'}
        </h3>
        <div style={styles.productInfo}>
          <p><strong>Product ID:</strong> {result.product?.product_id}</p>
          <p><strong>Manufacturer:</strong> {result.product?.manufacturer}</p>
        </div>
        <p>{result.message}</p>
        {result.status === 'already_scanned' && result.first_scan && (
          <div style={styles.additionalInfo}>
            <p><strong>First scanned by:</strong> {result.first_scan.name}</p>
            <p><strong>First scan date:</strong> {new Date(result.first_scan.timestamp).toLocaleString()}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={styles.container}>
      <button style={styles.closeButton} onClick={onClose}>← Back</button>
      <h2 style={styles.title}>Product Verification</h2>
      
      {!formSubmitted ? (
        <form onSubmit={handleFormSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Pincode</label>
            <input
              type="text"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          
          <button 
            type="submit" 
            style={styles.submitButton}
            disabled={!name || !phone || !pincode}
          >
            Proceed to Scan
          </button>
        </form>
      ) : (
        <>
          <div style={styles.userInfo}>
            <p><strong>Name:</strong> {name}</p>
            <p><strong>Phone:</strong> {phone}</p>
            <p><strong>Pincode:</strong> {pincode}</p>
            <button 
              style={styles.changeButton} 
              onClick={resetScanner}
            >
              Change Details
            </button>
          </div>

          <div style={styles.scannerContainer}>
            {useWebcam ? (
              <div style={styles.videoContainer}>
                <video 
                  ref={videoRef} 
                  style={styles.video}
                  playsInline 
                />
                <div style={styles.scanOverlay}>
                  {isScanning ? 'Scanning...' : 'Camera ready'}
                </div>
              </div>
            ) : (
              <div style={styles.fileUploadContainer}>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileUpload}
                  style={styles.fileInput}
                  id="qr-upload"
                />
                <label htmlFor="qr-upload" style={styles.fileInputLabel}>
                  Upload QR Image
                </label>
              </div>
            )}
            
            <button 
              style={styles.toggleButton}
              onClick={() => setUseWebcam(!useWebcam)}
            >
              {useWebcam ? 'Upload QR Image Instead' : 'Use Webcam Instead'}
            </button>
          </div>

          {loading && (
            <div style={styles.loading}>
              Verifying product...
            </div>
          )}

          {renderResult()}
        </>
      )}
    </div>
  );
};

const styles = {
   container: {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '20px',
    width: '100%',
    height: '100%',
    margin: '0',
    boxSizing: 'border-box',
    overflowY: 'auto', // Changed from 'auto' to specifically vertical
    maxHeight: '90vh', // Limits height to 90% of viewport
    scrollbarWidth: 'thin', // For Firefox
    scrollbarColor: '#4a6fa5 #f1f1f1',
    },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#4a6fa5',
    fontSize: '16px',
    cursor: 'pointer',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  title: {
    color: '#2c3e50',
    marginBottom: '25px',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginBottom: '30px',
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
    padding: '15px',
    backgroundColor: '#4a6fa5',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '10px',
  },
  userInfo: {
    backgroundColor: '#f8f9fa',
    padding: '15px',
    borderRadius: '5px',
    marginBottom: '20px',
  },
  changeButton: {
    background: 'none',
    border: 'none',
    color: '#4a6fa5',
    cursor: 'pointer',
    marginTop: '10px',
    fontSize: '14px',
  },
  scannerContainer: {
    marginBottom: '30px',
  },
  videoContainer: {
    position: 'relative',
    width: '100%',
    height: '300px',
    backgroundColor: '#000',
    borderRadius: '8px',
    overflow: 'hidden',
    marginBottom: '15px',
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  scanOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    fontSize: '18px',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  fileUploadContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px',
    padding: '40px 20px',
    border: '2px dashed #ddd',
    borderRadius: '8px',
    marginBottom: '15px',
  },
  fileInput: {
    display: 'none',
  },
  fileInputLabel: {
    padding: '12px 20px',
    backgroundColor: '#4a6fa5',
    color: 'white',
    borderRadius: '5px',
    cursor: 'pointer',
    textAlign: 'center',
    fontWeight: '500',
  },
  toggleButton: {
    padding: '10px 15px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #ddd',
    borderRadius: '5px',
    cursor: 'pointer',
    display: 'block',
    margin: '0 auto',
  },
  successResult: {
    marginTop: '25px',
    padding: '15px',
    backgroundColor: '#d5f5e3',
    color: '#27ae60',
    borderRadius: '5px',
    textAlign: 'center',
  },
  warningResult: {
    marginTop: '25px',
    padding: '15px',
    backgroundColor: '#fdebd0',
    color: '#e67e22',
    borderRadius: '5px',
    textAlign: 'center',
  },
  errorResult: {
    marginTop: '25px',
    padding: '15px',
    backgroundColor: '#fadbd8',
    color: '#e74c3c',
    borderRadius: '5px',
    textAlign: 'center',
  },
  productInfo: {
    marginTop: '10px',
    padding: '10px',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: '5px',
  },
  additionalInfo: {
    marginTop: '10px',
    padding: '10px',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: '5px',
  },
  scannedData: {
    marginTop: '10px',
    padding: '10px',
    backgroundColor: '#f0f0f0',
    borderRadius: '5px',
    fontFamily: 'monospace'
  },
  loading: {
    padding: '15px',
    backgroundColor: '#f8f9fa',
    color: '#7f8c8d',
    borderRadius: '5px',
    marginTop: '20px',
    textAlign: 'center',
  }
};
export default QRScanner;