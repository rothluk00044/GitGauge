import { useState, useEffect } from 'react';
import { checkHealth } from '../../api/health';

export default function Dashboard() {
  const [healthStatus, setHealthStatus] = useState(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const status = await checkHealth();
        setHealthStatus(status);
      } catch (error) {
        console.error('Health check failed:', error);
      }
    };
    fetchHealth();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      {healthStatus && (
        <div className="bg-green-100 p-4 rounded">
          Backend Status: {healthStatus.status}
        </div>
      )}
    </div>
  );
}