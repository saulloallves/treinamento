import React, { createContext, useContext, useState, ReactNode } from 'react';

interface TestFlowContextType {
  isTestStarted: (testId: string) => boolean;
  startTest: (testId: string) => void;
  endTest: (testId: string) => void;
}

const TestFlowContext = createContext<TestFlowContextType | undefined>(undefined);

export const TestFlowProvider = ({ children }: { children: ReactNode }) => {
  const [startedTries, setStartedTries] = useState<Record<string, boolean>>({});

  const startTest = (testId: string) => {
    setStartedTries(prev => ({ ...prev, [testId]: true }));
  };

  const endTest = (testId: string) => {
    setStartedTries(prev => {
      const newState = { ...prev };
      delete newState[testId];
      return newState;
    });
  };

  const isTestStarted = (testId: string) => {
    return startedTries[testId] || false;
  };

  return (
    <TestFlowContext.Provider value={{ isTestStarted, startTest, endTest }}>
      {children}
    </TestFlowContext.Provider>
  );
};

export const useTestFlow = () => {
  const context = useContext(TestFlowContext);
  if (context === undefined) {
    throw new Error('useTestFlow must be used within a TestFlowProvider');
  }
  return context;
};
