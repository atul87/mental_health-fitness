import '@testing-library/jest-dom';
import { server } from './mocks/server';

// Patch jsdom: scrollIntoView is not implemented in jsdom
window.HTMLElement.prototype.scrollIntoView = function () {};

// MSW lifecycle hooks — run once per test file suite
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
