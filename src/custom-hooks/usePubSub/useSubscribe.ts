/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect } from "react";

const useSubscribe = <T = unknown>(
  eventName: string,
  callback: (detail: T) => void,
  dependencies: unknown[] = [],
) => {
  const eventHandler = (e: Event) => {
    const customEvent = e as CustomEvent<T>;
    callback(customEvent.detail);
  };

  useEffect(() => {
    document.addEventListener(eventName, eventHandler, { passive: true });

    return () => {
      document.removeEventListener(eventName, eventHandler);
    };
  }, [eventName, ...dependencies]);
};

export default useSubscribe;
