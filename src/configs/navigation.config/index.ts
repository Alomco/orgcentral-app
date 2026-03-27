import {
    NAV_ITEM_TYPE_ITEM,
    NAV_ITEM_TYPE_COLLAPSE,
} from '@/constants/navigation.constant'

import type { NavigationTree } from '@/@types/navigation'

const navigationConfig: NavigationTree[] = [
    {
        key: 'home',
        path: '/home',
        title: 'Home',
        translateKey: 'nav.home',
        icon: 'home',
        type: NAV_ITEM_TYPE_ITEM,
        authority: [],
        subMenu: [],
    },
    {
        key: 'hr',
        path: '',
        title: 'HR',
        translateKey: 'nav.hr',
        icon: 'groupSingleMenu',
        type: NAV_ITEM_TYPE_COLLAPSE,
        authority: [],
        subMenu: [
            {
                key: 'hr.leave.requests',
                path: '/hr/leave/requests',
                title: 'Time off',
                translateKey: 'nav.hr.leave.requests',
                icon: '',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [],
                subMenu: [],
            },
            {
                key: 'hr.leave.approvals',
                path: '/hr/leave/approvals',
                title: 'Approvals',
                translateKey: 'nav.hr.leave.approvals',
                icon: '',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [],
                subMenu: [],
            },
            {
                key: 'hr.absences',
                path: '/hr/absences',
                title: 'Absences',
                translateKey: 'nav.hr.absences',
                icon: '',
                type: NAV_ITEM_TYPE_ITEM,
                authority: [],
                subMenu: [],
            },
        ],
    },
]

export default navigationConfig
