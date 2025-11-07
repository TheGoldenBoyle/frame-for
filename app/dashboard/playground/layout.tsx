export default function PlaygroundLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <div className="particle-bg">
                <div className="particle particle-1"></div>
                <div className="particle particle-2"></div>
                <div className="particle particle-3"></div>
            </div>
            <div className="relative z-10 px-2">
                <div className="h-full flex flex-col mx-auto">
                    {children}
                </div>
            </div>
        </>
    )
}