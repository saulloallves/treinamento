import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TestFlowContextType {
  isTestStarted: (testId: string) => boolean;
  startTest: (testId: string) => void;
  endTest: (testId: string) => void;
}

const TestFlowContext = createContext<TestFlowContextType | undefined>(undefined);

const STORAGE_KEY = 'test_flow_started_tests';

export const TestFlowProvider = ({ children }: { children: ReactNode }) => {
  const [startedTests, setStartedTests] = useState<Record<string, boolean>>(() => {
    // Inicializar do sessionStorage
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Sincronizar com sessionStorage sempre que mudar
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(startedTests));
    } catch (error) {
      console.error('Error saving to sessionStorage:', error);
    }
  }, [startedTests]);

  const startTest = (testId: string) => {
    setStartedTests(prev => ({ ...prev, [testId]: true }));
  };

  const endTest = (testId: string) => {
    setStartedTests(prev => {
      const newState = { ...prev };
      delete newState[testId];
      return newState;
    });
  };

  const isTestStarted = (testId: string) => {
    return startedTests[testId] || false;
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
