import { AdminNav } from "@/components/layouts/admin-nav";
import { LogoutButton } from "@/components/layouts/logout-button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col p-4 border-r min-h-screen">
        <div className="flex flex-col h-full">
          <div className="mb-4">
            <h1 className="text-xl font-bold">Painel Admin</h1>
          </div>
          <AdminNav />
          {/* Logout no final do sidebar */}
          <div className="mt-auto pt-4">
            <LogoutButton />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-auto">
        {/* Top Bar */}
        <header className="border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-2 md:hidden">
            <AdminNav />
            <h1 className="text-xl font-bold">Painel Admin</h1>
          </div>
          {/* Logout no header para mobile */}
          <div className="md:hidden">
            <LogoutButton />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
