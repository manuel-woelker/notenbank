interface Window {
  __REDUX_DEVTOOLS_EXTENSION__?: {
    connect: (options?: { name?: string }) => {
      subscribe: (listener: (message: unknown) => void) => () => void;
      unsubscribe: () => void;
      send: (action: unknown, state: unknown) => void;
      init: (state: unknown) => void;
      error: (message: string) => void;
    };
    disconnect: () => void;
  };
}
