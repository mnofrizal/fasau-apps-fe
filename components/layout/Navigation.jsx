"use client";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { Pacifico } from "next/font/google";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pacifico",
});

export default function Navigation() {
  const pathname = usePathname();
  return (
    <nav className="shadow-xs border-b border-border bg-background">
      <div className="mx-auto px-6 py-2 lg:px-8">
        <div className="flex h-12 items-center justify-between">
          {/* Left side - Brand */}
          <div className="flex-shrink-0">
            <span
              className={cn(
                "text-4xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500",
                pacifico.className
              )}
            >
              Fasau
            </span>
          </div>

          {/* Middle - Navigation Links */}
          <div className="hidden flex-1 justify-center sm:flex">
            <div className="flex h-12 items-center space-x-8">
              {[
                { href: "/monitoring", label: "Monitoring" },
                { href: "/dashboard/tasks", label: "Tasks" },
                { href: "/dashboard/recent", label: "Laporan" },
                { href: "/dashboard/pm", label: "PM" },
                { href: "/dashboard/acara", label: "Acara" },
                { href: "/dashboard/inventory", label: "Inventory" },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className={`inline-flex h-full items-center border-b-2 px-3 text-base font-medium ${
                    pathname === link.href
                      ? "border-orange-500 text-primary"
                      : "border-transparent text-muted-foreground hover:border-border hover:text-primary"
                  }`}
                  aria-current={pathname === link.href ? "page" : undefined}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Right side - Profile section */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex-shrink-0 cursor-pointer">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-600">
                    <span className="text-base font-semibold text-white">
                      AM
                    </span>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <a href="/dashboard/settings">Settings</a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
