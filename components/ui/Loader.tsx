type LoaderProps = {
    size?: 'sm' | 'md' | 'lg'
    fullScreen?: boolean
}

export function Loader({ size = 'md', fullScreen = false }: LoaderProps) {
    const sizeClasses = {
        sm: 'w-6 h-6 border-2',
        md: 'w-12 h-12 border-3',
        lg: 'w-16 h-16 border-4'
    }

    const { w, h, border } = {
        w: sizeClasses[size].split(' ')[0],
        h: sizeClasses[size].split(' ')[1],
        border: sizeClasses[size].split(' ')[2]
    }

    const loader = (
        <div className={`relative ${w} ${h}`}>
            <div className={`absolute inset-0 ${border} border-primary/15 rounded-full`}></div>
            <div
                className={`absolute inset-0 ${border} border-transparent border-t-primary border-r-primary/50 rounded-full animate-spin`}
                style={{ animationDuration: '0.8s' }}
            ></div>
        </div>
    )

    if (fullScreen) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                {loader}
            </div>
        )
    }

    return loader
}