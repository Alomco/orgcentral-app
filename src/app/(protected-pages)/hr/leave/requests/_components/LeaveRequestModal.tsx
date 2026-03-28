'use client'

import { useMemo } from 'react'
import Button from '@/components/ui/Button'
import Dialog from '@/components/ui/Dialog'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Segment from '@/components/ui/Segment'
import { Form, FormItem } from '@/components/ui/Form'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { submitLeaveRequest, type DurationType, type HalfDayPortion } from '@/server/actions/hr/submitLeaveRequest'
import { countWorkingDays } from '@/server/actions/hr/leaveUtils'
import type { LeavePolicyOption } from '@/server/actions/hr/getLeavePolicies'

interface LeaveRequestModalProps {
    isOpen: boolean
    onClose: () => void
    policies: LeavePolicyOption[]
    userId: string
}

const durationOptions = [
    { value: 'full_day', label: 'Full day' },
    { value: 'half_day', label: 'Half day' },
    { value: 'hourly', label: 'Hourly' },
]

const halfDayOptions = [
    { value: 'first_half', label: 'First half' },
    { value: 'second_half', label: 'Second half' },
]

const timeOptions = Array.from({ length: 48 }, (_, i) => {
    const h = String(Math.floor(i / 2)).padStart(2, '0')
    const m = i % 2 === 0 ? '00' : '30'
    const val = `${h}:${m}`
    return { value: val, label: val }
})

const validationSchema = z.object({
    policyId: z.string().min(1, { message: 'Please choose a leave type' }),
    durationType: z.enum(['full_day', 'half_day', 'hourly']),
    halfDayPortion: z.enum(['first_half', 'second_half']).optional(),
    startDate: z.string().min(1, { message: 'Please pick a start date' }),
    endDate: z.string().min(1, { message: 'Please pick an end date' }),
    customHours: z.string().optional(),
    startTime: z.string().optional(),
    reason: z.string().optional(),
})

type FormSchema = z.infer<typeof validationSchema>

