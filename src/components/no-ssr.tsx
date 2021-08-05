import { ReactElement, useEffect, useState } from "react";

export type NoSSRProps = {
  children: ReactElement;
};

export const NoSSR = ({ children }: NoSSRProps) => {
  const [isBrowser, setIsBrowser] = useState(false);
  useEffect(() => setIsBrowser(true), []);
  return isBrowser ? children : null;
};
