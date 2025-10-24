'use client'

import React from 'react'

export const VortexBackground: React.FC = () => {
    return (
        <div className="fixed inset-0 pointer-events-none z-[20] overflow-hidden">
            <svg 
                className="absolute inset-0 w-full h-full opacity-30"
                viewBox="0 0 1920 1080" 
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Radial Gradient Background */}
                <defs>
                    <radialGradient id="vortexGradient" cx="50%" cy="50%" r="50%" spreadMethod="pad">
                        <stop offset="0%" stopColor="rgba(59, 130, 246, 0.1)" />
                        <stop offset="50%" stopColor="rgba(99, 102, 241, 0.05)" />
                        <stop offset="100%" stopColor="rgba(168, 85, 247, 0.02)" stopOpacity="0" />
                    </radialGradient>
                </defs>

                {/* Vortex Layers */}
                <g>
                    {/* Outer Ring */}
                    <path 
                        d="M960 160 Q1920 540 960 920" 
                        fill="none" 
                        stroke="url(#vortexGradient)" 
                        strokeWidth="2" 
                        className="animate-[spin_40s_linear_infinite] opacity-30"
                    />
                    
                    {/* Middle Ring */}
                    <path 
                        d="M960 360 Q1680 540 960 720" 
                        fill="none" 
                        stroke="url(#vortexGradient)" 
                        strokeWidth="1.5" 
                        className="animate-[spin_30s_linear_infinite_reverse] opacity-20"
                    />
                    
                    {/* Inner Ring */}
                    <path 
                        d="M960 560 Q1440 540 960 520" 
                        fill="none" 
                        stroke="url(#vortexGradient)" 
                        strokeWidth="1" 
                        className="animate-[spin_50s_linear_infinite] opacity-10"
                    />
                </g>
            </svg>
        </div>
    )
}