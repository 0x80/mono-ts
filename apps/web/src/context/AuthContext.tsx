import React, {
  useContext,
  useEffect,
  useState,
  createContext,
  type Dispatch,
  type SetStateAction,
} from "react";
import { onAuthStateChanged, getAuth } from "firebase/auth";
import firebase_app from "../firebase/config";
import LoadingComponent from "@/components/Materials/LoadingComponent";
import type { User } from "firebase/auth";
import type { User as UserData } from "@/firebase/interfaces/users";
import { streamUser } from "@/firebase/db/users";
const auth = getAuth(firebase_app);

export const AuthContext = createContext<{
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  isAdmin: boolean;
  isProducer: boolean;
  userData: UserData | null;
}>({
  user: null,
  setUser: () => {},
  isAdmin: false,
  isProducer: false,
  userData: null,
});

export const useAuthContext = () => {
  const { user, setUser, isAdmin, isProducer, userData } =
    useContext(AuthContext);
  return { user, setUser, isAdmin, isProducer, userData };
};
export const AuthContextProvider = ({
  children,
}: {
  children: JSX.Element;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isProducer, setIsProducer] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        user.getIdTokenResult().then((idTokenResult) => {
          setIsAdmin(idTokenResult.claims.role === "admin");
          setIsProducer(idTokenResult.claims.role === "producer");
        });
      } else {
        setUser(null);
        setIsAdmin(false);
        setIsProducer(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = streamUser(
      user?.uid,
      (snapshot) => {
        setUserData(snapshot.data() as UserData);
      },
      () => {
        return;
      }
    );
    return () => unsubscribe();
  }, [user]);

  return (
    <AuthContext.Provider
      value={{ user, setUser, isAdmin, isProducer, userData }}
    >
      {loading ? <LoadingComponent></LoadingComponent> : children}
    </AuthContext.Provider>
  );
};
