import { fetchTrainingSelectTasks } from '@/lib/api/hr'
import TrainingSelectTasksClient from '@/components/hr/TrainingSelectTasksClient'

export default async function TrainingSelectTasksPage() {
  try {
    const res = await fetchTrainingSelectTasks()
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-[22px] font-semibold text-[var(--color-charcoal)]">
            培训选择任务
          </h1>
        </div>
        <TrainingSelectTasksClient initialTasks={res.data || []} />
      </div>
    )
  } catch {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-[22px] font-semibold text-[var(--color-charcoal)]">
            培训选择任务
          </h1>
        </div>
        <TrainingSelectTasksClient initialTasks={[]} />
      </div>
    )
  }
}
