import React, { useState } from 'react';

const QRUpload = ({ token, loading, error, onUpload }) => {
  const [file, setFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !token) return;

    setIsLoading(true);
    setUploadError('');

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
  const errorText = await response.text();
  throw new Error(errorText || 'Upload failed');
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
      setUploadError(err.message);
    } finally {
      setIsLoading(false);
    }
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

        <p style={styles.note}>CSV must contain columns: unique_id, manufacturer</p>

        <button type="submit" style={styles.submitButton} disabled={isLoading || !file}>
          {isLoading ? 'Uploading...' : 'Generate & Download QR Codes'}
        </button>
      </form>
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

export default QRUpload;
