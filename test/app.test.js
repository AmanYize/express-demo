const request = require('supertest');
const express = require('express');
const app = express();

app.get('/hello', (req, res) => {
  res.json({ message: 'Hello, World!' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

describe('Express App', () => {
  it('should return hello world', (done) => {
    request(app)
      .get('/hello')
      .expect(200)
      .expect('Content-Type', /json/)
      .expect({ message: 'Hello, World!' }, done);
  });

  it('should return health status', (done) => {
    request(app)
      .get('/health')
      .expect(200)
      .expect('Content-Type', /json/)
      .expect({ status: 'ok' }, done);
  });
});