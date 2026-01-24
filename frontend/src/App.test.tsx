import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Good Grid Platform heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/Good Grid Platform/i);
  expect(headingElement).toBeInTheDocument();
});

test('renders platform description', () => {
  render(<App />);
  const descriptionElement = screen.getByText(/Gamified Community Contribution Platform/i);
  expect(descriptionElement).toBeInTheDocument();
});