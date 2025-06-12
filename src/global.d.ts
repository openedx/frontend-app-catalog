export {}; // make file as module

declare global {
  interface Window {
    testHistory?: string[];
  }
}
