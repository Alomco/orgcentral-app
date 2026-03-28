import { Resend } from 'resend'

const apiKey = process.env.RESEND_API_KEY
const fromEmail = process.env.NOTIFICATION_FROM_EMAIL ?? 'OrgCentral <noreply@orgcentral.app>'
const hasResend = apiKey && apiKey !== 'placeholder_add_later' && apiKey.startsWith('re_')

const resend = hasResend ? new Resend(apiKey) : null

export async function sendEmail({
    to,
    subject,
    html,
}: {
    to: string
    subject: string
    html: string
}): Promise<{ success: boolean; error?: string }> {
    if (!resend) {
        console.log(`[EMAIL] Resend not configured — would send to ${to}:`)
        console.log(`[EMAIL] Subject: ${subject}`)
        console.log(`[EMAIL] Body preview: ${html.replace(/<[^>]*>/g, '').slice(0, 200)}`)
        return { success: true }
    }

    try {
        const { error } = await resend.emails.send({
            from: fromEmail,
            to,
            subject,
            html,
        })

        if (error) {
            console.error('[EMAIL] Resend error:', error)
            return { success: false, error: 'Could not send the email. Please try again.' }
        }

        return { success: true }
    } catch (err) {
        console.error('[EMAIL] Failed:', err)
        return { success: false, error: 'Could not send the email. Please try again.' }
    }
}
