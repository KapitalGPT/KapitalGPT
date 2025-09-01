import { useState, useRef } from 'react';
import { RetellWebClient } from 'retell-client-js-sdk';

interface RetellCallAgentProps {
  agentId: string;
}

const RetellCallAgent: React.FC<RetellCallAgentProps> = ({ agentId }) => {
  const [isCalling, setIsCalling] = useState(false);
  const [status, setStatus] = useState('Idle');
  
  const retellClientRef = useRef<RetellWebClient | null>(null);

  const supabaseFunctionUrl = 'https://iypmyaextacoondkwxge.supabase.co/functions/v1/create-retell-call';

  const handleStartCall = async () => {
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
        setStatus('Connected'); // Set the status only when the conversation has started
      });

      // Event listener for when the call ends, either by user or the agent
      client.on('conversationEnded', () => {
        setIsCalling(false);
        setStatus('Call ended');
      });
      
      // Start the call; the UI will be updated by the 'conversationStarted' event
      await client.startCall({
        accessToken,
      });

    } catch (error) {
      console.error('Error starting call:', error);
      setIsCalling(false); // Make sure calling state is false on error
      setStatus('Error');
    }
  };

  const handleEndCall = () => {
    if (retellClientRef.current) {
      retellClientRef.current.stopCall();
    }
    // The conversationEnded event listener will handle the UI state change
  };

  return (
    <div>
      <h2>Retell AI Conversation</h2>
      <p>Status: {status}</p>
      {isCalling ? (
        <button onClick={handleEndCall} disabled={status === 'Call ended'}>End Call</button>
      ) : (
        <button onClick={handleStartCall} disabled={status === 'Connecting...'}>Start Call</button>
      )}
       <button onClick={handleEndCall} disabled={status === 'Call ended'}>End Call</button>
    </div>
  );
};

export default RetellCallAgent;