import '@testing-library/jest-dom'
import { server } from './mocks/server'

// Patch jsdom: scrollIntoView is not implemented in jsdom.
window.HTMLElement.prototype.scrollIntoView = function () {}

// MSW lifecycle hooks for the test suite.
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }))
afterEach(() => {
  server.resetHandlers()
  localStorage.clear()
})
afterAll(() => server.close())
