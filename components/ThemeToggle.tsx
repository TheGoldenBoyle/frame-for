'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/lib/theme/provider'
import { Button } from '@/components/ui/Button'

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme()

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            aria-label="Toggle theme "
        >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </Button>
    )
}