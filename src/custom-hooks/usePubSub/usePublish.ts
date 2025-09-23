import { useCallback, useMemo } from "react";

const usePublish = <T = unknown>(eventName: string, args?: T) => {
  const nativeEvent = useMemo(
    () =>
      new CustomEvent(eventName, {
        detail: args,
      }),
    [eventName, args],
  );

  const publish = useCallback(
    <U = T>(instanceEventName?: string, callbackArgs?: U) => {
      if (instanceEventName) {
        document.dispatchEvent(
          new CustomEvent(instanceEventName, {
            detail: callbackArgs,
          }),
        );
        return;
      }

      document.dispatchEvent(nativeEvent);
    },
    [nativeEvent],
  );

  return { publish, nativeEvent };
};

export default usePublish;
