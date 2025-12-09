// src/routes/auth.ts
import { Router } from 'express';
import { AuthService } from '../services/AuthService';
import DB from "../database/DB";
const router = Router();
const authService = new AuthService();

router.post('/authorize', async (req, res) => {
  const awsToken = req.headers.authorization?.split(' ')[1];
  if (!awsToken) return res.status(401).json({ error: 'Missing AWS token' });

  try {
    const decoded = await authService.verifyAwsToken(awsToken);
    const localToken = authService.issueLocalToken(decoded);
    res.json({ token: localToken });
  } catch (err) {
    res.status(403).json({ error: 'Invalid AWS token' });
  }
});

router.get('/test', async (req, res) => {
  try {
    const pool = await new DB().getYosemiteConnection();
    const result = await pool.query('SELECT now()');

    res.json({ success: true, message: "All good", result: result.rows });
  } catch (err: any) {
    res.status(403).json({ error: 'Error: ' + err.message, errorRAW: err });
  }
});

export default router;