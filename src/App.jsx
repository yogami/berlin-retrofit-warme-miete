import React from 'react';
import Dashboard from './components/Dashboard';
import { ContractorMarketplace } from './components/ContractorMarketplace';

function App() {
  const path = window.location.pathname;

  if (path === '/marketplace') {
    return <ContractorMarketplace />;
  }

  return (
    <div className="app-container">
      <Dashboard />
    </div>
  );
}

export default App;
