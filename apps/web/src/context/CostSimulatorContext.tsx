import {
  createContext,
  useState,
  useContext,
  type Dispatch,
  type SetStateAction,
  type ReactNode,
  useEffect,
} from "react";

type Cost = {
  paymentMethods: {
    card: boolean;
    bank: boolean;
  };
  schedule: {
    quantity: number;
    price: number;
  }[];
  total: number;
};

type CostContextType = {
  cost: Cost;
  setCost: Dispatch<SetStateAction<Cost>>;
};

export const CostContext = createContext<CostContextType>({
  cost: {
    paymentMethods: {
      card: false,
      bank: false,
    },
    total: 0,
    schedule: [],
  },
  setCost: () => {},
});

export const useCostContext = () => {
  const { cost, setCost } = useContext(CostContext);
  return { cost, setCost };
};

type CostContextProviderProps = {
  children: ReactNode;
};

const calculateTotalCost = (cost: Cost) => {
  let total = 0;
  if (cost.paymentMethods.bank) {
    total += 1;
  }
  if (cost.paymentMethods.card) {
    total = 1.5;
  }

  return total;
};

export const CostContextProvider = ({ children }: CostContextProviderProps) => {
  const [cost, setCost] = useState<Cost>({
    paymentMethods: {
      card: false,
      bank: false,
    },
    total: 0,
    schedule: [],
  });

  useEffect(() => {
    setCost((prev) => ({
      ...prev,
      total: calculateTotalCost(prev),
    }));
  }, [cost.paymentMethods]);

  return (
    <CostContext.Provider value={{ cost, setCost }}>
      {children}
    </CostContext.Provider>
  );
};
