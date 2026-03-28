import classNames from 'classnames'
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

    const textColor = mode === 'dark' ? '#ffffff' : '#0066CC'

    return (
        <div className={classNames('logo', className)} style={style}>
            <span
                className="font-bold tracking-tight"
                style={{
                    color: textColor,
                    fontSize: type === 'full' ? '18px' : '14px',
                }}
            >
                {type === 'full' ? 'OrgCentral' : 'OC'}
            </span>
        </div>
    )
}

export default Logo
