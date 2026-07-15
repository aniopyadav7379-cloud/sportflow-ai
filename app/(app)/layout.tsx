import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import PageTransition from "@/components/layout/PageTransition";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#f6f7fb] dark:bg-[#0b0f1a]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-x-hidden px-4 pb-10 pt-5 sm:px-6 lg:px-8">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
