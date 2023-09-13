import React, { createContext, useState } from "react";

type globalContextType = {
  isWriteModalOpen: boolean;
  setIsWriteModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};
export const globalContext = createContext<{
  isWriteModalOpen: boolean;
  setIsWriteModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}>(null as unknown as globalContextType);

const GlobalContextProvider = ({ children }: React.PropsWithChildren) => {
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  return (
    <globalContext.Provider value={{ isWriteModalOpen, setIsWriteModalOpen }}>
      {children}
    </globalContext.Provider>
  );
};

export default GlobalContextProvider;
