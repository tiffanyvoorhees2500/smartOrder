import { createContext, useState } from "react";

export const HeaderContext = createContext();

export default function HeaderContextProvider({ children }) {
  const [originalTotal, setOriginalTotal] = useState(0);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [hasChanged, setHasChanged] = useState(false);

  return (
    <HeaderContext.Provider
      value={{
        originalTotal,
        setOriginalTotal,
        pendingTotal,
        setPendingTotal,
        hasChanged,
        setHasChanged,
      }}
    >
      {children}
    </HeaderContext.Provider>
  );
}
