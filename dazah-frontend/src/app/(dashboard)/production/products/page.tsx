import { fetchProducts } from '@/lib/api/product'
import { ProductClient } from '@/components/product'

export default async function ProductionProductsPage() {
  const res = await fetchProducts({ page: 1, page_size: 20 })

  return (
    <ProductClient
      initialProducts={res.data}
      initialTotal={res.meta?.total || 0}
    />
  )
}
