
"use client";

import { NAVIGATIONS } from "@/Constants/Navigations";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { PanelLeftOpen, PanelRightOpen } from "lucide-react";
import { UserStore } from "@/store/UserStore";
import Image from "next/image";

export const NavigationBar = () => {
  const [sideBar, setSideBar] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user } = UserStore();


  const toggleSidebar = () => setSideBar(!sideBar);

  return (
    <nav
      className={`flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white shadow-2xl transition-all duration-300 ${
        sideBar ? "w-[260px]" : "w-[80px]"
      }`}
    >
      {/* Sticky Content Wrapper */}
      <div className="sticky top-0 flex flex-col h-screen">
        {/* User Profile Section */}
        <div className="flex flex-col items-center mt-6 mb-8">
          {user.avatar_url && (
            <>
              <button
                onClick={() => router.push("/profile")}
                role="navigation"
                className="group relative rounded-full size-14 overflow-hidden border-2 border-indigo-500 shadow-lg hover:scale-110 transition-transform duration-300"
              >
                <Image
                  src={user.avatar_url}
                  alt={user.full_name || "User"}
                  width={56}
                  height={56}
                  quality={100}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              <p
                className={`mt-3 text-sm font-semibold text-gray-200 truncate w-[200px] text-center transition-opacity duration-300 ${
                  sideBar ? "opacity-100" : "opacity-0"
                }`}
              >
                {user.full_name || "Profile"}
              </p>
            </>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex flex-col gap-2 px-3 flex-1 overflow-y-auto">
          {NAVIGATIONS.map((item) => {
            const isActive = pathname === item.url;
            return (
              <button
                key={item.id}
                onClick={() => router.push(item.url)}
                className={` flex gap-4  items-center p-3 h-12 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md"
                    : "hover:bg-indigo-700/50 hover:text-indigo-200"
                } ${sideBar ? "justify-start" : "justify-center"}`}
              >
                <item.icon className="w-6 h-6 shrink-0" />
                {sideBar && (
                  <span
                    className={`text-base font-medium transition-all duration-300 ${
                      sideBar
                        ? "opacity-100 max-w-[200px]"
                        : "opacity-0 max-w-0"
                    } overflow-hidden whitespace-nowrap`}
                  >
                    {item.name}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="p-4 border-t border-gray-700/50">
          <button
            onClick={toggleSidebar}
            className={`flex h-12 ${
              sideBar ? "justify-end" : "justify-center"
            } p-3 rounded-lg transition-all duration-200 hover:bg-gray-700/50 group`}
          >
            {sideBar ? (
              <PanelRightOpen className="w-6 h-6 text-gray-300 group-hover:text-red-400" />
            ) : (
              <PanelLeftOpen className="w-6 h-6 text-gray-300 group-hover:text-green-400" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};
