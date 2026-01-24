import request from 'supertest';
import express from 'express';

// Mock the server setup for testing
const app = express();

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Good Grid Backend'
  });
});

app.get('/api', (req, res) => {
  res.json({ 
    message: 'Good Grid API Server',
    version: '1.0.0'
  });
});

describe('Server Endpoints', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('service', 'Good Grid Backend');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api', () => {
    it('should return API information', async () => {
      const response = await request(app)
        .get('/api')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Good Grid API Server');
      expect(response.body).toHaveProperty('version', '1.0.0');
    });
  });
});