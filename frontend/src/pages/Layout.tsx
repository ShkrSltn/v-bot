// src/layouts/AdminLayout.tsx
"use client"

import * as React from "react"
import { Outlet } from "react-router-dom"
import '@/styles/Layout.css';
import {
  BotIcon,
  BookOpenIcon,
  BarChartIcon,
  MenuIcon,
  XIcon,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { ModeToggle } from "@/components/ModeToggle";

export function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  return (
    <SidebarProvider>
      <div className="h-screen w-screen flex flex-col overflow-hidden relative">
        {/* Add the mode toggle */}
        <ModeToggle currentMode="admin" />
        
        {/* Header for all devices */}
        <div className="h-[50px] w-full bg-[#2E2E30] flex items-center px-4">
          {/* Mobile menu button (only shows on mobile) */}
          <div className="sm:hidden">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="text-white"
            >
              <MenuIcon className="h-6 w-6 cursor-pointer" />
            </button>
          </div>
          
          {/* Desktop/Tablet header content */}
          <div className="hidden sm:flex w-full items-center">
            <h1 className="text-white font-semibold text-lg">Admin Panel</h1>
          </div>
        </div>

        {/* Dimmed overlay when mobile menu is open */}
        {mobileMenuOpen && (
          <div
            className="sm:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-30 transition-opacity duration-300"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Main layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Desktop Sidebar (always visible on desktop) */}
          <Sidebar
            collapsible="offcanvas"
            className="bg-[#2E2E30] text-white border-none hidden sm:block"
          >
            <SidebarContent className="pl-5 pr-5">
              <SidebarMenu className="gap-3 m-0">
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className="hover:bg-white/10 transition-colors duration-200 rounded-md px-2 py-1.5"
                  >
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider admin-panel-sidebar mb-2 px-2">
                    Categories
                  </h3>
                  <div className="flex flex-col gap-1">
                    <SidebarMenuButton asChild className="hover:bg-white/10 transition-colors duration-200 rounded-md px-2 py-1.5">
                      <a href="/admin-panel/questions">
                        <BotIcon className="h-4 w-4" />
                        Questions
                      </a>
                    </SidebarMenuButton>
                    <SidebarMenuButton asChild className="hover:bg-white/10 transition-colors duration-200 rounded-md px-2 py-1.5">
                      <a href="/admin-panel/analytics">
                        <BarChartIcon className="h-4 w-4" />
                        Analytics
                      </a>
                    </SidebarMenuButton>
                    <SidebarMenuButton asChild className="hover:bg-white/10 transition-colors duration-200 rounded-md px-2 py-1.5">
                      <a href="/admin-panel/chat-history">
                        <BookOpenIcon className="h-4 w-4" />
                        Chat History
                      </a>
                    </SidebarMenuButton>
                  </div>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
          </Sidebar>

          {/* Mobile Sidebar */}
          <div className={`sm:hidden fixed inset-0 z-40 transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="absolute left-0 top-0 h-full w-64 bg-[#2E2E30] text-white z-50 p-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Menu</h2>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white cursor-pointer"
                >
                  <XIcon className="h-6 w-6" />
                </button>
              </div>
              <div className="flex flex-col gap-1">
                
                <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mt-4 mb-2 px-2">
                  Categories
                </h3>
                
                <a 
                  href="/admin-panel/questions" 
                  className="flex items-center gap-3 hover:bg-white/10 transition-colors duration-200 rounded-md px-2 py-1.5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <BotIcon className="h-4 w-4" />
                  Questions
                </a>
                <a 
                  href="/admin-panel/analytics" 
                  className="flex items-center gap-3 hover:bg-white/10 transition-colors duration-200 rounded-md px-2 py-1.5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <BarChartIcon className="h-4 w-4" />
                  Analytics
                </a>
                <a 
                  href="/admin-panel/chat-history" 
                  className="flex items-center gap-3 hover:bg-white/10 transition-colors duration-200 rounded-md px-2 py-1.5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <BookOpenIcon className="h-4 w-4" />
                  Chat History
                </a>
              </div>
            </div>
          </div>

          {/* Main content */}
          <main className="flex-1 p-6 overflow-auto z-10 relative">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}