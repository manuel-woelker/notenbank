import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Class, CreateClassInput, ClassContextValue } from './types';
import { classRepository } from './ClassRepository';

const ClassContext = createContext<ClassContextValue | undefined>(undefined);

interface ClassProviderProps {
  children: ReactNode;
}

/**
 * Provider component for class state management
 */
export const ClassProvider: React.FC<ClassProviderProps> = ({ children }) => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * Load all classes from repository
   */
  const loadClasses = async () => {
    setLoading(true);
    try {
      const data = await classRepository.findAll();
      setClasses(data);
    } catch (error) {
      console.error('Failed to load classes:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create a new class
   */
  const createClass = async (input: CreateClassInput): Promise<Class> => {
    try {
      const newClass = await classRepository.create(input);
      setClasses((prev) => [...prev, newClass]);
      return newClass;
    } catch (error) {
      console.error('Failed to create class:', error);
      throw error;
    }
  };

  // Load classes on mount
  useEffect(() => {
    loadClasses();
  }, []);

  const value: ClassContextValue = {
    classes,
    loading,
    loadClasses,
    createClass,
  };

  return <ClassContext.Provider value={value}>{children}</ClassContext.Provider>;
};

/**
 * Hook to access class context
 */
export const useClassContext = (): ClassContextValue => {
  const context = useContext(ClassContext);
  if (!context) {
    throw new Error('useClassContext must be used within a ClassProvider');
  }
  return context;
};
