export function Loader() {
    return (
        <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-3 border-primary/15 rounded-full"></div>
            <div
                className="absolute inset-0 border-3 border-transparent border-t-primary border-r-primary/50 rounded-full animate-spin"
                style={{ animationDuration: '0.8s' }}
            ></div>
        </div>
    )
}