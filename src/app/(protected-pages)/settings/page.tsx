import { redirect } from 'next/navigation'

// Decision: /settings now redirects to the unified settings page at /profile.
// Admin-specific tabs (Organisation, Branding) are shown there based on role.
// The /settings/roles subroute remains independent.
export default function SettingsPage() {
    redirect('/profile?tab=organisation')
}
