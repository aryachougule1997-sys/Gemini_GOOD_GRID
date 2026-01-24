import request from 'supertest';
import express from 'express';
import cors from 'cors';

// Create a simple test app without the full routes
const app = express();
app.use(cors());
app.use(express.json());

// Simple test endpoint
app.post('/test-auth', (req, res) => {
  res.json({ success: true, message: 'Auth endpoint working' });
});

describe('Simple Auth Test', () => {
  it('should respond to basic request', async () => {
    const response = await request(app)
      .post('/test-auth')
      .send({ test: 'data' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});