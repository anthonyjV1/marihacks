import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
  } from "@/components/ui/sheet"
  import { Menu } from "lucide-react"
  import { NavigationRoutes } from "./navigation-routes"
  import { useAuth } from "@clerk/clerk-react";
  import { cn } from "@/lib/utils";
  import { NavLink } from "react-router-dom";
  
  export const ToggleContainer = () => {
    const { userId } = useAuth();
    return (
      <Sheet>
        <SheetTrigger className="block md:hidden"><Menu/></SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle/>
              </SheetHeader>
  
          <nav className="gap-6 flex flex-col items-start">
          <NavigationRoutes isMobile/>
          <div className = "flex flex-col">
            {userId && (
              <NavLink
              to={"/generate"} 
              className={({isActive}) => cn("text-base text-neutral-600 flex flex-col", isActive && "text-neutral-900 font-semibold")}>
                Take An Interview
            </NavLink>
            )}
            </div>
          </nav>
            
        </SheetContent>
      </Sheet>
  
    )
  }