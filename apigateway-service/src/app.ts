import express, { Express, Request, Response, NextFunction } from 'express';

const app: Express = express();
const port: number = parseInt(process.env.PORT || '3000', 10);

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'API Gateway is healthy' });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not Found' });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(port, () => {
  console.log(`API Gateway listening at http://localhost:${port}`);
});

export default app;
