import { createContext, useState, useContext, ReactNode } from "react";

interface SystemContextType {
  selectedDevice: Device | null;
  setSelectedDevice: (device: Device | null) => void;
}

interface Device {
  id: string;
  name: string;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export function useSystemContext() {
  const context = useContext(SystemContext);
  if (!context) {
    throw new Error("useSystemContext must be used within a SystemProvider");
  }
  return context;
}

interface SystemProviderProps {
  children: ReactNode;
}

export function SystemProvider({ children }: SystemProviderProps) {
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  return (
    <SystemContext.Provider value={{ selectedDevice, setSelectedDevice }}>
      {children}
    </SystemContext.Provider>
  );
}
