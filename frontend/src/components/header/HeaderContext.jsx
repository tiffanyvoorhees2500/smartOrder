import { createContext, useState } from "react";

export const HeaderContext = createContext();

export default function HeaderContextProvider({ children }) {
  const [price, setPrice] = useState(0);
  const [pendingPrice, setPendingPrice] = useState(null);
  const [hasChanged, setHasChanged] = useState(false);

  return (
    <HeaderContext.Provider
      value={{
        price,
        setPrice,
        pendingPrice,
        setPendingPrice,
        hasChanged,
        setHasChanged,
      }}
    >
      {children}
    </HeaderContext.Provider>
  );
}
