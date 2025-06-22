"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Menu, X, Users, BarChart3, Brain, Github } from "lucide-react";
import Link from "next/link";
import { useSession } from "@/server/auth/auth-client";
import { UserMenu } from "../../components/user-menu";
import { Logo } from "@/components/logo";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();

  const navItems = [
    { name: "Features", href: "#features", icon: Users },
    { name: "Demo", href: "#showcase", icon: Brain },
    { name: "Benefits", href: "#benefits", icon: BarChart3 },
    {
      name: "GitHub",
      href: "https://github.com/adarshaacharya/humantryx",
      icon: Github,
      external: true,
    },
  ];

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Logo size="md" showText={true} />

          {/* Desktop Navigation */}
          <div className="hidden items-center space-x-8 md:flex">
            {navItems.map((item, index) => (
              <motion.a
                key={item.name}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-1 text-slate-600 transition-colors duration-200 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </motion.a>
            ))}
          </div>

          {/* Desktop CTA */}
          {session ? (
            <UserMenu />
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden items-center space-x-4 md:flex"
              >
                <Link href="/sign-in">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Get Started
                  </Button>
                </Link>
              </motion.div>
            </>
          )}

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="border-t border-slate-200 py-4 md:hidden dark:border-slate-800"
          >
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  className="flex items-center space-x-2 text-slate-600 transition-colors duration-200 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </a>
              ))}

              <div className="flex flex-col space-y-2 border-t border-slate-200 pt-4 dark:border-slate-800">
                <Link href="/sign-in">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button
                    size="sm"
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
}
