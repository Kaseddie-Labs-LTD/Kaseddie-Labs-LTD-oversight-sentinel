import React, { useState } from 'react';

const App = () => {
  const [logResult, setLogResult] = useState('');
  const [semanticsResult, setSemanticsResult] = useState('');
  const [vectorResult, setVectorResult] = useState('');

  const handleLog = async () => {
    try {
      const response = await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo-user',
          action: 'demo-action',
          payload: { message: 'Hello from UI' },
          status: 'started',
        }),
      });
      const data = await response.json();
      setLogResult(JSON.stringify(data, null, 2));
    } catch (e) {
      setLogResult(`Error: ${e.message}`);
    }
  };

  const handleSemantics = async () => {
    try {
      const response = await fetch('/api/semantics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'Generate semantics for this demo text.' }),
      });
      const data = await response.json();
      setSemanticsResult(JSON.stringify(data, null, 2));
    } catch (e) {
      setSemanticsResult(`Error: ${e.message}`);
    }
  };

  const handleVector = async () => {
    try {
      const response = await fetch('/api/vector', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: 'Vector sync demo text.',
          metadata: { source: 'demo' },
        }),
      });
      const data = await response.json();
      setVectorResult(JSON.stringify(data, null, 2));
    } catch (e) {
      setVectorResult(`Error: ${e.message}`);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
      <h2>KASEDDIE LABS LTD | OVERSIGHT SENTINEL v2.0.0</h2>
      <button onClick={handleLog}>Write State Log</button>
      <pre>{logResult}</pre>
      <button onClick={handleSemantics}>Generate Semantics</button>
      <pre>{semanticsResult}</pre>
      <button onClick={handleVector}>Vector Sync</button>
      <pre>{vectorResult}</pre>
    </div>
  );
};

export default App;
