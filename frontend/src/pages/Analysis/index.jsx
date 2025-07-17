import { useState } from 'react';
import { analyzeRepository } from '../../api/analysis';

export default function Analysis() {
  const [repoUrl, setRepoUrl] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await analyzeRepository(repoUrl);
      setAnalysis(result);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Repository Analysis</h1>
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
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </form>
      {/* Analysis results display would go here */}
    </div>
  );
}