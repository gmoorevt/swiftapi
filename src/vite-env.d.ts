/// <reference types="vite/client" />

// Declare Vite worker imports
declare module '*?worker' {
  const workerConstructor: {
    new (): Worker;
  };
  export default workerConstructor;
}
