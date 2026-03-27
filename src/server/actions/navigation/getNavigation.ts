import { auth } from '@/auth'
import navigationConfig from '@/configs/navigation.config'
import { getPendingApprovalsCount } from '@/server/actions/hr/getPendingApprovalsCount'
import type { NavigationTree } from '@/@types/navigation'

function injectBadge(
    tree: NavigationTree[],
    targetKey: string,
    badge: number,
): NavigationTree[] {
    return tree.map((node) => {
        if (node.key === targetKey) {
            return { ...node, badge }
        }
        if (node.subMenu.length > 0) {
            return { ...node, subMenu: injectBadge(node.subMenu, targetKey, badge) }
        }
        return node
    })
}

export async function getNavigation() {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
        return navigationConfig
    }

    let pendingCount = 0
    try {
        pendingCount = await getPendingApprovalsCount(userId)
    } catch {
        // Fail silently — badge is non-critical
    }

    if (pendingCount === 0) {
        return navigationConfig
    }

    return injectBadge(navigationConfig, 'hr.leave.approvals', pendingCount)
}
