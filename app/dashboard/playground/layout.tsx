export default function PlaygroundLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-[calc(100vh-72px)]">
            <div className="h-full flex flex-col p-4 md:p-8 mx-auto max-w-7xl">
                {children}
            </div>
        </div>
    )
}