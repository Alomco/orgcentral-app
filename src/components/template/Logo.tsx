'use client'

import classNames from 'classnames'
import { useBrand } from './BrandContext'
import type { CommonProps } from '@/@types/common'

interface LogoProps extends CommonProps {
    type?: 'full' | 'streamline'
    mode?: 'light' | 'dark'
    imgClass?: string
    logoWidth?: number
    logoHeight?: number
}

const Logo = (props: LogoProps) => {
    const { type = 'full', mode = 'light', className, style } = props
    const brand = useBrand()

    const textColor = mode === 'dark' ? '#ffffff' : brand.brandColour

    // If org has a logo URL, show it
    if (brand.logoUrl && type === 'full') {
        return (
            <div className={classNames('logo', className)} style={style}>
                <img
                    src={brand.logoUrl}
                    alt={`${brand.orgName} logo`}
                    className="max-h-8 w-auto"
                />
            </div>
        )
    }

    return (
        <div className={classNames('logo', className)} style={style}>
            <span
                className="font-bold tracking-tight"
                style={{
                    color: textColor,
                    fontSize: type === 'full' ? '18px' : '14px',
                }}
            >
                {type === 'full' ? brand.orgName : brand.initials}
            </span>
        </div>
    )
}

export default Logo
