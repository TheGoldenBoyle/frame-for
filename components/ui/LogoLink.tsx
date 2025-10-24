import Link from 'next/link'

export default function LogoLink() {
    return (
        <Link
            href="/"
            title="Go to home page"
            className="!text-2xl font-bold"
        >
            Bild<span className="font-black text-primary">Oro</span>
        </Link>
    )
}