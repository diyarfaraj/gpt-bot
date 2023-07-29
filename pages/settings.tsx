// components/FileUpload.tsx

import { useRef, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { LoadingButton } from '@mui/lab';

export default function Settings() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const apiuri = process.env.NEXT_PUBLIC_CHATBOT_SERVER_URL;

  const handleFileChange = (e: any) => {
    setFile(e.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!file) {
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    setLoading(true);
    try {
      const response = await fetch(`${apiuri}/api/uploadPdf`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const result = await response.json();
      alert('File uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file');
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setFile(null);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        ref={fileInputRef}
      />
      <LoadingButton
        variant="contained"
        color="primary"
        onClick={handleFileUpload}
        loading={loading}
        loadingIndicator={<CircularProgress size={24} />}
      >
        Save
      </LoadingButton>
    </div>
  );
}
