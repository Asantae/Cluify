import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';

interface ModalStackContextType {
  bringToFront: (id: string) => void;
  getZIndex: (id: string) => number;
  registerModal: (id: string) => void;
  unregisterModal: (id: string) => void;
}

const ModalStackContext = createContext<ModalStackContextType | undefined>(undefined);

const BASE_Z_INDEX = 1200;

export const ModalStackProvider = ({ children }: { children: ReactNode }) => {
  const [stack, setStack] = useState<string[]>([]);

  const registerModal = useCallback((id: string) => {
    setStack(currentStack => {
      if (currentStack.includes(id)) {
        return currentStack;
      }
      return [...currentStack, id];
    });
  }, []);

  const unregisterModal = useCallback((id: string) => {
    setStack(currentStack => currentStack.filter(item => item !== id));
  }, []);

  const bringToFront = useCallback((id: string) => {
    setStack(currentStack => {
      const newStack = currentStack.filter(item => item !== id);
      newStack.push(id);
      return newStack;
    });
  }, []);

  const getZIndex = (id: string) => {
    const index = stack.indexOf(id);
    return index === -1 ? BASE_Z_INDEX : BASE_Z_INDEX + index;
  };

  return (
    <ModalStackContext.Provider value={{ registerModal, unregisterModal, bringToFront, getZIndex }}>
      {children}
    </ModalStackContext.Provider>
  );
};

export const useModalStack = () => {
  const context = useContext(ModalStackContext);
  if (!context) {
    throw new Error('useModalStack must be used within a ModalStackProvider');
  }
  return context;
}; 