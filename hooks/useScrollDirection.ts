import { useState, useEffect, useRef } from "react"

export function useScrollDirection() {
	const [isVisible, setIsVisible] = useState(true)
	const lastScrollY = useRef(0)
	const ticking = useRef(false)

	useEffect(() => {
		const handleScroll = () => {
			if (!ticking.current) {
				window.requestAnimationFrame(() => {
					const currentScrollY = window.scrollY

					if (currentScrollY < 10) {
						setIsVisible(true)
					} else if (
						currentScrollY > lastScrollY.current &&
						currentScrollY > 50
					) {
						setIsVisible(false)
					} else if (currentScrollY < lastScrollY.current) {
						setIsVisible(true)
					}

					lastScrollY.current = currentScrollY
					ticking.current = false
				})
				ticking.current = true
			}
		}

		window.addEventListener("scroll", handleScroll, { passive: true })
		return () => window.removeEventListener("scroll", handleScroll)
	}, [])

	return isVisible
}
