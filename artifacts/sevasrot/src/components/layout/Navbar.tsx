import { Link, useLocation } from "wouter";
import { Heart, Menu, X, LogOut, User as UserIcon, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useGetPendingCount } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [location] = useLocation();
  const { user, logout, isAdmin, authHeaders } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { data: pendingData } = useGetPendingCount({
    query: {
      enabled: isAdmin,
    },
    request: { headers: authHeaders },
  });

  const closeMenu = () => setIsMobileMenuOpen(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/drives", label: "Seva Drives" },
    { href: "/donations", label: "Donations" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full glass border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
              <Heart className="h-7 w-7 text-primary fill-primary" />
            </div>
            <span className="font-display text-2xl sm:text-3xl font-bold text-primary tracking-tight">
              Sevasrot
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary relative py-2",
                    location === link.href ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {link.label}
                  {location === link.href && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-4 border-l border-border/50 pl-6">
              {user ? (
                <>
                  {isAdmin && (
                    <Link href="/admin">
                      <Button variant="outline" size="sm" className="relative font-medium gap-2">
                        <LayoutDashboard className="h-4 w-4" />
                        Admin
                        {pendingData?.count ? (
                          <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-[10px]">
                            {pendingData.count}
                          </Badge>
                        ) : null}
                      </Button>
                    </Link>
                  )}
                  <Link href="/donate">
                    <Button size="sm" className="font-medium">Donate Now</Button>
                  </Link>
                  <Link href="/profile">
                    <Button variant="ghost" size="icon" className="rounded-full bg-secondary/50 hover:bg-secondary">
                      <UserIcon className="h-5 w-5 text-foreground" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground hover:text-destructive">
                    <LogOut className="h-5 w-5" />
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Log in
                  </Link>
                  <Link href="/register">
                    <Button size="sm" className="font-medium">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/50 bg-card overflow-hidden"
          >
            <div className="px-4 py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className={cn(
                    "block px-4 py-3 rounded-xl text-base font-medium transition-colors",
                    location === link.href ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary"
                  )}
                >
                  {link.label}
                </Link>
              ))}

              <div className="h-px bg-border/50 my-2" />

              {user ? (
                <div className="flex flex-col gap-3">
                  {isAdmin && (
                    <Link href="/admin" onClick={closeMenu}>
                      <Button variant="outline" className="w-full justify-start gap-3">
                        <LayoutDashboard className="h-5 w-5" />
                        Admin Dashboard
                        {pendingData?.count ? (
                          <Badge variant="destructive" className="ml-auto">{pendingData.count} Pending</Badge>
                        ) : null}
                      </Button>
                    </Link>
                  )}
                  <Link href="/donate" onClick={closeMenu}>
                    <Button className="w-full justify-start">Donate Now</Button>
                  </Link>
                  <Link href="/profile" onClick={closeMenu}>
                    <Button variant="secondary" className="w-full justify-start gap-3">
                      <UserIcon className="h-5 w-5" />
                      My Profile
                    </Button>
                  </Link>
                  <Button variant="ghost" onClick={() => { logout(); closeMenu(); }} className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10">
                    <LogOut className="h-5 w-5" />
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <Link href="/login" onClick={closeMenu}>
                    <Button variant="outline" className="w-full">Log in</Button>
                  </Link>
                  <Link href="/register" onClick={closeMenu}>
                    <Button className="w-full">Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
