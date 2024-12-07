"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { BookOpen, Layout, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
      window.location.href = "/login";
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const navigation = [
    {
      name: "Dashboard",
      href: "/home",
      icon: Layout,
      current: pathname === "/home",
    },
    {
      name: "Meus Cursos",
      href: "/home/courses",
      icon: BookOpen,
      current: pathname === "/home/courses",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold">Plataforma LMS</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                      item.current
                        ? "border-b-2 border-primary text-gray-900"
                        : "text-gray-500 hover:text-gray-900"
                    }`}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="flex items-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className="sm:hidden bg-white border-b">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                item.current
                  ? "bg-primary text-white"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <item.icon className="w-4 h-4 mr-2" />
              {item.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
