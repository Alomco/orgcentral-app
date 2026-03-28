import Container from '@/components/shared/Container'
import classNames from '@/utils/classNames'
import { PAGE_CONTAINER_GUTTER_X } from '@/constants/theme.constant'
import Link from 'next/link'

export type FooterPageContainerType = 'gutterless' | 'contained'

type FooterProps = {
    pageContainerType: FooterPageContainerType
    className?: string
}

const FooterContent = () => {
    return (
        <div className="flex items-center justify-between flex-auto w-full">
            <span className="text-xs text-gray-400">
                Powered by OrgCentral
            </span>
            <div className="flex gap-3 text-xs text-gray-400">
                <Link
                    className="hover:text-gray-600"
                    href="/#"
                    onClick={(e) => e.preventDefault()}
                >
                    Terms
                </Link>
                <Link
                    className="hover:text-gray-600"
                    href="/#"
                    onClick={(e) => e.preventDefault()}
                >
                    Privacy
                </Link>
            </div>
        </div>
    )
}

export default function Footer({
    pageContainerType = 'contained',
    className,
}: FooterProps) {
    return (
        <footer
            className={classNames(
                `footer flex flex-auto items-center h-16 ${PAGE_CONTAINER_GUTTER_X}`,
                className,
            )}
        >
            {pageContainerType === 'contained' ? (
                <Container>
                    <FooterContent />
                </Container>
            ) : (
                <FooterContent />
            )}
        </footer>
    )
}
