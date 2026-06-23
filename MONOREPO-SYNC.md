# Monorepo → 独立仓库多人协作推送标准流程

> **用途**：将 monorepo 中的子目录（如 `dazah-backend`、`dazah-frontend`）同步推送到独立的 Git 仓库的共享开发分支。
> **核心原则**：不删除他人工作、不覆盖未确认代码、不泄露敏感信息、**必须通过 PR 合并**。

---

## 1. 适用范围

- 源仓库：monorepo（如 `xbj`），内含多个子目录（`backend/`、`frontend/`）
- 目标仓库：独立的 Git 仓库（如 `dazah-backend`、`dazah-frontend`）
- 目标分支：**多人协作分支**（如 `dev/livzon-syntpharm`），其他人也在推送
- 同步方向：**单向**（monorepo → 独立仓库），不处理反向合并

---

## 2. 前置检查清单（每次推送前必做）

| 检查项 | 命令/方法 | 预期结果 |
|--------|----------|----------|
| 网络连通性 | `curl -x http://127.0.0.1:7890 -I https://github.com` | `HTTP/2 200` |
| 代理配置 | `git config --global http.proxy` | 已配置代理（如需） |
| 目标仓库可访问 | `git ls-remote $REPO $BRANCH` | 返回 commit hash |
| 本地 Git 身份 | `git config user.name && git config user.email` | 已配置，非空 |
| 目标分支存在 | `git ls-remote $REPO refs/heads/$BRANCH` | 返回 hash |

### 代理配置（如需要）

```bash
# 设置代理（例如 Clash/V2Ray 本地代理）
git config --global http.proxy http://127.0.0.1:7890
git config --global https.proxy http://127.0.0.1:7890

# 取消代理
git config --global --unset http.proxy
git config --global --unset https.proxy
```

---

## 3. 核心原则

### 3.1 必须通过 PR 合并（最重要）
- **禁止直接推送到共享开发分支**（如 `dev/livzon-syntpharm`）
- **标准流程**：推送到临时分支 → 创建 Pull Request → 审查后合并到目标分支
- **目的**：代码审查、CI 检查、避免冲突、保持历史清晰

### 3.2 增量同步原则
- **只推送 monorepo 中实际变更的文件**（修改/新增/删除）
- **保留目标仓库中所有未变更的文件**（不删除他人的工作）
- **绝不使用覆盖式同步**（`rm -rf *` 然后复制）

### 3.3 冲突透明原则
- 推送前必须对比目标仓库最近提交和本地变更文件
- 如果同一文件被两边同时修改，必须明确告知并确认

### 3.4 安全红线原则
- **检查敏感信息泄露**：密钥、密码、Token、私钥等
- **排除大文件**：数据库 dump（`.sql`、`.dump`）、日志、构建产物
- **排除环境文件**：`.env`、`.env.local`（即使已加入 `.gitignore` 也要二次确认）

---

## 4. 标准协作流程（PR 模式，7 步骤）

**多人协作分支必须通过 Pull Request 合并，禁止直接推送。**

### 步骤 1：确定推送参数

```bash
# 源目录（monorepo 中的子目录）
SOURCE_DIR="/path/to/monorepo/backend"
# 目标仓库地址
TARGET_REPO="https://github.com/ORG/REPO.git"
# 目标分支（如 dev/livzon-syntpharm）
BRANCH="dev/xxx"
# 临时同步分支名称（建议使用 sync/xbj-YYYYMMDD）
SYNC_BRANCH="sync/xbj-$(date +%Y%m%d)"
# 临时工作目录（自动创建）
TEMP_DIR="/tmp/monorepo-sync-$(date +%s)"
```

### 步骤 2：冲突预检查（必做）

对比目标仓库最近提交和本地变更文件，识别重叠。

