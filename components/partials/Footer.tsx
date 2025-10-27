import Link from 'next/link'
import { useI18n } from '@/lib/i18n/context'

export function Footer() {
    const { t } = useI18n()

    return (
        <footer className="flex justify-center items-center p-4 space-x-4 absolute bottom-0 inset-x-0 z-[20]">
            <Link href="/imprint" className="text-muted hover:text-text transition-colors">
                {t.imprint.title}
            </Link>
            <Link href="/privacy" className="text-muted hover:text-text transition-colors">
                Privacy
            </Link>
            <Link href="/terms" className="text-muted hover:text-text transition-colors">
                Terms
            </Link>
            <Link href="/contact" className="text-muted hover:text-text transition-colors">
                {t.common.contact}
            </Link>
        </footer>
    )
}