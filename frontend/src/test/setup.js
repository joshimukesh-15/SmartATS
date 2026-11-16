import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { beforeEach, afterEach } from 'vitest';

beforeEach(() => {
  localStorage.setItem('smartats_token', 'test-recruiter-jwt-token');
});

afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
});