export default function LeaveRequestModal({
    isOpen,
    onClose,
    policies,
    userId,
}: LeaveRequestModalProps) {
    const router = useRouter()

    const policyOptions = policies.map((p) => ({ value: p.id, label: p.name }))

    const {
        handleSubmit,
        formState: { errors, isSubmitting },
        control,
        watch,
        setValue,
        setError,
    } = useForm<FormSchema>({
        defaultValues: {
            policyId: policies[0]?.id ?? '',
            durationType: 'full_day',
            halfDayPortion: 'first_half',
            startDate: '',
            endDate: '',
            customHours: '',
            startTime: '09:00',
            reason: '',
        },
        resolver: zodResolver(validationSchema),
    })

    const durationType = watch('durationType') as DurationType
    const startDate = watch('startDate')
    const endDate = watch('endDate')
    const customHours = watch('customHours')
    const startTime = watch('startTime')
    const halfDayPortion = watch('halfDayPortion') as HalfDayPortion

    const isSingleDayOnly = durationType !== 'full_day'

    const handleDurationChange = (val: string | string[]) => {
        const v = (Array.isArray(val) ? val[0] : val) as DurationType
        setValue('durationType', v)
        if (v !== 'full_day' && startDate) {
            setValue('endDate', startDate)
        }
    }

    const handleStartDateChange = (val: string) => {
        setValue('startDate', val)
        if (isSingleDayOnly) {
            setValue('endDate', val)
        }
    }

    const calculatedDays = useMemo(() => {
        if (!startDate || (!endDate && !isSingleDayOnly)) return null
        const s = new Date(startDate)
        const e = isSingleDayOnly ? s : new Date(endDate)
        if (isNaN(s.getTime()) || isNaN(e.getTime()) || e < s) return null
        if (durationType === 'half_day') return 0.5
        if (durationType === 'hourly') {
            const h = parseFloat(customHours ?? '')
            return isNaN(h) || h <= 0 ? null : Math.round((h / 7.5) * 10) / 10
        }
        return countWorkingDays(s, e)
    }, [startDate, endDate, durationType, customHours, isSingleDayOnly])

    const durationLabel = useMemo(() => {
        if (calculatedDays === null) return null
        if (durationType === 'hourly') {
            const h = parseFloat(customHours ?? '')
            if (isNaN(h) || h <= 0) return null
            return `${h} hour${h !== 1 ? 's' : ''} from ${startTime} (${calculatedDays} day${calculatedDays !== 1 ? 's' : ''})`
        }
        if (durationType === 'half_day') {
            const label = halfDayPortion === 'first_half' ? 'first half' : 'second half'
            return `Half day (${label})`
        }
        return `${calculatedDays} working day${calculatedDays !== 1 ? 's' : ''}`
    }, [calculatedDays, durationType, customHours, startTime, halfDayPortion])

    const onSubmit = async (values: FormSchema) => {
        const result = await submitLeaveRequest({
            userId,
            policyId: values.policyId,
            startDate: values.startDate,
            endDate: isSingleDayOnly ? values.startDate : values.endDate,
            durationType: values.durationType as DurationType,
            halfDayPortion: values.durationType === 'half_day'
                ? (values.halfDayPortion as HalfDayPortion)
                : undefined,
            customHours: values.durationType === 'hourly'
                ? parseFloat(values.customHours ?? '')
                : undefined,
            startTime: values.durationType === 'hourly'
                ? values.startTime
                : undefined,
            reason: values.reason,
        })

        if (!result.success) {
            setError('root', { message: result.error ?? 'Something went wrong.' })
            return
        }

        onClose()
        router.refresh()
    }

    return (
        <Dialog
            isOpen={isOpen}
            onClose={onClose}
            onRequestClose={onClose}
            width={520}
        >
            <h4 className="mb-1">Request leave</h4>
            <p className="text-sm text-gray-500 mb-6">
                Complete the fields below to submit a new leave request.
            </p>

            {errors.root && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 mb-4">
                    {errors.root.message}
                </div>
            )}

            <Form onSubmit={handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-4">
                    {/* Leave type */}
                    <FormItem
                        label="Leave type"
                        invalid={Boolean(errors.policyId)}
                        errorMessage={errors.policyId?.message}
                    >
                        <Controller
                            name="policyId"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    options={policyOptions}
                                    value={policyOptions.find((o) => o.value === field.value)}
                                    onChange={(opt) => field.onChange((opt as { value: string })?.value ?? '')}
                                />
                            )}
                        />
                    </FormItem>

                    {/* Duration type */}
                    <FormItem label="Duration">
                        <Segment
                            value={[durationType]}
                            onChange={handleDurationChange}
                            size="sm"
                        >
                            {durationOptions.map((opt) => (
                                <Segment.Item key={opt.value} value={opt.value}>
                                    {opt.label}
                                </Segment.Item>
                            ))}
                        </Segment>
                    </FormItem>

                    {/* Half day portion */}
                    {durationType === 'half_day' && (
                        <FormItem label="Which half?">
                            <Controller
                                name="halfDayPortion"
                                control={control}
                                render={({ field }) => (
                                    <Segment
                                        value={[field.value ?? 'first_half']}
                                        onChange={(val) => field.onChange(Array.isArray(val) ? val[0] : val)}
                                        size="sm"
                                    >
                                        {halfDayOptions.map((opt) => (
                                            <Segment.Item key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </Segment.Item>
                                        ))}
                                    </Segment>
                                )}
                            />
                        </FormItem>
                    )}

                    {/* Dates */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <FormItem
                            label={isSingleDayOnly ? 'Date' : 'Start date'}
                            invalid={Boolean(errors.startDate)}
                            errorMessage={errors.startDate?.message}
                        >
                            <Controller
                                name="startDate"
                                control={control}
                                render={({ field }) => (
                                    <Input
                                        type="date"
                                        value={field.value}
                                        onChange={(e) => handleStartDateChange((e.target as HTMLInputElement).value)}
                                    />
                                )}
                            />
                        </FormItem>
                        {!isSingleDayOnly && (
                            <FormItem
                                label="End date"
                                invalid={Boolean(errors.endDate)}
                                errorMessage={errors.endDate?.message}
                            >
                                <Controller
                                    name="endDate"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            type="date"
                                            value={field.value}
                                            onChange={(e) => field.onChange((e.target as HTMLInputElement).value)}
                                        />
                                    )}
                                />
                            </FormItem>
                        )}
                    </div>

                    {/* Hourly fields */}
                    {durationType === 'hourly' && (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <FormItem label="Hours">
                                <Controller
                                    name="customHours"
                                    control={control}
                                    render={({ field }) => (
                                        <Input
                                            type="number"
                                            min={0.5}
                                            max={7.5}
                                            step={0.5}
                                            placeholder="e.g. 2"
                                            value={field.value}
                                            onChange={(e) => field.onChange((e.target as HTMLInputElement).value)}
                                        />
                                    )}
                                />
                            </FormItem>
                            <FormItem label="Starting from">
                                <Controller
                                    name="startTime"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            options={timeOptions}
                                            value={timeOptions.find((o) => o.value === field.value)}
                                            onChange={(opt) => field.onChange((opt as { value: string })?.value ?? '09:00')}
                                        />
                                    )}
                                />
                            </FormItem>
                        </div>
                    )}

                    {/* Duration display */}
                    {durationLabel && (
                        <div className="rounded-lg bg-gray-50 dark:bg-gray-700 px-4 py-3">
                            <span className="text-sm text-gray-500 dark:text-gray-400">Time off: </span>
                            <span className="text-sm font-semibold heading-text">{durationLabel}</span>
                        </div>
                    )}

                    {/* Reason */}
                    <FormItem label="Reason (optional)">
                        <Controller
                            name="reason"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    textArea
                                    rows={2}
                                    placeholder="Add a short note for your approver"
                                    value={field.value}
                                    onChange={(e) => field.onChange((e.target as HTMLTextAreaElement).value)}
                                />
                            )}
                        />
                    </FormItem>

                    {/* Actions */}
                    <div className="flex justify-end gap-2 pt-2">
                        <Button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="solid"
                            type="submit"
                            loading={isSubmitting}
                        >
                            Submit request
                        </Button>
                    </div>
                </div>
            </Form>
        </Dialog>
    )
}
