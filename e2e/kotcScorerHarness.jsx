import React from 'react';
import ReactDOM from 'react-dom/client';
import PublicKotcScorer from '@/pages/PublicKotcScorer';
import '@/index.css';

function Harness(){
  const token='e2e-player-score-token';
  const original=window.history.pushState.bind(window.history);
  React.useEffect(()=>{if(!window.location.pathname.includes('/kotc-score/'))original({},'',`/kotc-score/${token}`);},[]);
  return <PublicKotcScorer/>;
}

ReactDOM.createRoot(document.getElementById('root')).render(<Harness/>);