```bash
# 2.1 获取本地变更文件列表
cd "$MONOREPO_ROOT"
git diff --name-only -- "$SOURCE_DIR" | sed "s|^${SOURCE_DIR}/||" > /tmp/local-changed.txt
git ls-files --others --exclude-standard -- "$SOURCE_DIR" | sed "s|^${SOURCE_DIR}/||" >> /tmp/local-changed.txt
git ls-files --deleted -- "$SOURCE_DIR" | sed "s|^${SOURCE_DIR}/||" >> /tmp/local-changed.txt
sort -u /tmp/local-changed.txt > /tmp/local-changed-sorted.txt

# 2.2 克隆目标仓库并获取最近 10 次提交的文件列表
git clone --branch "$BRANCH" --single-branch "$TARGET_REPO" "$TEMP_DIR"
cd "$TEMP_DIR"
git log --name-only --oneline -10 --pretty=format:"COMMIT %h %s" | grep -v "^COMMIT " | sort | uniq > /tmp/remote-changed.txt

# 2.3 对比重叠文件
echo "=== 重叠文件（两边都修改）==="
comm -12 /tmp/local-changed-sorted.txt /tmp/remote-changed.txt
```

**重叠文件说明**：
- 如果输出为空 → 无冲突，安全推送
- 如果有输出 → 这些文件被远程最近修改，同时本地也修改了，推送会覆盖远程版本
- 需要确认：这些重叠文件是否都是你的改动？如果是，可以覆盖；如果不是，需要先人工合并

### 步骤 3：克隆、拉取最新代码，并创建临时分支

```bash
# 如果步骤 2 已克隆，直接拉取并创建分支
cd "$TEMP_DIR"
git pull origin "$BRANCH"
git checkout -b "$SYNC_BRANCH"

# 如果步骤 2 未克隆，先克隆再创建分支
# git clone --branch "$BRANCH" "$TARGET_REPO" "$TEMP_DIR"
# cd "$TEMP_DIR" && git pull origin "$BRANCH" && git checkout -b "$SYNC_BRANCH"
```

**注意**：必须在本地创建临时分支，所有变更提交到这个分支，禁止直接提交到 `$BRANCH`。

### 步骤 4：增量同步（只应用本地变更）

```bash
cd "$MONOREPO_ROOT"

# 4.1 处理修改的文件（覆盖）
git diff --name-only -- "$SOURCE_DIR" | while IFS= read -r file; do
  rel_path="${file#$SOURCE_DIR/}"
  if [ -f "$file" ]; then
    mkdir -p "$(dirname "$TEMP_DIR/$rel_path")"
    cp "$file" "$TEMP_DIR/$rel_path"
    echo "[UPDATE] $rel_path"
  fi
done

# 4.2 处理新增的文件（复制）
git ls-files --others --exclude-standard -- "$SOURCE_DIR" | while IFS= read -r file; do
  rel_path="${file#$SOURCE_DIR/}"
  # 排除大文件和敏感文件
  if [[ "$rel_path" == *.sql ]] || [[ "$rel_path" == *.dump ]] || [[ "$rel_path" == dump.* ]] || [[ "$rel_path" == test-results/* ]] || [[ "$rel_path" == playwright-report/* ]] || [[ "$rel_path" == *.log ]]; then
    echo "[SKIP] $rel_path"
    continue
  fi
  if [ -f "$file" ]; then
    mkdir -p "$(dirname "$TEMP_DIR/$rel_path")"
    cp "$file" "$TEMP_DIR/$rel_path"
    echo "[ADD] $rel_path"
  fi
done

# 4.3 处理删除的文件（删除）
git ls-files --deleted -- "$SOURCE_DIR" | while IFS= read -r file; do
  rel_path="${file#$SOURCE_DIR/}"
  if [ -f "$TEMP_DIR/$rel_path" ]; then
    rm "$TEMP_DIR/$rel_path"
    echo "[DELETE] $rel_path"
  fi
done

# 4.4 处理隐藏文件（如 .dockerignore、.gitignore）
for hidden in .dockerignore .env.example .env.local .gitignore; do
  if [ -f "$SOURCE_DIR/$hidden" ]; then
    cp "$SOURCE_DIR/$hidden" "$TEMP_DIR/$hidden"
    echo "[UPDATE] $hidden"
  fi
done
```

