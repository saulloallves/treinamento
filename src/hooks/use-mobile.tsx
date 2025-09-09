import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < MOBILE_BREAKPOINT;
  })

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    // Fallback for browsers that don't support addEventListener on MediaQueryList
    const add = (mql as any).addEventListener ? 'addEventListener' : 'addListener'
    const remove = (mql as any).removeEventListener ? 'removeEventListener' : 'removeListener'
    ;(mql as any)[add]('change', onChange)

    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => (mql as any)[remove]('change', onChange)
  }, [])

  return !!isMobile
}
