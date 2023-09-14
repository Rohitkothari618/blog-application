import React, { createContext, useState } from "react";

type globalContextType = {
  isWriteModalOpen: boolean;
  setIsWriteModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isUpdateModalOpen: boolean;
  setIsUpdateModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};
export const globalContext = createContext<globalContextType>(
  null as unknown as globalContextType
);

const GlobalContextProvider = ({ children }: React.PropsWithChildren) => {
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  return (
    <globalContext.Provider
      value={{
        isWriteModalOpen,
        setIsWriteModalOpen,
        isUpdateModalOpen,
        setIsUpdateModalOpen,
      }}
    >
      {children}
    </globalContext.Provider>
  );
};

export default GlobalContextProvider;
