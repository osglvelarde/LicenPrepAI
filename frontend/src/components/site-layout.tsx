
import React from "react";
import { Outlet } from "react-router-dom";

import { SiteHeader } from "@/components/site-header";
import { SiteSidebar } from "@/components/site-sidebar";
import { Toaster } from "@/components/ui/toaster";
import { useIsMobile } from "@/hooks/use-mobile";

export function SiteLayout() {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex flex-1">
        <SiteSidebar />
        <main className={`flex-1 p-4 ${isMobile ? 'pb-20' : ''}`}>
          <Outlet />
        </main>
      </div>
      <Toaster />
    </div>
  );
}
