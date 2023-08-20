// components/Settings.tsx

import { useRef, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import { LoadingButton } from '@mui/lab';
import { Tabs, Tab } from '@mui/material';
import Link from 'next/link';

export default function Settings() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openAIKey, setOpenAIKey] = useState('');
  const [pinecone, setPinecone] = useState({
    apiKey: '',
    namespace: '',
    indexName: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [source, setSource] = useState({ systemMessage: '', file: null });
  const [tabValue, setTabValue] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const apiuri = process.env.NEXT_PUBLIC_CHATBOT_SERVER_URL;

  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTabValue(newValue);
  };

  const handleFileChange = (e: any) => {
    setFile(e.target.files[0]);
    setSource((prev) => ({ ...prev, file: e.target.files[0] }));
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

  const handleSaveAll = async () => {
    if (
      !openAIKey ||
      !pinecone.apiKey ||
      !pinecone.namespace ||
      !pinecone.indexName ||
      !source.systemMessage
    ) {
      setError('Please fill all the fields');
      return;
    }

    // Add your logic to save all information to server
    // If there's an error during saving, set error state
  };

  return (
    <div className="container">
      <button className="absolute top-3 left-10 p-2 z-10 ">
        <Link href="/">Home</Link>
      </button>
      <h1>Settings</h1>

      <Tabs value={tabValue} onChange={handleTabChange}>
        <Tab label="Source documents" />
        <Tab label="API informations" />
      </Tabs>

      {tabValue === 0 && (
        <fieldset>
          <legend>Source documents</legend>

          <label>
            File:
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              ref={fileInputRef}
            />
          </label>

          <LoadingButton
            variant="contained"
            color="primary"
            onClick={handleFileUpload}
            loading={loading}
            loadingIndicator={<CircularProgress size={24} />}
            style={{
              float: 'right',
              backgroundColor: '#3f51b5',
              color: 'white',
            }}
          >
            Save File
          </LoadingButton>
        </fieldset>
      )}

      {tabValue === 1 && (
        <div className="pt-5">
          <fieldset>
            <legend> OpenAI</legend>
            <label>
              API key:
              <input
                type="text"
                value={openAIKey}
                onChange={(e) => setOpenAIKey(e.target.value)}
              />
            </label>

            <label>
              System message:
              <textarea
                rows={4}
                value={source.systemMessage}
                onChange={(e) =>
                  setSource({ ...source, systemMessage: e.target.value })
                }
              />
            </label>
          </fieldset>

          <fieldset>
            <legend>Pinecone</legend>

            <label>
              API key:
              <input
                type="text"
                value={pinecone.apiKey}
                onChange={(e) =>
                  setPinecone({ ...pinecone, apiKey: e.target.value })
                }
              />
            </label>

            <label>
              Namespace:
              <input
                type="text"
                value={pinecone.namespace}
                onChange={(e) =>
                  setPinecone({ ...pinecone, namespace: e.target.value })
                }
              />
            </label>

            <label>
              Index name:
              <input
                type="text"
                value={pinecone.indexName}
                onChange={(e) =>
                  setPinecone({ ...pinecone, indexName: e.target.value })
                }
              />
            </label>
          </fieldset>
          <LoadingButton
            variant="contained"
            color="primary"
            onClick={handleSaveAll}
            loading={loading}
            loadingIndicator={<CircularProgress size={24} />}
            style={{
              float: 'right',
              backgroundColor: '#3f51b5',
              color: 'white',
            }}
          >
            Save All
          </LoadingButton>

          {error && <div className="error">{error}</div>}
        </div>
      )}
      <style jsx>{`
        .container {
          width: 90%;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        h1 {
          text-align: center;
          margin-bottom: 20px;
        }

        fieldset {
          margin-bottom: 20px;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 10px;
        }

        legend {
          padding: 0 10px;
        }

        label {
          display: block;
          margin-bottom: 10px;
        }

        input[type='text'],
        textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        input[type='file'] {
          border: none;
        }

        .submitBtn {
          display: inline-block;
          padding: 10px 20px;
          color: #fff;
          background-color: #007bff;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          text-align: center;
          transition: background-color 0.2s ease-in-out;
        }

        .submitBtn:hover {
          background-color: #0056b3;
        }

        .submitBtn:disabled {
          background-color: #ddd;
          cursor: not-allowed;
        }

        .tabs {
          margin-bottom: 20px;
        }

        .tab {
          display: inline-block;
          padding: 10px 20px;
          cursor: pointer;
          transition: background-color 0.2s ease-in-out;
        }

        .tab:hover {
          background-color: #f2f2f2;
        }

        .tab-active {
          background-color: #ddd;
        }
      `}</style>
    </div>
  );
}
