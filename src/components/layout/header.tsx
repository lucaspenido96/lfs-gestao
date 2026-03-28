'use client'

import { signOut } from 'next-auth/react'

interface HeaderProps {
  user: { name?: string | null; email?: string | null }
}

export default function Header({ user }: HeaderProps) {
  return (
    <header className="h-14 bg-white border-b border-gray-200 px-6 flex items-center justify-between flex-shrink-0">
      <div className="text-sm text-gray-500">
        Olá, <span className="font-medium text-gray-900">{user.name || user.email}</span>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        Sair
      </button>
    </header>
  )
}
