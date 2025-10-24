import Link from 'next/link'
import { useI18n } from '@/lib/i18n/context'

export function Footer() {
    const { t } = useI18n()

    return (
        <footer className="flex justify-center items-center p-4 space-x-4">
            <Link href="/imprint" className="text-muted hover:text-text transition-colors">
                {t.imprint.title}
            </Link>
            <Link href="/contact" className="text-muted hover:text-text transition-colors">
                {t.common.contact}
            </Link>
        </footer>
    )
}