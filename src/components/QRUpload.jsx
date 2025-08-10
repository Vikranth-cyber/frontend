import React, { useState } from 'react';
import Modal from 'react-modal';

const QRUpload = ({ token, loading, error, onUpload }) => {
  const [file, setFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadError('');
    setValidationErrors([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !token) return;

    setIsLoading(true);
    setUploadError('');
    setValidationErrors([]);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/upload_csv`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.missing_fields || errorData.missing_data) {
          setValidationErrors(errorData.missing_data || [
            { row: 'Header', missing_fields: errorData.missing_fields }
          ]);
          setModalIsOpen(true);
          throw new Error('CSV validation failed');
        }
        throw new Error(errorData.message || 'Upload failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'qrcodes.zip';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      alert('QR Codes generated and download started.');
      onUpload(file);
      setFile(null);
    } catch (err) {
      if (err.message !== 'CSV validation failed') {
        setUploadError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setValidationErrors([]);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Upload Product CSV</h2>
      <p style={styles.subtitle}>Upload a CSV file to generate and download QR codes for your products</p>

      {error && <div style={styles.error}>{error}</div>}
      {uploadError && <div style={styles.error}>{uploadError}</div>}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.fileUploadContainer}>
          <input
            type="file"
            id="csv-upload"
            accept=".csv"
            onChange={handleFileChange}
            style={styles.fileInput}
            required
          />
          <label htmlFor="csv-upload" style={styles.fileInputLabel}>
            {file ? file.name : 'Choose CSV File'}
          </label>
          {file && (
            <button type="button" style={styles.clearButton} onClick={() => setFile(null)}>
              Clear
            </button>
          )}
        </div>

        <p style={styles.note}>CSV must contain columns: unique_id, manufacturer, product_name, expiry_date</p>

        <button type="submit" style={styles.submitButton} disabled={isLoading || !file}>
          {isLoading ? 'Uploading...' : 'Generate & Download QR Codes'}
        </button>
      </form>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={modalStyles}
        contentLabel="CSV Validation Errors"
        ariaHideApp={false}
      >
        <h2 style={modalStyles.title}>CSV Validation Error</h2>
        <p style={modalStyles.message}>
          The CSV file has the following validation issues:
        </p>
        
        {validationErrors.map((error, index) => (
          <div key={index} style={modalStyles.errorItem}>
            <strong>{error.row === 'Header' ? 'Header' : `Row ${error.row}`}:</strong>
            <ul style={modalStyles.list}>
              {error.missing_fields.map((field, i) => (
                <li key={i} style={modalStyles.listItem}>Missing {field}</li>
              ))}
            </ul>
          </div>
        ))}
        
        <p style={modalStyles.message}>Please correct the CSV file and try again.</p>
        <button style={modalStyles.button} onClick={closeModal}>
          Close
        </button>
      </Modal>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: 'white',
    borderRadius: '10px',
    padding: '30px',
    width: '100%',
    margin: '0 auto',
  },
  title: {
    color: '#2c3e50',
    marginBottom: '10px',
    textAlign: 'center',
  },
  subtitle: {
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: '30px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  fileUploadContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  fileInput: {
    display: 'none',
  },
  fileInputLabel: {
    padding: '15px 25px',
    backgroundColor: '#f8f9fa',
    border: '1px dashed #ddd',
    borderRadius: '5px',
    cursor: 'pointer',
    flexGrow: 1,
    textAlign: 'center',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  clearButton: {
    padding: '15px 20px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #ddd',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  note: {
    color: '#7f8c8d',
    fontSize: '14px',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  submitButton: {
    padding: '15px',
    backgroundColor: '#4a6fa5',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    '&:disabled': {
      backgroundColor: '#cccccc',
      cursor: 'not-allowed',
    },
  },
  error: {
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: '10px',
    backgroundColor: '#fadbd8',
    padding: '10px',
    borderRadius: '5px',
  },
};

const modalStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    zIndex: 1000,
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    maxWidth: '500px',
    width: '80%',
    padding: '30px',
    borderRadius: '10px',
    backgroundColor: 'white',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
  },
  title: {
    color: '#e74c3c',
    marginBottom: '20px',
    textAlign: 'center',
  },
  message: {
    color: '#2c3e50',
    marginBottom: '15px',
    textAlign: 'center',
  },
  errorItem: {
    marginBottom: '15px',
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '5px',
  },
  list: {
    margin: '10px 0 0 0',
    paddingLeft: '20px',
  },
  listItem: {
    color: '#e74c3c',
    marginBottom: '8px',
  },
  button: {
    display: 'block',
    margin: '20px auto 0',
    padding: '10px 20px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    '&:hover': {
      backgroundColor: '#c0392b',
    },
  },
};

export default QRUpload;