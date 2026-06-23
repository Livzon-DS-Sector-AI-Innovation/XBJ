"use client"

import { useEffect, useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Menu } from "antd"
import type { MenuProps } from "antd"
import { getModuleByKey } from "@/lib/menu-config"
import type { SubMenuItem } from "@/lib/menu-config"
import { fetchTrainingLedgerPages, fetchAnnualTrainingPlans } from "@/lib/api/hr"

type MenuItem = Required<MenuProps>["items"][number]

function buildMenuItems(items: SubMenuItem[]): MenuItem[] {
  return items.map((item) => {
    if (item.children && item.children.length > 0) {
      return {
        key: item.key,
        label: item.label,
        children: buildMenuItems(item.children),
      }
    }
    return {
      key: item.path,
      label: item.label,
    }
  })
}

/** Depth-first exact match for leaf items. */
function findSelectedKey(items: SubMenuItem[], pathname: string): string | undefined {
  for (const item of items) {
    if (item.children) {
      const childKey = findSelectedKey(item.children, pathname)
      if (childKey) return childKey
    }
    if (pathname === item.path) {
      return item.path
    }
  }
  return undefined
}

/** Find parent keys to open for current pathname. */
function findParentKeys(items: SubMenuItem[], pathname: string): string[] {
  for (const item of items) {
    if (item.children) {
      for (const child of item.children) {
        if (pathname === child.path) {
          return [item.key]
        }
      }
      const nested = findParentKeys(item.children, pathname)
      if (nested.length > 0) {
        return [item.key, ...nested]
      }
    }
  }
  return []
}

