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

/** Merge dynamic training-ledger pages from API into static menu, grouped by department. */
function mergeDynamicMenus(
  staticChildren: SubMenuItem[],
  dynamicPages: { employee_number: string; employee_name: string; department?: string }[],
  annualPlans: { id: string; department: string }[]
): SubMenuItem[] {
  return staticChildren.map((item) => {
    if (item.key === "training-ledger" && item.children) {
      // 按部门分组动态页面
      const deptMap = new Map<string, typeof dynamicPages>()
      for (const d of dynamicPages) {
        const dept = d.department || "未知部门"
        if (!deptMap.has(dept)) {
          deptMap.set(dept, [])
        }
        deptMap.get(dept)!.push(d)
      }

      const newChildren: SubMenuItem[] = []

      for (const child of item.children) {
        if (!child.children || child.children.length === 0) {
          // 叶子项（如新建培训台账），直接保留
          newChildren.push(child)
        } else {
          // 部门子菜单，合并动态页面
          const dept = child.label
          const dynamicPagesForDept = deptMap.get(dept) || []
          deptMap.delete(dept)

          const existingPaths = new Set(child.children.map((c) => c.path))
          const extraPages = dynamicPagesForDept
            .filter((d) => !existingPaths.has(`/hr/training/ledger?employee_number=${d.employee_number}`))
            .map((d) => ({
              key: `training-ledger-${d.employee_number}`,
              label: `${d.employee_name}培训台账`,
              path: `/hr/training/ledger?employee_number=${d.employee_number}`,
            }))

          newChildren.push({
            ...child,
            children: [...child.children, ...extraPages],
          })
        }
      }

      // 添加剩余的动态部门
      for (const [dept, pages] of deptMap.entries()) {
        newChildren.push({
          key: `training-ledger-dept-${dept}`,
          label: dept,
          path: "#",
          children: pages.map((p) => ({
            key: `training-ledger-${p.employee_number}`,
            label: `${p.employee_name}培训台账`,
            path: `/hr/training/ledger?employee_number=${p.employee_number}`,
          })),
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
    { employee_number: string; employee_name: string; department?: string }[]
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
