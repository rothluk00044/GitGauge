import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Dashboard from './components/Dashboard';

export default function App() {
  const [report, setReport] = useState(null);

  useEffect(() => {
    axios.get('/report.json')
      .then(res => setReport(res.data))
      .catch(() => setReport(null));
  }, []);

  return (
    <div>
      <h1>GitGauge Dashboard</h1>
      {report ? <Dashboard report={report} /> : <div>Loading report...</div>}
    </div>
  );
}
