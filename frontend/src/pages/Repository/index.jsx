import { useState } from 'react';
import { getRepoInfo } from '../../api/repo';

export default function Repository() {
  const [repoUrl, setRepoUrl] = useState('');
  const [repoInfo, setRepoInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const info = await getRepoInfo(repoUrl);
      setRepoInfo(info);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Repository Information</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          placeholder="Enter GitHub repository URL"
          className="border p-2 w-full"
          required
        />
        <button 
          type="submit" 
          className="bg-blue-500 text-white p-2 mt-2 rounded"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Get Info'}
        </button>
      </form>
      {/* Repository info display would go here */}
    </div>
  );
}