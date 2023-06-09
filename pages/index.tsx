import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import styles from '@/styles/Home.module.css';
import { Message } from '@/types/chat';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import ReactMarkdown from 'react-markdown';
import { Document } from 'langchain/document';
import CircularProgress from '@mui/material/CircularProgress';
import { LoadingButton } from '@mui/lab';

export default function Home() {
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [file, setFile] = useState(null);

  const [messageState, setMessageState] = useState<{
    messages: Message[];
    pending?: string;
    history: [string, string][];
    pendingSourceDocs?: Document[];
  }>({
    messages: [
      {
        message: `hello friend :) I'm Diyar's AI assistant, here to answer questions about him.(Även på svenska)`,
        type: 'apiMessage',
      },
    ],
    history: [],
    pendingSourceDocs: [],
  });

  const { messages, pending, history, pendingSourceDocs } = messageState;

  const messageListRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const firstMessageRef = useRef<HTMLDivElement | null>(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toggleSettings = () => {
    setShowSettings((prevShowSettings) => !prevShowSettings);
  };

  function typeMessage(
    element: HTMLElement,
    message: string,
    index: number,
    interval: number,
    callback?: () => void,
  ): void {
    if (index < message.length) {
      element.textContent += message[index++];
      setTimeout(
        () => typeMessage(element, message, index, interval, callback),
        interval,
      );
    } else if (callback) {
      callback();
    }
  }

  useEffect(() => {
    textAreaRef.current?.focus();
    if (firstMessageRef.current) {
      const firstMessageElement = firstMessageRef.current;
      const message = firstMessageElement.textContent || '';
      firstMessageElement.textContent = '';

      typeMessage(firstMessageElement, message, 0, 50);
    }
  }, []);

  async function saveMessagesToDb() {
    // Save the message to the database
    await fetch('/api/save-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: messages }),
    });
  }

  //handle form submission
  async function handleSubmit(e: any) {
    e.preventDefault();

    setError(null);

    if (!query) {
      alert('Please input a question');
      return;
    }

    const question = query.trim();

    setMessageState((state) => ({
      ...state,
      messages: [
        ...state.messages,
        {
          type: 'userMessage',
          message: question,
        },
      ],
      pending: undefined,
    }));

    setLoading(true);
    setQuery('');
    setMessageState((state) => ({ ...state, pending: '' }));

    const ctrl = new AbortController();

    try {
      fetchEventSource('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          history,
        }),
        signal: ctrl.signal,
        onmessage: async (event) => {
          if (event.data === '[DONE]') {
            setMessageState((state) => ({
              history: [...state.history, [question, state.pending ?? '']],
              messages: [
                ...state.messages,
                {
                  type: 'apiMessage',
                  message: state.pending ?? '',
                  sourceDocs: state.pendingSourceDocs,
                },
              ],
              pending: undefined,
              pendingSourceDocs: undefined,
            }));
            setLoading(false);
            ctrl.abort();
          } else {
            const data = JSON.parse(event.data);
            if (data.sourceDocs) {
              setMessageState((state) => ({
                ...state,
                pendingSourceDocs: data.sourceDocs,
              }));
            } else {
              setMessageState((state) => ({
                ...state,
                pending: (state.pending ?? '') + data.data,
              }));
            }
          }
          textAreaRef.current?.focus();
        },
      });
    } catch (error) {
      setLoading(false);
      setError('An error occurred while fetching the data. Please try again.');
      console.log('error', error);
    }
    textAreaRef.current?.focus();
  }

  //prevent empty submissions
  const handleEnter = useCallback(
    (e: any) => {
      if (e.key === 'Enter' && query) {
        handleSubmit(e);
        textAreaRef.current?.focus();
      } else if (e.key == 'Enter') {
        e.preventDefault();
      }
    },
    [query],
  );

  const chatMessages = useMemo(() => {
    return [
      ...messages,
      ...(pending
        ? [
            {
              type: 'apiMessage',
              message: pending,
              sourceDocs: pendingSourceDocs,
            },
          ]
        : []),
    ];
  }, [messages, pending, pendingSourceDocs]);

  //scroll to bottom of chat
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [chatMessages]);

  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.type === 'apiMessage') {
      saveMessagesToDb();
    }
  }, [messages.length]);

  const handleFileChange = (e: any) => {
    setFile(e.target.files[0]);
  };

  //upload file
  const handleFileUpload = async () => {
    if (!file) {
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    setLoading(true);
    console.log('loading diyar true', loading);
    try {
      const response = await fetch('http://localhost:5000/api/uploadPdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const result = await response.json();
      setUploadedFile(result.fileName);
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
    <>
      <main className={styles.main}>
        {process.env.NODE_ENV === 'development' ? (
          <button
            onClick={toggleSettings}
            className="absolute top-0 right-0 p-2 z-10 "
          >
            Toggle Settings
          </button>
        ) : null}

        {showSettings ? (
          <section className="absolute top-0 left-0 w-full h-full bg-white p-4">
            <h2 className="text-xl font-bold mb-4">Settings</h2>
            <div className="mt-4">
              <form>
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
              </form>
            </div>
          </section>
        ) : (
          <div className={styles.chatSection}>
            <div ref={messageListRef} className={styles.messagelist}>
              {chatMessages.map((message, index) => {
                let className;
                if (message.type === 'apiMessage') {
                  className = styles.apimessage;
                } else {
                  // The latest message sent by the user will be animated while waiting for a response
                  className =
                    loading && index === chatMessages.length - 1
                      ? styles.usermessagewaiting
                      : styles.usermessage;
                }
                return (
                  <>
                    <div key={`chatMessage-${index}`} className={className}>
                      <div
                        className={styles.markdownanswer}
                        ref={index === 0 ? firstMessageRef : null}
                      >
                        <ReactMarkdown linkTarget="_blank">
                          {message.message}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </>
                );
              })}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="flex">
                <textarea
                  disabled={loading}
                  onKeyDown={handleEnter}
                  ref={textAreaRef}
                  autoFocus={false}
                  id="userInput"
                  name="userInput"
                  placeholder={
                    loading ? 'thinking...' : 'type your message here'
                  }
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className={`${styles.input} flex-grow w-full max-w-xs md:max-w-md lg:max-w-lg`}
                  rows={1} // Adjust the number of rows to your preference
                />
                <button
                  type="submit"
                  className="ml-2 p-1 rounded-md text-gray-500 hover:bg-gray-100"
                  disabled={loading}
                >
                  <svg
                    stroke="currentColor"
                    fill="none"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                    height="1em"
                    width="1em"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                </button>
              </div>
            </form>

            {error && (
              <div className="border border-red-400 rounded-md p-4">
                <p className="text-red-500">{error}</p>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
