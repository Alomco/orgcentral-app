/**
 * Permission keys and labels for the RBAC system.
 * These are stored as string arrays on Role.permissions JSON field.
 */

export interface PermissionDef {
    key: string
    label: string
}

export interface PermissionGroup {
    module: string
    permissions: PermissionDef[]
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
    {
        module: 'HR — Leave',
        permissions: [
            { key: 'can_view_own_leave', label: 'View own leave requests' },
            { key: 'can_submit_leave', label: 'Submit leave requests' },
            { key: 'can_approve_leave', label: 'Approve or decline leave requests' },
            { key: 'can_view_team_leave', label: 'View all team leave' },
            { key: 'can_manage_leave_types', label: 'Manage leave types' },
        ],
    },
    {
        module: 'Organisation',
        permissions: [
            { key: 'can_manage_team', label: 'Invite and remove team members' },
            { key: 'can_manage_roles', label: 'Create and edit roles' },
            { key: 'can_manage_org_settings', label: 'Edit organisation settings and branding' },
        ],
    },
    {
        module: 'Platform',
        permissions: [
            { key: 'can_view_dashboard', label: 'Access the HR dashboard' },
            { key: 'can_view_reports', label: 'Access reports (coming soon)' },
        ],
    },
]

export const ALL_PERMISSION_KEYS: string[] = PERMISSION_GROUPS.flatMap(
    (g) => g.permissions.map((p) => p.key),
)

/** Default permissions for the three seeded system roles. */
export const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
    orgAdmin: ALL_PERMISSION_KEYS,
    manager: [
        'can_view_own_leave',
        'can_submit_leave',
        'can_approve_leave',
        'can_view_team_leave',
        'can_manage_team',
        'can_view_dashboard',
    ],
    member: [
        'can_view_own_leave',
        'can_submit_leave',
        'can_view_dashboard',
    ],
}

/** Sensible starting permissions for a new custom role (same as member). */
export const NEW_ROLE_DEFAULT_PERMISSIONS: string[] = DEFAULT_ROLE_PERMISSIONS.member
