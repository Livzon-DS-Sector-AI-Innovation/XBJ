import { fetchMaterialBoms } from '@/lib/api/production'
import { MaterialBomClient } from '@/components/production'

export default async function MaterialBomPage() {
  const res = await fetchMaterialBoms({ page: 1, page_size: 20 })

  return (
    <MaterialBomClient
      initialBoms={res.data}
      initialTotal={res.meta?.total || 0}
    />
  )
}