### 步骤 5：敏感信息扫描（必做）

在提交前，手动或自动扫描敏感信息：

```bash
# 5.1 扫描常见的密钥模式
cd "$TEMP_DIR"
# 扫描飞书 App Secret
grep -rn "FEISHU_APP_SECRET=" . --include="*.md" --include="*.txt" --include="*.py" --include="*.ts" --include="*.tsx" --include="*.sh" | grep -v ".env.example" | grep -v "__pycache__"
# 扫描通用密钥模式
grep -rnE "(api[_-]?key|secret|token|password|private[_-]?key)" . --include="*.md" --include="*.txt" | grep -v ".env.example" | grep -v "node_modules" | grep -v ".git"
```

**如果发现敏感信息**：
1. 定位到具体文件和行号
2. 从提交中移除该文件（`git rm <file>`），或修改文件内容删除密钥
3. 在飞书/对应平台**重置该密钥**
4. 重新执行步骤 4 和 5

### 步骤 6：提交并推送到临时分支

```bash
cd "$TEMP_DIR"
git add -A

if git diff --cached --quiet; then
  echo "没有变动，跳过推送"
  exit 0
fi

git commit -m "chore: sync from monorepo ($(date +%Y%m%d_%H%M%S))"

# 推送到临时分支（不是目标分支！）
git push origin "$SYNC_BRANCH" 2>&1 | tail -5

echo "临时分支 $SYNC_BRANCH 已推送"
```

### 步骤 7：创建 Pull Request 并合并（人工操作）

**这是多人协作的关键步骤，不可跳过。**

#### 7.1 创建 Pull Request

**方式 A：手动在 GitHub 网页上创建（推荐）**

1. 打开浏览器，访问目标仓库页面
2. 点击 "Pull requests" → "New pull request"
3. Base branch：选择 `$BRANCH`（如 `dev/livzon-syntpharm`）
4. Compare branch：选择 `$SYNC_BRANCH`（如 `sync/xbj-20250622`）
5. 填写 PR 标题和描述：
   ```
   Title: chore: sync from monorepo (20250622)
   Description:
   - 同步 xbj monorepo 的最新变更到 dev 分支
   - 变更文件数：xx 个
   - 新增文件：xx 个，修改文件：xx 个，删除文件：xx 个
   - 已排除 dump.sql 等敏感/大文件
   - 已扫描无敏感信息泄露
   ```
6. 点击 "Create pull request"

**方式 B：使用 GitHub CLI（如已安装 `gh`）**

```bash
cd "$TEMP_DIR"
gh pr create --title "chore: sync from monorepo ($(date +%Y%m%d))" \
  --body "同步 xbj monorepo 最新变更到 dev 分支" \
  --base "$BRANCH" \
  --head "$SYNC_BRANCH"
```

#### 7.2 审查与合并

| 审查方式 | 操作 | 说明 |
|----------|------|------|
| **自己审查** | 在 GitHub PR 页面点击 "Merge pull request" | 适用于紧急同步或变更明确的情况 |
| **团队审查** | 添加 Reviewer，等待他人 Approve 后合并 | 适用于复杂变更或多人协作场景 |
| **自动合并** | 开启 PR 的 "Auto-merge" | 当 CI 通过且审查通过后自动合并 |

**合并建议**：
- 使用 **"Create a merge commit"** 模式（保留完整历史）
- 不要使用 **"Squash and merge"**（会丢失本次同步的文件级变更记录）

#### 7.3 清理临时分支（可选）

合并完成后，删除远程临时分支：

```bash
# 在 GitHub 网页上删除（PR 合并后会有 "Delete branch" 按钮）
# 或在本地执行：
git push origin --delete "$SYNC_BRANCH"
```

---

## 5. 备选流程：直接推送（仅限仓库允许且紧急情况）

