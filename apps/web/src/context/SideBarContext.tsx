import React, {
  useContext,
  useState,
  createContext,
  type Dispatch,
  type SetStateAction,
} from "react";

type SideBarState = {
  selectedIndex: number;
};

export const SideBarContext = createContext<{
  sideBarState: SideBarState | null;
  setSideBarState: Dispatch<SetStateAction<SideBarState>>;
}>({
  sideBarState: {
    selectedIndex: -1,
  },
  setSideBarState: () => {},
});

export const useSideBarContext = () => {
  const { sideBarState, setSideBarState } = useContext(SideBarContext);
  return { sideBarState, setSideBarState };
};
export const SideBarProvider = ({ children }: { children: JSX.Element }) => {
  const [sideBarState, setSideBarState] = useState<SideBarState>({
    selectedIndex: -1,
  });

  return (
    <SideBarContext.Provider value={{ sideBarState, setSideBarState }}>
      {children}
    </SideBarContext.Provider>
  );
};
