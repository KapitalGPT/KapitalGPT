import { useState, useRef } from 'react';
import { RetellWebClient } from 'retell-client-js-sdk';
import { useNavigate } from 'react-router-dom'; // <-- Add this import

declare global {
  interface Window {
    SpeechRecognition: typeof webkitSpeechRecognition;
    webkitSpeechRecognition: any;
  }
}

interface RetellCallAgentProps {
  agentId: string;
}

interface Message {
  text: string;
  isUser: boolean;
}

const RetellCallAgent: React.FC<RetellCallAgentProps> = ({ agentId }) => {
  const [isCalling, setIsCalling] = useState(false);
  const [status, setStatus] = useState('Idle');
  const [isTestMode, setIsTestMode] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  
  const retellClientRef = useRef<RetellWebClient | null>(null);
  const recognitionRef = useRef<any>(null);
  const navigate = useNavigate(); // <-- Add this line

  const supabaseFunctionUrl = 'https://iypmyaextacoondkwxge.supabase.co/functions/v1/create-retell-call';

  const conversationScript = [
    "Hello, my name is Eric, and I am an AI agent representing KapitalGPT. I'm calling today to learn a bit about your investment focus and see if there's a potential fit for a partnership with us.",
    "That's great. What types of companies or industries are you currently most interested in?",
    "I understand. Are you primarily focused on early-stage, growth-stage, or later-stage funding?",
    "What is your typical investment range for a company like ours?",
    "Based on what you've shared, it sounds like there could be a strong alignment. I'd love to connect you with our CEO, [CEO's Name], for a brief call next week to discuss this further. What day and time works best for you?"
  ];

  const addMessage = (text: string, isUser = false) => {
    setMessages(prevMessages => [...prevMessages, { text, isUser }]);
  };

  const speak = (text: string) => {
    return new Promise<void>((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => resolve();
      utterance.onerror = (e) => reject(e);
      window.speechSynthesis.speak(utterance);
    });
  };

  const handleStartCall = async () => {
    setMessages([]); 
    if (isTestMode) {
      handleStartTestCall();
    } else {
      handleStartRetellCall();
    }
  };

  const handleStartRetellCall = async () => {
    setStatus('Connecting...');
    try {
      const response = await fetch(supabaseFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ agentId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create call via Supabase function.');
      }

      const { accessToken } = await response.json();

      const client = new RetellWebClient();
      retellClientRef.current = client;

      // Event listener for when the call successfully starts
      client.on('conversationStarted', () => {
        setIsCalling(true);
        setStatus('Connected');
      });

    
      client.on('conversationEnded', () => {
        setIsCalling(false);
        setStatus('Call ended');
      });
      
      await client.startCall({
        accessToken,
      }).then(() => {
        setIsCalling(true);
        setStatus('Connected');
      });

    } catch (error) {
      console.error('Error starting call:', error);
      setIsCalling(false);
      setStatus('Error');
    }
  };

  const handleStartTestCall = async () => {
    if (!('webkitSpeechRecognition' in window) || !('speechSynthesis' in window)) {
      setStatus("Browser not supported. Please use Google Chrome.");
      return;
    }

    let conversationState = 0;
    setStatus('Agent speaking...');
    addMessage(conversationScript[conversationState]);
    await speak(conversationScript[conversationState]);
    conversationState++;
    
    recognitionRef.current = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognitionRef.current.continuous = false;
    recognitionRef.current.lang = 'en-US';
    recognitionRef.current.interimResults = false;

    recognitionRef.current.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;
      addMessage(transcript, true);
      setStatus('Thinking...');

      let response = "";
      const lowerTranscript = transcript.toLowerCase();

      if (lowerTranscript.includes("not interested")) {
        response = "I understand. Thank you for your time today. Have a great day!";
        conversationState = conversationScript.length;
      } else if (lowerTranscript.includes("send me an email")) {
        response = "I can do that. Could you please confirm the email address you would like me to send the information to?";
        conversationState = conversationScript.length;
      } else if (lowerTranscript.includes("busy")) {
        response = "I completely understand. Would you like me to schedule a better time to talk, or would a brief, one-minute summary be helpful now?";
        conversationState = conversationScript.length;
      } else {
        if (conversationState < conversationScript.length) {
          response = conversationScript[conversationState];
          conversationState++;
        } else {
          response = "Thank you so much for your time. I've noted your interest and will be sending over some additional information. I look forward to connecting you with our team soon."
          conversationState = conversationScript.length;
        }
      }

      addMessage(response);
      await speak(response);
      
      if (conversationState < conversationScript.length) {
        setStatus('Listening for your response...');
        recognitionRef.current.start();
      } else {
        setStatus('Conversation ended.');
        setIsCalling(false);
      }
    };

    recognitionRef.current.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setStatus(`Speech recognition error: ${event.error}. Please try again.`);
      setIsCalling(false);
    };

    recognitionRef.current.start();
    setIsCalling(true);
  };

  const handleEndCall = () => {
    if (isTestMode) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsCalling(false);
      setStatus('Call ended');
    } else {
      if (retellClientRef.current) {
        retellClientRef.current.stopCall();
         setIsCalling(false);
      setStatus('Call ended');
      }
     
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-700 font-inter p-4">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-lg border border-white/20">
      <button
  onClick={() => navigate(-1)}
  className="mb-4 flex items-center px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow transition"
  aria-label="Back"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
  Back
</button>
        <h1 className="text-3xl font-extrabold text-center mb-6 text-white drop-shadow-lg">KapitalGPT AI Agent</h1>

        <div className="flex items-center justify-center mb-6 space-x-2">
          <span className="text-sm font-medium text-white/80">Test Mode</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={isTestMode} onChange={() => setIsTestMode(!isTestMode)} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-400 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
          <span className="text-sm font-medium text-white/80">Live Mode</span>
        </div>

        <div id="chat-box" className="h-96 overflow-y-auto rounded-xl p-4 mb-6 space-y-4 border border-white/30 bg-black/10">
          {messages.map((msg, index) => (
            <div key={index} className={`rounded-xl p-3 max-w-xs break-words shadow-md transition-all duration-300 ease-in-out ${msg.isUser ? 'bg-purple-500 text-white ml-auto' : 'bg-gray-700 text-white mr-auto'}`}>
              {msg.text}
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center">
          <div className="flex space-x-4 mb-4">
            {isCalling ? (
              <button onClick={handleEndCall} className="bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-transform transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75">
                End Call
              </button>
            ) : (
              <button onClick={handleStartCall} disabled={status === 'Connecting...'} className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg transition-transform transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed">
                Start Call
              </button>
            )}
          
          </div>
          <p className="mt-4 text-sm font-medium text-white/70">{status}</p>
        </div>
      </div>
    </div>
  );
};



export default RetellCallAgent;