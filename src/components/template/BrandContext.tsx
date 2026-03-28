'use client'

import { createContext, useContext, type ReactNode } from 'react'

export interface BrandContextValue {
    orgName: string
    brandColour: string
    logoUrl: string
    initials: string
}

const BrandContext = createContext<BrandContextValue | null>(null)

export function BrandProvider({
    value,
    children,
}: {
    value: BrandContextValue | null
    children: ReactNode
}) {
    return (
        <BrandContext.Provider value={value}>
            {children}
        </BrandContext.Provider>
    )
}

export function useBrand(): BrandContextValue {
    const ctx = useContext(BrandContext)
    return ctx ?? {
        orgName: 'OrgCentral',
        brandColour: '#2a85ff',
        logoUrl: '',
        initials: 'OC',
    }
}
