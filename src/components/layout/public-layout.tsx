import { Outlet } from 'react-router-dom'
import type { ReactNode } from 'react'
import { BrandHeader } from './brand-header'
import { Footer } from './footer'
import { PublicNavigation } from './public-navigation'
import { ServiceNotice } from './service-notice'

export function PublicLayout({ children }: { children?: ReactNode }) {
  return <div className="min-h-screen bg-surface"><a href="#public-main-content" className="skip-link">Saltar al contenido principal</a>
    <div className="sticky top-0 z-40">
      <ServiceNotice inline />
      <header className="relative border-b border-[#e6edef] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <BrandHeader compact />
          <PublicNavigation />
        </div>
      </header>
    </div>
    <main id="public-main-content">{children ?? <Outlet />}</main>
    <Footer />
  </div>
}