> ⚠️ **警告**：此流程违反标准多人协作规范，仅当以下所有条件满足时方可使用：
> - 仓库**没有**设置分支保护规则（Branch Protection）
> - 该分支**允许**直接推送
> - 情况紧急，需要立即生效
> - 变更简单明确，无冲突风险

### 备选步骤（替代步骤 3 和 7）

```bash
# 步骤 3（备选）：不创建临时分支，直接拉取最新代码
cd "$TEMP_DIR"
git pull origin "$BRANCH"

# 步骤 6（备选）：直接推送到目标分支（跳过 PR）
git add -A
git commit -m "chore: sync from monorepo ($(date +%Y%m%d_%H%M%S))"
git push origin "$BRANCH"
```

**风险**：
- 无代码审查，可能引入错误
- 直接覆盖他人修改（如果重叠）
- 破坏分支历史的一致性

---

## 6. 完整通用脚本模板（PR 模式）

将以下脚本保存为 `sync-monorepo.sh`，每次推送前修改开头的参数即可：

```bash
#!/bin/bash
set -e

# ==================== 用户配置区（每次修改） ====================
SOURCE_DIR="/absolute/path/to/monorepo/subdir"      # 例如：/home/user/xbj/dazah-backend
TARGET_REPO="https://github.com/ORG/REPO.git"      # 例如：https://github.com/org/dazah-backend.git
BRANCH="dev/xxx"                                    # 例如：dev/livzon-syntpharm
SYNC_BRANCH="sync/xbj-$(date +%Y%m%d)"             # 临时分支名称
# ================================================================

# 固定配置
MONOREPO_ROOT="$(cd "$(dirname "$SOURCE_DIR")" && pwd)"
TEMP_DIR="/tmp/monorepo-sync-$(date +%s)"
SKIP_PATTERNS=("*.sql" "*.dump" "dump.*" "test-results/*" "playwright-report/*" "*.log" "*.zip")

echo "========================================"
echo "  Monorepo → 独立仓库同步（PR 模式）"
echo "  源: $SOURCE_DIR"
echo "  目标: $TARGET_REPO ($BRANCH)"
echo "  临时分支: $SYNC_BRANCH"
echo "========================================"

# 步骤 1：前置检查
echo ""
echo ">>> [1/7] 前置检查..."
if ! git config user.name > /dev/null || ! git config user.email > /dev/null; then
  echo "ERROR: Git 身份未配置。请先执行："
  echo "  git config --global user.name 'Your Name'"
  echo "  git config --global user.email 'your@email.com'"
  exit 1
fi

if ! git ls-remote "$TARGET_REPO" "$BRANCH" > /dev/null 2>&1; then
  echo "ERROR: 无法访问目标仓库或分支不存在"
  exit 1
fi

echo "  ✅ 前置检查通过"

# 步骤 2：冲突预检查
echo ""
echo ">>> [2/7] 冲突预检查..."
mkdir -p "$TEMP_DIR"

# 获取本地变更文件
cd "$MONOREPO_ROOT"
git diff --name-only -- "$SOURCE_DIR" | sed "s|^${SOURCE_DIR}/||" > "$TEMP_DIR/local-changed.txt" 2>/dev/null || true
git ls-files --others --exclude-standard -- "$SOURCE_DIR" | sed "s|^${SOURCE_DIR}/||" >> "$TEMP_DIR/local-changed.txt" 2>/dev/null || true
git ls-files --deleted -- "$SOURCE_DIR" | sed "s|^${SOURCE_DIR}/||" >> "$TEMP_DIR/local-changed.txt" 2>/dev/null || true
sort -u "$TEMP_DIR/local-changed.txt" > "$TEMP_DIR/local-changed-sorted.txt" 2>/dev/null || true

# 获取远程最近提交文件
git clone --branch "$BRANCH" --single-branch "$TARGET_REPO" "$TEMP_DIR/repo" 2>&1 | tail -3
cd "$TEMP_DIR/repo"
git log --name-only --oneline -10 --pretty=format:"COMMIT %h %s" | grep -v "^COMMIT " | sort | uniq > "$TEMP_DIR/remote-changed.txt" 2>/dev/null || true

# 对比重叠
OVERLAP=$(comm -12 "$TEMP_DIR/local-changed-sorted.txt" "$TEMP_DIR/remote-changed.txt" 2>/dev/null || true)
if [ -n "$OVERLAP" ]; then
  echo "  ⚠️  发现重叠文件（远程最近也修改了这些文件）："
  echo "$OVERLAP" | sed 's/^/     /'
  echo "  推送将覆盖远程版本。请确认这些文件都是你的改动。"
  echo "  如果确认无误，继续执行；如果有疑问，请人工检查后再推送。"
fi
echo "  ✅ 冲突检查完成"

# 步骤 3：拉取最新代码并创建临时分支
echo ""
echo ">>> [3/7] 拉取最新代码并创建临时分支..."
cd "$TEMP_DIR/repo"
git pull origin "$BRANCH" 2>&1 | tail -3
git checkout -b "$SYNC_BRANCH"
echo "  ✅ 已创建临时分支 $SYNC_BRANCH"

# 步骤 4：增量同步
echo ""
echo ">>> [4/7] 增量同步（只应用本地变更）..."
cd "$MONOREPO_ROOT"

# 修改的文件
MOD_COUNT=0
while IFS= read -r file; do
  rel_path="${file#$SOURCE_DIR/}"
  if [ -f "$file" ]; then
    mkdir -p "$(dirname "$TEMP_DIR/repo/$rel_path")"
    cp "$file" "$TEMP_DIR/repo/$rel_path"
    ((MOD_COUNT++)) || true
  fi
done < <(git diff --name-only -- "$SOURCE_DIR" 2>/dev/null || true)

# 新增的文件
ADD_COUNT=0
while IFS= read -r file; do
  rel_path="${file#$SOURCE_DIR/}"
  should_skip=false
  for pattern in "${SKIP_PATTERNS[@]}"; do
    case "$rel_path" in $pattern) should_skip=true; break;; esac
  done
  if [ "$should_skip" = true ]; then
    echo "    [SKIP] $rel_path"
    continue
  fi
  if [ -f "$file" ]; then
    mkdir -p "$(dirname "$TEMP_DIR/repo/$rel_path")"
    cp "$file" "$TEMP_DIR/repo/$rel_path"
    ((ADD_COUNT++)) || true
  fi
done < <(git ls-files --others --exclude-standard -- "$SOURCE_DIR" 2>/dev/null || true)

# 删除的文件
DEL_COUNT=0
while IFS= read -r file; do
  rel_path="${file#$SOURCE_DIR/}"
  if [ -f "$TEMP_DIR/repo/$rel_path" ]; then
    rm "$TEMP_DIR/repo/$rel_path"
    ((DEL_COUNT++)) || true
  fi
done < <(git ls-files --deleted -- "$SOURCE_DIR" 2>/dev/null || true)

# 隐藏文件
for hidden in .dockerignore .env.example .env.local .gitignore; do
  if [ -f "$SOURCE_DIR/$hidden" ]; then
    cp "$SOURCE_DIR/$hidden" "$TEMP_DIR/repo/$hidden"
  fi
done

echo "  ✅ 修改: $MOD_COUNT, 新增: $ADD_COUNT, 删除: $DEL_COUNT"

# 步骤 5：敏感信息扫描
echo ""
echo ">>> [5/7] 敏感信息扫描..."
cd "$TEMP_DIR/repo"
SECRETS_FOUND=false

# 扫描飞书密钥
if grep -rn "FEISHU_APP_SECRET=" . --include="*.md" --include="*.txt" --include="*.py" --include="*.ts" --include="*.tsx" --include="*.sh" 2>/dev/null | grep -v ".env.example" | grep -v "__pycache__"; then
  SECRETS_FOUND=true
fi

# 扫描通用密钥
if grep -rnE "(api[_-]?key|secret|token|password|private[_-]?key)" . --include="*.md" --include="*.txt" 2>/dev/null | grep -v ".env.example" | grep -v "node_modules" | grep -v ".git"; then
  SECRETS_FOUND=true
fi

if [ "$SECRETS_FOUND" = true ]; then
  echo "  ❌ ERROR: 发现敏感信息泄露！请按步骤 5 处理后再推送。"
  exit 1
fi
echo "  ✅ 未检测到敏感信息泄露"

# 步骤 6：提交并推送到临时分支
echo ""
echo ">>> [6/7] 提交并推送到临时分支..."
git add -A
if git diff --cached --quiet; then
  echo "  没有变动，跳过推送"
else
  git commit -m "chore: sync from monorepo ($(date +%Y%m%d_%H%M%S))"
  git push origin "$SYNC_BRANCH" 2>&1 | tail -5
  echo "  ✅ 临时分支 $SYNC_BRANCH 已推送"
fi

# 步骤 7：提示创建 PR（人工操作）
echo ""
echo ">>> [7/7] 请手动创建 Pull Request"
echo ""
echo "  1. 打开浏览器访问：$(dirname "$TARGET_REPO")"
echo "  2. 点击 'Pull requests' → 'New pull request'"
echo "  3. Base branch: $BRANCH"
echo "  4. Compare branch: $SYNC_BRANCH"
echo "  5. 填写标题和描述，然后 'Create pull request'"
echo "  6. 审查通过后点击 'Merge pull request'"
echo ""
echo "  或使用 gh CLI（如已安装）："
echo "    gh pr create --title 'chore: sync from monorepo' --body '...' --base $BRANCH --head $SYNC_BRANCH"
echo ""

# 清理
rm -rf "$TEMP_DIR"

echo "========================================"
echo "  同步脚本执行完毕，请完成 PR 合并"
echo "========================================"
```

