import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, Home, Newspaper, Image, User, LogOut, MessageCircle, Link2, Users, LayoutDashboard } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { useUnreadCount } from "@/hooks/use-unread-count";
import { getInitials } from "@/lib/utils";

import logo from "../../public/images/arqdoorlogo.jpg";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [location, navigate] = useLocation();
  const { user, isLoggedIn, logout } = useAuth();
  const unreadCount = useUnreadCount();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  const handleLogout = async () => {
    await logout();
    navigate("/auth");
  };

  const isHomePage = location === "/";
  const textColor = isHomePage && !isScrolled ? "text-black" : "text-gray-900";

  return (
    <nav className={`fixed top-0 w-full z-50 h-16 border-b border-zinc-200 bg-white/90 backdrop-blur shadow-sm transition-all`}>
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center gap-2">
            <img src={logo} alt="ArqDoor Logo" className="h-8 w-auto" />
            <span className={`text-lg font-bold ${textColor}`}>ArqDoor</span>
          </div>
        </Link>

        <div className="hidden md:block w-full max-w-md mx-8">
          {/* SearchBar removed */}
        </div>

        <div className="hidden md:flex items-center space-x-6">

          {isLoggedIn && (
            <>
              <Link href="/home">
                <div className="flex items-center gap-1 text-sm text-gray-700 hover:text-amber-500">
                  <Home className="w-4 h-4" /> {user?.type === "prestador" ? "Painel" : "Início"}
                </div>
              </Link>
              {user?.type === "contratante" && (
                <Link href="/services">
                  <div className="flex items-center gap-1 text-sm text-gray-700 hover:text-amber-500">
                    <Newspaper className="w-4 h-4" /> Serviços
                  </div>
                </Link>
              )}
              {user?.type === "contratante" && (
                <Link href="/connections">
                  <div className="flex items-center gap-1 text-sm text-gray-700 hover:text-amber-500">
                    <Users className="w-4 h-4" /> Conexões
                  </div>
                </Link>
              )}
              {user?.type === "prestador" && (
                <Link href="/demands">
                  <div className="flex items-center gap-1 text-sm text-gray-700 hover:text-amber-500">
                    <Image className="w-4 h-4" /> Demandas
                  </div>
                </Link>
              )}
              {user?.type === "prestador" && (
                <Link href="/convites">
                  <div className="flex items-center gap-1 text-sm text-gray-700 hover:text-amber-500">
                    <Link2 className="w-4 h-4" /> Convites
                  </div>
                </Link>
              )}
              <Link href="/kanban">
                <div className="flex items-center gap-1 text-sm text-gray-700 hover:text-amber-500">
                  <LayoutDashboard className="w-4 h-4" /> Kanban
                </div>
              </Link>
            </>
          )}
          {isLoggedIn && (
            <Link href="/messages">
              <div className="relative">
                <Button variant="ghost" size="icon" aria-label="Messages">
                  <MessageCircle className="h-5 w-5 text-gray-700" />
                  {unreadCount > 0 && (
                    <span 
                      className={`absolute -top-1 -right-1 flex items-center justify-center rounded-full bg-red-500 text-white font-bold border-2 border-white ${
                        unreadCount > 10 ? "h-3 w-3 p-0" : "h-5 w-5 text-[10px]"
                      }`}
                    >
                      {unreadCount <= 10 ? unreadCount : ""}
                    </span>
                  )}
                </Button>
              </div>
            </Link>
          )}
          {isLoggedIn && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={(user as any)?.perfil} className="object-cover" />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" /> <span>Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" /> <span>Desconectar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="default" onClick={() => navigate("/auth")}>Login</Button>
              <Button variant="link" onClick={() => navigate("/auth/register")}>Cadastrar</Button>
            </>
          )}
        </div>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="mt-6 space-y-4">
                <Link href="/home">
                  <div className="text-gray-700 hover:text-amber-500">Início</div>
                </Link>
                {user?.type === "contratante" && (
                  <Link href="/services">
                    <div className="text-gray-700 hover:text-amber-500">Serviços</div>
                  </Link>
                )}
                {user?.type === "contratante" && (
                  <Link href="/connections">
                    <div className="text-gray-700 hover:text-amber-500">Conexões</div>
                  </Link>
                )}
                {user?.type === "prestador" && (
                  <Link href="/demands">
                    <div className="text-gray-700 hover:text-amber-500">Demandas</div>
                  </Link>
                )}
                {isLoggedIn && user?.type === "prestador" && (
                  <Link href="/convites">
                    <div className="text-gray-700 hover:text-amber-500">Convites</div>
                  </Link>
                )}
                {isLoggedIn && (
                  <Link href="/kanban">
                    <div className="flex items-center gap-1 text-gray-700 hover:text-amber-500">
                      <LayoutDashboard className="h-4 w-4" /> Kanban
                    </div>
                  </Link>
                )}
                {isLoggedIn && (
                  <Link href="/messages">
                    <div className="relative flex items-center gap-1 text-gray-700 hover:text-amber-500">
                      <MessageCircle className="h-5 w-5" /> 
                      Mensagens
                      {unreadCount > 0 && (
                        <span className="ml-2 bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                          {unreadCount > 10 ? "10+" : unreadCount}
                        </span>
                      )}
                    </div>
                  </Link>
                )}
                {isLoggedIn && user ? (
                  <Link href="/profile">
                    <div className="text-gray-700 hover:text-amber-500">Perfil</div>
                  </Link>
                ) : (
                  <Button onClick={() => navigate("/auth")}>Login</Button>
                )}
                {isLoggedIn && <Button onClick={handleLogout}>Logout</Button>}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
