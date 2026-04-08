import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// This is the MSW server used in all Vitest tests
export const server = setupServer(...handlers);
