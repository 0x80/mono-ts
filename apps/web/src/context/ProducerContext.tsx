import {
  createContext,
  useState,
  useContext,
  type Dispatch,
  type SetStateAction,
  type ReactNode,
  useEffect,
} from "react";
import type { Producer } from "@/firebase/interfaces/producers";
import { streamProducer } from "@/firebase/db/producers";
import { useAuthContext } from "./AuthContext";

type ProducerContextType = {
  producer: Producer;
  producerId: string;
  setProducerId: Dispatch<SetStateAction<string>>;
};

export const ProducerContext = createContext<ProducerContextType>({
  producer: {
    image: "",
    name: "",
    backgroundImage: "",
    description: "",
    instagramProfile: "",
    users: [],
    domains: [],
    ratings: {
      ratingPoint: 0,
      ratingTotal: 0,
      ratingNumber: 0,
    },
    earlyHash: "",
  },
  producerId: "",
  setProducerId: () => {},
});

export const useProducerContext = () => {
  const { producer, setProducerId, producerId } = useContext(ProducerContext);
  return { producer, setProducerId, producerId };
};

type ProducerContextProviderProps = {
  children: ReactNode;
};

export const ProducerContextProvider = ({
  children,
}: ProducerContextProviderProps) => {
  const [producer, setProducer] = useState<Producer>(() => {
    if (typeof window !== "undefined") {
      const savedProducer = localStorage.getItem("producer");
      try {
        return savedProducer
          ? JSON.parse(savedProducer)
          : {
              image: "",
              name: "",
              backgroundImage: "",
              description: "",
              instagramProfile: "",
              users: [],
              domains: [],
              ratings: {
                ratingPoint: 0,
                ratingTotal: 0,
                ratingNumber: 0,
              },
              earlyHash: "",
            };
      } catch {
        return {
          image: "",
          name: "",
          backgroundImage: "",
          description: "",
          instagramProfile: "",
          users: [],
          domains: [],
          ratings: {
            ratingPoint: 0,
            ratingTotal: 0,
            ratingNumber: 0,
          },
          earlyHash: "",
        };
      }
    }
    return {
      image: "",
      name: "",
      backgroundImage: "",
      description: "",
      instagramProfile: "",
      users: [],
      domains: [],
      ratings: {
        ratingPoint: 0,
        ratingTotal: 0,
        ratingNumber: 0,
      },
      earlyHash: "",
    };
  });

  const [producerId, setProducerId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("producerId") || "";
    }
    return "";
  });

  const { userData } = useAuthContext();

  useEffect(() => {
    if (userData?.producers && userData.producers[0] && !producerId) {
      const firstProducerId = userData.producers[0].id || "";
      setProducerId(firstProducerId);
      localStorage.setItem("producerId", firstProducerId);
    }
  }, [setProducerId, userData?.producers, producerId]);

  useEffect(() => {
    if (producerId === "") return;
    if (typeof window !== "undefined") {
      localStorage.setItem("producerId", producerId);
    }
    const unsubscribe = streamProducer(
      producerId,
      (snapshot) => {
        const producerData = snapshot.data() as Producer;
        setProducer(producerData);
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("producer", JSON.stringify(producerData));
          } catch (error) {
            console.log(error);
          }
        }
      },
      () => {
        return;
      }
    );
    return () => unsubscribe();
  }, [producerId]);

  return (
    <ProducerContext.Provider value={{ producer, setProducerId, producerId }}>
      {children}
    </ProducerContext.Provider>
  );
};
