import 'dotenv/config';
import express from 'express';
import { Octokit } from '@octokit/rest';
import simpleGit from 'simple-git';
import fs from 'fs';
import path from 'path';
import { analyzeRepo } from './utils.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.post('/analyze', async (req, res) => {
  const { repoUrl } = req.body;
  if (!repoUrl) return res.status(400).json({ error: 'repoUrl required' });
  try {
    const report = await analyzeRepo(repoUrl);
    fs.writeFileSync(path.resolve('./report.json'), JSON.stringify(report, null, 2));
    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(\GitGauge backend running on port \\);
});

// CLI usage
if (process.argv[2]) {
  (async () => {
    const report = await analyzeRepo(process.argv[2]);
    fs.writeFileSync(path.resolve('./report.json'), JSON.stringify(report, null, 2));
    console.log('Report generated at report.json');
  })();
}
