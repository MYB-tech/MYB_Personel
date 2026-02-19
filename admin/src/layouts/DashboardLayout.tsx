import { useLocation, Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    Building2,
    CalendarCheck,
    Map,
    Megaphone,
    LogOut,
    Menu,
    X
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '../utils/cn';

export default function DashboardLayout() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Protected route check
    if (!user) {
        // Ideally handled by a wrapper, but failsafe here
        return null;
    }

    const menuItems = [
        { href: '/', label: 'Genel Bakış', icon: LayoutDashboard },
        { href: '/staff', label: 'Personel', icon: Users },
        { href: '/apartments', label: 'Apartmanlar', icon: Building2 },
        { href: '/tasks', label: 'Görevler', icon: CalendarCheck },
        { href: '/map', label: 'Canlı Harita', icon: Map },
        { href: '/announcements', label: 'Duyurular', icon: Megaphone },
    ];

    return (
        <div className="min-h-screen bg-background text-foreground flex">
            {/* Sidebar - Desktop */}
            <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card">
                <div className="p-6 border-b border-border">
                    <h1 className="text-2xl font-bold text-primary">MYB Personel</h1>
                    <p className="text-xs text-muted-foreground mt-1">Yönetim Paneli</p>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <Icon size={18} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-border">
                    <div className="flex items-center gap-3 px-3 py-2 mb-2">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                            {user.name.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium truncate">{user.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{user.phone}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                    >
                        <LogOut size={18} />
                        Çıkış Yap
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <header className="md:hidden h-16 border-b border-border bg-card flex items-center justify-between px-4">
                    <h1 className="font-bold text-primary">MYB Personel</h1>
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 text-muted-foreground hover:text-foreground"
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </header>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div className="md:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
                        <div className="fixed inset-y-0 left-0 w-3/4 bg-card border-r border-border p-4 shadow-xl">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="font-bold text-lg">Menü</h2>
                                <button onClick={() => setIsMobileMenuOpen(false)}>
                                    <X size={24} />
                                </button>
                            </div>
                            <nav className="space-y-1">
                                {menuItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        to={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-colors",
                                            location.pathname === item.href
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:bg-muted"
                                        )}
                                    >
                                        <item.icon size={20} />
                                        {item.label}
                                    </Link>
                                ))}
                                <button
                                    onClick={logout}
                                    className="flex w-full items-center gap-3 px-3 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-md mt-4"
                                >
                                    <LogOut size={20} />
                                    Çıkış Yap
                                </button>
                            </nav>
                        </div>
                    </div>
                )}

                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
