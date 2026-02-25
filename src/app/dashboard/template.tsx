'use client'

import TransitionWrapper from "@/components/TransitionWrapper"

export default function Template({ children }: { children: React.ReactNode }) {
    return (
        <TransitionWrapper>
            {children}
        </TransitionWrapper>
    )
}
