import { useState, type ReactNode } from "react";
import {
  Link,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import {
  LayoutDashboard,
  Mail,
  ClipboardList,
  ListTodo,
  FileText,
  MessageSquare,
  Search,
  LogOut,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const NAV = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Communication", url: "/communication", icon: Mail },
  { title: "Meetings", url: "/meetings", icon: ClipboardList },
  { title: "Tasks", url: "/tasks", icon: ListTodo },
  { title: "Policies", url: "/policies", icon: FileText },
  { title: "Chat", url: "/chat", icon: MessageSquare },
] as const;

function useProfile() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    },
    staleTime: 60_000,
  });
}

function AppSidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (url: string) =>
    url === "/" ? path === "/" : path.startsWith(url);
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent grid place-items-center text-primary-foreground shrink-0">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="font-semibold leading-tight">HR Assistant</span>
            <span className="text-xs text-muted-foreground">Productivity Suite</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 py-2 text-[11px] text-muted-foreground group-data-[collapsible=icon]:hidden">
          AI outputs should be reviewed before use.
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

function Header() {
  const navigate = useNavigate();
  const { data: user } = useProfile();
  const qc = useQueryClient();
  const [q, setQ] = useState("");

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  }

  const initials = (user?.user_metadata?.full_name || user?.email || "U")
    .toString()
    .split(/[\s@]+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="h-14 border-b bg-card flex items-center gap-2 px-3 sticky top-0 z-30">
      <SidebarTrigger />
      <div className="relative flex-1 max-w-md ml-2">
        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search modules, content, history…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9 h-9 bg-muted/40 border-0 focus-visible:bg-card"
        />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:block text-sm font-medium max-w-[160px] truncate">
                {user?.user_metadata?.full_name || user?.email}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="text-xs truncate">{user?.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut}>
              <LogOut className="h-4 w-4 mr-2" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}