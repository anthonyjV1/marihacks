import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import HomePage from "./components/Homepage";

export default function App() {
  return (
    <>
      <SignedOut>
        <HomePage />
      </SignedOut>
      
      <SignedIn>
        <header className="justify-end">
          <UserButton />
        </header>
        <div>
        </div>
      </SignedIn>
    </>
  );
}