import { db } from "@/config/firebase.config";
import { LoaderPage } from "@/routes/loader-page";
import { User } from "@/types";
import { useAuth, useUser } from "@clerk/clerk-react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

const AuthHandler = () => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("AuthHandler effect running", { isSignedIn, user });

    const storeUserData = async () => {
      if (!isSignedIn || !user) {
        console.log("User not signed in. Stopping loading.");
        setLoading(false);
        return;
      }

      console.log("User is signed in.");
      setLoading(true);
      try {
        const userRef = doc(db, "users", user.id);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          console.log("User already exists. Skipping Firestore write.");
          setLoading(false);
          return;
        }

        const userData: User = {
          id: user.id,
          name: user.fullName || user.firstName || "Anonymous",
          email: user.primaryEmailAddress?.emailAddress || "N/A",
          imageUrL: user.imageUrl, 
          createdAt: serverTimestamp(),
          updateAt: serverTimestamp(),
        };

        await setDoc(userRef, userData);
      } catch (error) {
        console.error("Error storing user data:", error);
      } finally {
        setLoading(false);
      }
    };

    storeUserData();
  }, [isSignedIn, user]);

  if (loading) {
    return <LoaderPage />;
  }

  return null;
};

export default AuthHandler;
