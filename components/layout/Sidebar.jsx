import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListTodo,
  Clock,
  Wrench,
  Calendar,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Menu", icon: LayoutDashboard },
    { href: "/dashboard/tasks", label: "Task", icon: ListTodo },
    { href: "/dashboard/recent", label: "Recent Task", icon: Clock },
    { href: "/dashboard/pm", label: "PM", icon: Wrench },
    { href: "/dashboard/acara", label: "Acara", icon: Calendar },
  ];

  return (
    <div className="w-48 py-10">
      <nav className="space-y-2">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 text-gray-800 rounded-xl px-4 py-3 text-base font-semibold tracking-wide transition-all ${
              pathname === link.href
                ? "bg-gray-100 text-gray-800"
                : "text-muted-foreground/90 hover:bg-accent/50 hover:text-primary"
            }`}
          >
            <link.icon size={18} />
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
