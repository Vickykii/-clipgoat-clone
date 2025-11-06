"use client";

import { signOut } from "next-auth/react";
import { ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type Props = {
  user: {
    name?: string | null;
    email?: string | null;
  };
  workspace?: {
    name: string;
    plan: string;
  };
};

export function DashboardHeader({ user, workspace }: Props) {
  const initials = (user.name ?? user.email ?? "")
    .split(" ")
    .filter(Boolean)
    .map((segment) => segment[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
      <div>
        <p className="text-sm text-gray-400">Workspace</p>
        <h2 className="text-xl font-semibold text-white">{workspace?.name ?? "ClipForge"}</h2>
        <p className="text-xs text-gray-500">Plan: {workspace?.plan ?? "free"}</p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-3 rounded-lg border border-white/10 px-3 py-2 text-left text-sm text-white">
            <Avatar>
              <AvatarFallback>{initials || "CF"}</AvatarFallback>
            </Avatar>
            <div className="hidden text-left sm:block">
              <p className="font-medium">{user.name ?? user.email}</p>
              <p className="text-xs text-gray-400">{workspace?.plan ?? "free"} plan</p>
            </div>
            <ChevronDown className="h-4 w-4 opacity-60" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Account</DropdownMenuLabel>
          <DropdownMenuItem disabled>{user.email}</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>Sign out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
