import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import styles from '@/styles/Home.module.css';
import { Message } from '@/types/chat';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import ReactMarkdown from 'react-markdown';
import { Document } from 'langchain/document';

export default function Home() {
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
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
          // console.log('event', event);
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
    if (messages.length > 0) {
      saveMessagesToDb();
    }
  }, [messages, saveMessagesToDb]);

  return (
    <>
      <main className={styles.main}>
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
              placeholder={loading ? 'thinking...' : 'type your message here'}
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
      </main>
    </>
  );
}
