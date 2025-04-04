import { MainRoutes } from "@/lib/helpers"
import { cn } from "@/lib/utils"
import { NavLink } from "react-router-dom"

interface NavigationRoutesProps{
    isMobile?: boolean

}

export const NavigationRoutes = ({isMobile = false}: NavigationRoutesProps) => {
  return (
    <ul className={cn("flex gap-6", isMobile ? "flex-col items-start" : "items-center")}>
      {MainRoutes.map(route => (
        <NavLink
          key={route.href} 
          to={route.href} 
          className={({isActive}) => cn("text-base text-neutral-600", isActive && "text-neutral-900 fontsemibold")}>
            {route.label}
        </NavLink>
      ))}
    </ul>
  )
}
