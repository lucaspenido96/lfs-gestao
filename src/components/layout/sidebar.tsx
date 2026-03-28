'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const modules = [
  { label: 'Propostas', href: '/proposals', active: true },
  { label: 'Checklist', href: '/checklist', active: false },
  { label: 'Tracker de Bancos', href: '/tracker', active: false },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 bg-[#0A1628] flex flex-col">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="text-[#C9A84C] font-bold text-2xl tracking-widest font-serif">LFS</div>
        <div className="text-white/40 text-[10px] tracking-widest uppercase mt-0.5">Gestão</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {modules.map(mod => {
          const isActive = pathname.startsWith(mod.href)
          if (!mod.active) {
            return (
              <div
                key={mod.href}
                className="flex items-center justify-between px-3 py-2.5 rounded text-white/30 cursor-not-allowed"
              >
                <span className="text-sm">{mod.label}</span>
                <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-white/30">Em breve</span>
              </div>
            )
          }
          return (
            <Link
              key={mod.href}
              href={mod.href}
              className={`flex items-center px-3 py-2.5 rounded text-sm transition-colors ${
                isActive
                  ? 'bg-[#C9A84C]/20 text-[#C9A84C] font-medium'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {mod.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/10">
        <div className="text-white/20 text-[10px]">LFS Financial Advisory</div>
        <div className="text-white/15 text-[10px]">Belo Horizonte – MG</div>
      </div>
    </aside>
  )
}
