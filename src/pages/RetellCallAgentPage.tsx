import RetellCallAgent from '../components/RetellCallAgent'
import { useUser } from '../context';
// import { useEffect } from 'react';
import App from '../App';

function RetellCallAgentPage() {
  const { user } = useUser();
  const myAgentId = import.meta.env.VITE_RETELL_AGENT_ID;

if (user?.aud) {
return (
    <div>
      <RetellCallAgent agentId={myAgentId} />
    </div>
  );
} else {
  
     return (
    <div>
      <App/>
    </div>
    )
}
  
}

export default RetellCallAgentPage;