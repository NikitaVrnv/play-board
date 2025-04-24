// src/components/Navbar.tsx

import { Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
import LogoIcon from "./LogoIcon"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/context/AuthContext"
import {
  LogOut,
  Settings,
  LayoutDashboard,
  Users,
  ClipboardList,
} from "lucide-react"
import { ThemeToggle } from "./ThemeToggle"

const Navbar = () => {
  const { user, logout } = useAuth()
  const location = useLocation()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo + Primary Nav */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10">
              <LogoIcon />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-base font-semibold text-foreground">
                GAMES
              </span>
              <span className="text-sm text-muted-foreground">Review Board</span>
            </div>
          </Link>

          <nav className="hidden gap-6 md:flex">
            {user && (
              <Link
                to="/add-game"
                className={
                  "text-sm font-medium transition-colors hover:text-foreground/80 " +
                  (location.pathname === "/add-game"
                    ? "text-foreground"
                    : "text-foreground/60")
                }
              >
                Add Game
              </Link>
            )}
          </nav>
        </div>

        {/* Theme toggle + user/auth */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={user.avatar || "/default-avatar.png"}
                      alt={user.username}
                      referrerPolicy="no-referrer"
                    />
                    <AvatarFallback>
                      {user.username.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="sr-only">Open user menu</span>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                {user.role === "admin" && (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger inset>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Admin
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent sideOffset={2}>
                      <DropdownMenuItem asChild>
                        <Link to="/admin">
                          <Settings className="mr-2 h-4 w-4" />
                          Overview
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/games">
                          <ClipboardList className="mr-2 h-4 w-4" />
                          Game Moderation
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/reviews">
                          <ClipboardList className="mr-2 h-4 w-4" />
                          Review Moderation
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/users">
                          <Users className="mr-2 h-4 w-4" />
                          User Management
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                )}

                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild size="sm" variant="default">
                <Link to="/register">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