---

## 6. 常见故障排查

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| `Failed to connect to github.com port 443` | 网络不通或防火墙 | 配置代理：`git config --global http.proxy http://127.0.0.1:7890` |
| `fatal: unable to auto-detect email address` | Git 身份未配置 | 配置用户名和邮箱（见步骤 1） |
| `push declined due to repository rule violations` | GitHub secret scanning 检测到密钥泄露 | 见步骤 5，移除敏感文件后重新提交 |
| `! [rejected] non-fast-forward` | 远程有更新，本地不是最新 | 先 `git pull` 再推送（脚本已自动处理） |
| `remote: File too large` | 文件超过 GitHub 100MB 限制 | 排除大文件（`.sql`、`.dump` 等），使用 Git LFS 或外部存储 |

---

## 7. 给智能体的执行提示

如果你是智能体，当用户要求"推送代码到仓库"时，请按以下顺序执行：

1. **先读取本文档**（`MONOREPO-SYNC.md`），理解流程和原则
2. **询问用户**以下参数：
   - 源目录（monorepo 中的哪个子目录？）
   - 目标仓库地址
   - 目标分支
   - 是否需要代理
3. **执行前置检查**（网络、Git 身份、仓库可访问性）
4. **执行冲突预检查**，展示重叠文件给用户确认
5. **执行增量同步**，排除大文件和敏感文件
6. **执行敏感信息扫描**，发现泄露时立即停止并报告
7. **推送到临时分支**（如 `sync/xbj-20250622`），**禁止直接推送到目标分支**
8. **提示用户创建 Pull Request**：在 GitHub 网页上创建 PR（临时分支 → 目标分支），或使用 `gh CLI`
9. **报告结果**：临时分支推送成功/失败、变更文件数、PR 创建链接、是否有安全警告

**绝对禁止**：
- 直接推送到共享开发分支（如 `dev/livzon-syntpharm`）
- 直接覆盖式推送（删除远程所有文件再复制）
- 推送包含密钥、密码、Token 的文件
- 推送数据库 dump（`.sql`、`.dump`）等大文件
- 在多人协作分支上强制推送（`--force`）
