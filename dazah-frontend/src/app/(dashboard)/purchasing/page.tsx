import { fetchModuleInfo } from '@/lib/api/purchasing'

export default async function PurchasingPage() {
  let moduleInfo
  let error
  try {
    moduleInfo = await fetchModuleInfo()
  } catch (e) {
    error = e instanceof Error ? e.message : '连接失败'
  }

  return (
    <div>
      <h1 className="text-[22px] font-semibold text-[var(--color-charcoal)] mb-2">
        采购管理
      </h1>
      {error ? (
        <p className="text-red-500">后端连接失败: {error}</p>
      ) : (
        <div className="bg-white p-4 rounded shadow">
          <p>模块代码: {moduleInfo?.code}</p>
          <p>模块名称: {moduleInfo?.name}</p>
          <p>描述: {moduleInfo?.description}</p>
        </div>
      )}
    </div>
  )
}
