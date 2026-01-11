import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children, title }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="bg-gray-50 min-h-screen transition-colors">
            {/* Sidebar with mobile toggle props */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* Header with hamburger click handler */}
            <Header
                title={title}
                onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
            />

            {/* Main Content Area */}
            {/* lg:pl-64 ensures space for sidebar on desktop. pl-0 on mobile. */}
            <main className="lg:pl-64 pt-20 p-8 transition-all duration-300">
                {children}
            </main>

            {/* Mobile Overlay Backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-10 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default Layout;
