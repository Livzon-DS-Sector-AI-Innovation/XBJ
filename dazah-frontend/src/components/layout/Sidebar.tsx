"use client"

import { usePathname, useRouter } from "next/navigation"
import { Menu } from "antd"
import type { MenuProps } from "antd"
import { getModuleByKey } from "@/lib/menu-config"
import type { SubMenuItem } from "@/lib/menu-config"

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

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const moduleKey = pathname.split("/")[1] || "production"
  const currentModule = getModuleByKey(moduleKey)

  if (!currentModule) return null

  const menuItems: MenuItem[] = buildMenuItems(currentModule.children)
  const selectedKey = findSelectedKey(currentModule.children, pathname)
  const defaultOpenKeys = findParentKeys(currentModule.children, pathname)

  const handleClick: MenuProps["onClick"] = ({ key }) => {
    // Only leaf items (paths starting with "/") trigger navigation.
    // Parent submenu keys like "vehicle" / "it" only expand/collapse.
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
        inlineIndent={0}
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
