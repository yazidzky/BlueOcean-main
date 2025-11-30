import {
  Home,
  CheckSquare,
  Users,
  MessageCircle,
  User,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const menuItems = [
  { title: "Home", url: "/dashboard", icon: Home },
  { title: "Tasks", url: "/tasks", icon: CheckSquare },
  { title: "Friends", url: "/friends", icon: Users },
  { title: "Chat", url: "/chat", icon: MessageCircle },
  { title: "Profile", url: "/profile", icon: User },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent>
        {/* Logo/Brand */}
        <div className="px-4 py-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-md">
              <span className="text-primary-foreground font-bold text-xl">
                🌊
              </span>
            </div>
            {!isCollapsed && (
              <div>
                <h2 className="font-heading font-bold text-lg text-foreground">
                  BlueOcean
                </h2>
                <p className="text-xs text-muted-foreground">Stay Organized</p>
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div
            className={`${
              isCollapsed ? "px-2 py-3" : "px-4 py-4"
            } border-b border-border`}
          >
            <div
              className={`${
                isCollapsed
                  ? "flex items-center justify-center"
                  : "flex items-center gap-3"
              }`}
            >
              <Avatar
                className={`${
                  isCollapsed ? "h-8 w-8" : "h-10 w-10"
                } border-2 border-primary/20 shrink-0`}
              >
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all hover-lift"
                      activeClassName="bg-primary text-primary-foreground shadow-md"
                    >
                      <item.icon className="h-5 w-5" />
                      {!isCollapsed && (
                        <span className="font-medium">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with Actions */}
      <SidebarFooter className="border-t border-border p-4">
        <div className="flex flex-col gap-2">
          <Button
            variant="ghost"
            size={isCollapsed ? "icon" : "default"}
            onClick={toggleTheme}
            className="w-full justify-start"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            {!isCollapsed && <span className="ml-3">Toggle Theme</span>}
          </Button>
          <Button
            variant="ghost"
            size={isCollapsed ? "icon" : "default"}
            onClick={handleLogout}
            className="w-full justify-start text-destructive hover:text-destructive"
          >
            <LogOut className="h-5 w-5" />
            {!isCollapsed && <span className="ml-3">Logout</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
