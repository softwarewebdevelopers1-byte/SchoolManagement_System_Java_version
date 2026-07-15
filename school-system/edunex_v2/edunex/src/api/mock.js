// Wraps dummy data in a Promise that resolves after a small simulated
// network delay, so every api/*.api.js function has the same async shape
// it will have once it's calling the real backend via axios.
export function mockResolve(data, delayMs = 300) {
  return new Promise((resolve) => setTimeout(() => resolve(data), delayMs));
}
