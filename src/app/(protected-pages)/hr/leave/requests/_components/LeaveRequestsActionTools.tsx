'use client'

import Button from '@/components/ui/Button'
import { TbPlus } from 'react-icons/tb'

export default function LeaveRequestsActionTools({
    onRequestLeave,
}: {
    onRequestLeave: () => void
}) {
    return (
        <Button
            variant="solid"
            icon={<TbPlus className="text-xl" />}
            onClick={onRequestLeave}
        >
            Request leave
        </Button>
    )
}