/** Merge dynamic training-ledger pages from API into static menu, grouped by department, factory, and type. */
function mergeDynamicMenus(
  staticChildren: SubMenuItem[],
  dynamicPages: { employee_number: string; employee_name: string; department?: string; factory?: string; ledger_type?: string }[],
  annualPlans: { id: string; department: string }[]
): SubMenuItem[] {
  return staticChildren.map((item) => {
    if (item.key === "new-training-ledger" && item.children) {
      // 按"厂区|部门|类型"分组动态页面
      const groupMap = new Map<string, typeof dynamicPages>()
      for (const d of dynamicPages) {
        const factory = d.factory || ""
        const dept = d.department || "未知部门"
        const ltype = d.ledger_type || "event"
        const groupKey = `${factory}|${dept}|${ltype}`
        if (!groupMap.has(groupKey)) {
          groupMap.set(groupKey, [])
        }
        groupMap.get(groupKey)!.push(d)
      }

      const SOP_LABEL = "员工SOP培训台账"
      const EVENT_LABEL = "员工事件培训台账"

      const newChildren: SubMenuItem[] = []

      for (const child of item.children) {
        if (!child.children || child.children.length === 0) {
          // 叶子项（如新建培训台账），直接保留
          newChildren.push(child)
        } else {
          // 部门子菜单，合并动态页面（按类型分两个子组）
          const dept = child.label
          const existingPaths = new Set(child.children.map((c) => c.path))
          // 匹配同部门的所有厂区组
          const matchedKeys: string[] = []
          for (const [key] of groupMap) {
            const parts = key.split("|")
            const keyDept = parts[1] || ""
            if (keyDept === dept) {
              matchedKeys.push(key)
            }
          }

          // 收集该部门下所有 SOP 和 Event 页面
          const sopPages: typeof dynamicPages = []
          const eventPages: typeof dynamicPages = []
          for (const mk of matchedKeys) {
            const pages = groupMap.get(mk) || []
            groupMap.delete(mk)
            const parts = mk.split("|")
            const ltype = parts[2] || "event"
            if (ltype === "sop") {
              sopPages.push(...pages)
            } else {
              eventPages.push(...pages)
            }
          }

          // 保持原有的静态子菜单
          const updatedChildren = [...child.children]

          // 追加 SOP 页面
          if (sopPages.length > 0) {
            const extraSop = sopPages
              .filter((d) => !existingPaths.has(`/hr/training/ledger?employee_number=${d.employee_number}&type=sop`))
              .map((d) => ({
                key: `training-ledger-sop-${d.employee_number}`,
                label: d.employee_name,
                path: `/hr/training/ledger?employee_number=${d.employee_number}&type=sop&factory=${d.factory || 'old'}`,
              }))
            if (extraSop.length > 0) {
              updatedChildren.push({
                key: `training-ledger-sop-dept-${dept}`,
                label: SOP_LABEL,
                path: "#",
                children: extraSop,
              } as SubMenuItem)
            }
          }

          // 追加 Event 页面
          if (eventPages.length > 0) {
            const extraEvent = eventPages
              .filter((d) => !existingPaths.has(`/hr/training/ledger?employee_number=${d.employee_number}&type=event`))
              .map((d) => ({
                key: `training-ledger-event-${d.employee_number}`,
                label: d.employee_name,
                path: `/hr/training/ledger?employee_number=${d.employee_number}&type=event&factory=${d.factory || 'old'}`,
              }))
            if (extraEvent.length > 0) {
              updatedChildren.push({
                key: `training-ledger-event-dept-${dept}`,
                label: EVENT_LABEL,
                path: "#",
                children: extraEvent,
              } as SubMenuItem)
            }
          }

          newChildren.push({ ...child, children: updatedChildren })
        }
      }

      // 添加剩余的动态部门
      for (const [groupKey, pages] of groupMap.entries()) {
        const parts = groupKey.split("|")
        const factory = parts[0] || ""
        const dept = parts[1] || ""
        const ltype = parts[2] || "event"
        const factoryLabel = factory === "new" ? "【新厂】" : factory === "old" ? "【旧厂】" : ""
        const typeLabel = ltype === "sop" ? SOP_LABEL : EVENT_LABEL
        newChildren.push({
          key: `training-ledger-dept-${groupKey}`,
          label: `${factoryLabel}${dept}`,
          path: "#",
          children: [{
            key: `training-ledger-type-${groupKey}`,
            label: typeLabel,
            path: "#",
            children: pages.map((p) => ({
              key: `training-ledger-${p.employee_number}-${ltype}`,
              label: p.employee_name,
              path: `/hr/training/ledger?employee_number=${p.employee_number}&type=${ltype}&factory=${factory || 'old'}`,
            })),
          }],
        })
      }

      return { ...item, children: newChildren }
    }
    if (item.key === "annual-plan" && item.children) {
      const existingKeys = new Set(item.children.map((c) => c.key))
      // 按部门去重：同一部门只显示一个菜单（聚合所有年份）
      const seenDepts = new Set<string>()
      const uniquePlans = annualPlans.filter((p) => {
        if (seenDepts.has(p.department)) return false
        seenDepts.add(p.department)
        return true
      })
      const extra = uniquePlans
        .filter((p) => !existingKeys.has(`annual-plan-dept-${p.department}`))
        .map((p) => ({
          key: `annual-plan-dept-${p.department}`,
          label: p.department,
          path: `/hr/training/annual-plan?department=${encodeURIComponent(p.department)}`,
        }))
      if (extra.length === 0) return item
      return { ...item, children: [...item.children, ...extra] }
    }
    if (item.children) {
      return { ...item, children: mergeDynamicMenus(item.children, dynamicPages, annualPlans) }
    }
    return item
  })
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const moduleKey = pathname.split("/")[1] || "production"
  const currentModule = getModuleByKey(moduleKey)

  const [dynamicPages, setDynamicPages] = useState<
    { employee_number: string; employee_name: string; department?: string; factory?: string; ledger_type?: string }[]
  >([])
  const [annualPlans, setAnnualPlans] = useState<
    { id: string; department: string }[]
  >([])

  useEffect(() => {
    fetchTrainingLedgerPages()
      .then((res) => {
        setDynamicPages(res.data || [])
      })
      .catch(() => {
        // ignore
      })
  }, [])

  useEffect(() => {
    fetchAnnualTrainingPlans({ page_size: 200 })
      .then((res) => {
        const plans = (res.data || []).map((p: any) => ({
          id: p.id,
          department: p.department,
        }))
        setAnnualPlans(plans)
      })
      .catch(() => {
        // ignore
      })
  }, [])

  if (!currentModule) return null

  const mergedChildren = useMemo(() => {
    return mergeDynamicMenus(currentModule.children, dynamicPages, annualPlans)
  }, [currentModule.children, dynamicPages, annualPlans])

  const menuItems: MenuItem[] = buildMenuItems(mergedChildren)
  const selectedKey = findSelectedKey(mergedChildren, pathname)
  const defaultOpenKeys = findParentKeys(mergedChildren, pathname)

  const handleClick: MenuProps["onClick"] = ({ key }) => {
    if (key.startsWith("/")) {
      router.push(key)
    }
  }

  return (
    <aside className="w-56 bg-[var(--color-canvas)] border-r border-[var(--color-hairline)] flex flex-col shrink-0 overflow-y-auto">
      <div className="px-4 pt-5 pb-3">
        <h2 className="text-[18px] font-semibold text-[var(--color-charcoal)]">
          {currentModule.label}
        </h2>
      </div>

      <Menu
        mode="inline"
        selectedKeys={selectedKey ? [selectedKey] : []}
        defaultOpenKeys={defaultOpenKeys}
        items={menuItems}
        onClick={handleClick}
        className="sidebar-menu flex-1"
        style={{ borderInlineEnd: "none" }}
      />

      <div className="px-4 py-3 border-t border-[var(--color-hairline-soft)]">
        <p className="text-[12px] text-[var(--color-stone)]">
          v0.1.0
        </p>
      </div>
    </aside>
  )
}
