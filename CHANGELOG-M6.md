# CHANGELOG — M6 画像缓存质量修复（4 项遗留）+ M6.1 控制台密钥 + 2.1.2 默认分片 + 2.1.3 最低内核版本修正

## 2.1.3 最低 Mihomo 内核版本修正（2026-10-06，真机导入验证发现）

- 问题：真机跑 `mihomo -t` 发现订阅在 Mihomo v1.19.25 下导入失败：`proxy 0: '' has unset fields: tls-crypt`。根因：v1.19.25（PR #2785 首版 openvpn 支持）的 `OpenVPNOption.TLSCrypt` 没有 `omitempty`，属必填字段；而 VPN Gate 上游 .ovpn 配置里根本没有 `<tls-crypt>`/`<tls-auth>`（四账号全量 120 节点实测 0 个带），Mihomo 运行时又无条件要求 256 字节静态 key，伪造 key 只会握手失败。v1.19.30（#2989）起 tls-crypt/tls-auth/tls-crypt-v2 全部改为可选，实测 `mihomo -t` 通过。
- 改动（`worker.js`，`APP_VERSION` 2.1.2 → 2.1.3）：仅修正用户-facing 文案——订阅头部注释与 `client-template.yaml`、`deploy-checklist.md` 的最低版本要求由 ≥v1.19.25 改为 ≥v1.19.30。无行为变更。
- 验证：真实 B 账号订阅（10 节点）+ 4-provider 客户端模板，`mihomo -t` 在 v1.19.30 下均 `test is successful`；v1.19.25 下确认失败（预期行为）。

---

## 2.1.2 服务端默认分片（2026-10-06，反重力交叉验证发现 P1）

- 问题：`SHARD_ID` 环境变量是死配置——服务端只在客户端显式带 `?shard=k` 时才分片；裸 URL 下 4 账号节点池 29/30 重叠，并联去重落空。
- 改动（`worker.js`，`APP_VERSION` 2.1.1 → 2.1.2）：
  - 无 `?shard=` 参数时，默认按本账号 `CONFIG.SHARD_ID` 过滤（越界则 fail-open 不过滤）；
  - `?shard=k`（0..3）显式覆盖；`?shard=all` 或非法值 = 不过滤拿全量（逃生通道）；
  - 分片签名计入 lastgood 兜底缓存键，注释同步更新。
- `client-template.yaml`：shard 参数注释更新（模板 4 个 provider URL 的显式 shard 参数继续有效）。

---

## M6.1 控制台变量/密钥覆盖（2026-10-06，用户选择"一劳永逸"）

- 背景：灰度部署时三个密钥是直接写进 Worker 代码 CONFIG 的；以后每次从 GitHub 粘贴新代码会把密钥覆盖掉，需手动重填（已验证：漏填则 L3 静默失效，不易察觉）。
- 改动（`worker.js`，`APP_VERSION` 2.1.0 → 2.1.1）：
  - 新增 `mergeEnvOverrides(env)`：在 `fetch` 首行调用，首次请求时把控制台同名变量/密钥合并进 `CONFIG`（幂等；env 在同一部署内恒定，并发安全）。
  - 可覆盖 5 项：`ACCOUNT_TAG` / `SHARD_ID`（字符串自动转数字）/ `SUB_AUTH_TOKEN` / `ABUSEIPDB_KEY` / `PROXYCHECK_KEY`。控制台未设置时回退到代码默认值，旧部署方式仍兼容。
  - 结果：4 个账号部署同一份干净代码，差异项全部进控制台（密钥用加密 Secret），以后更新代码直接粘贴，不再碰密钥。`~/workspace/.secrets/deploy/worker-{A,B,C,D}.js` 四份含密钥变体即日起作废。
- 验证：`node --check` 通过；真实 Cloudflare 环境行为（token 鉴权 403/200、x-vg-version）待浏览器重部署后复核。

---

# CHANGELOG — M6 画像缓存质量修复（4 项遗留）

基线：M5 的 `worker.js`（1151 行）。单文件部署形态不变，未新增部署文件。
验证：`node --check` 通过；`/tmp/test-m6.mjs` 4 组冒烟测试全过（stub 模拟上游，零真实网络）。

## 改动清单

### F1 失败不毒化缓存
- `batchIpaQuality` 返回值由 `Map` 改为 `{ got, failed }`：
  - `got`：ip-api 明确回答的行（含 `assessQuality → null` 的"查无此 IP"，是有效负数据）；
  - `failed`：抓取失败的 IP（超时/429/异常/整批未返回）。
- 新增 `NEG_TTL_MS = 60_000`；失败条目以 `{ t, q: null, neg: true }` / `{ t, score: null, neg: true }` 记入 `qualityMem` / `scamMem`，**60 秒后即可重试**。
  - ip-api 层：原"失败也按成功写 `{t: now, q: null}`，6 小时不重试" → 现 60s 负缓存。
  - scamalytics 层：原 `t: now - SCAM_TTL_MS/2`（失败 12 小时不重试）→ 现 60s 负缓存；失败条目不再占用滚动刷新预算（`rolling` 只收 `!c.neg`）。
- 60s 内的重复请求不打上游（防失败雪崩时放大请求），60s 后自动重试，源恢复后 1 分钟内自愈，无需人工介入。

### F2 singleflight 防缓存击穿
- ip-api 批量层：新增 `ipaFlight`（key = 排序后的 IP 集合）+ `fetchIpaBatchFlight()`。同一 isolate 内并发请求候选 IP 集合相同时，只打一次上游，后到的请求等待共享结果；IP 集合不同则各自抓取（保守：正确但不共享）。
- scamalytics 层：新增 `scamFlight`（ip → Promise）+ `fetchScamScoreSF()`，按 IP 去重并发抓取。
- 抓取与缓存写入统一收敛到 `fetchIpaIntoCache(ips, bag)`（前台同步路径与 SWR 后台路径共用，天然共享 singleflight）。

### F3 完整 stale-while-revalidate
- `enrichQuality` 将过期条目分流为 `need`（从未画像 / 失败负缓存过期 / 画像为 null 无旧值 → 前台同步抓）与 `stale`（过期但有旧画像 → **先用旧画像副本保证本次订阅可用**，`ctx.waitUntil(fetchIpaIntoCache(stale, null))` 后台异步刷新，不阻塞响应）。
- 后台刷新失败只记 60s 负缓存，不影响已返回的旧画像；无 `ctx.waitUntil` 时（如测试）自动退化为"用旧值、不刷新"，不抛错。

### F4 静态画像 TTL 纠正
- 删除 `QUALITY_TTL_MS`（6h 一刀切）；新增 `qualityTtl(q)` 与 `qualityExpired(c, now)`：
  - 决策敏感区（risk 25~74）：8h；稳定区（risk <25 或 ≥75）：24h；未知（q 为 null）：8h。
  - 与 `scamTtl()` 的"敏感区 8h / 稳定区 24h"分层对齐；静态/低变化画像（干净住宅 IP 等）TTL 从 6h 延长到 24h，画像预算集中在"会改变结论的 IP"上。
- 核对其他 TTL 一致性（结论：无需改动）：
  - FireHOL 24h（isolate 内存 `FIREHOL_TTL_MS` = 边缘 `max-age=86400` ✓）、Tor 出口表 6h（`TOR_TTL_MS` = `max-age=21600` ✓）；
  - scamalytics 边缘 dump `max-age=86400` 与稳定区 24h 一致，`loadScamCache` 回灌按 `scamTtl` 判定 ✓；
  - `lastgood` 6h、`UPSTREAM_TTL` 120s 与注释一致 ✓。
- 文件头注释"画像内存缓存6h"同步更新为分层描述。

## 未动项
- VPS 相关逻辑（`SELF_JP_NODE`、`isSelfNodeUnconfigured`、merged 安全阀）未碰。
- L3 精查 key 为空时静默跳过（预期行为，未"修"）。
- SWR 未加独立可观测头（`x-vg-stale`）：3 个调用点 × 2 套 header 构建器，plumbing 回归风险大于灰度期收益；SWR 行为由 T3 覆盖，灰度时看响应耗时验证。

## 主助手验收补强（2026-10-06）
- `APP_VERSION`: 2.0.0 → **2.1.0**（代码注释本身要求"发版时同步修改"；4 账号 `x-vg-version` 一致性核对需要区分 M5/M6 构建）。
- singleflight 单槽 → 按 key 独立建槽（`ipaFlights: Map<key, Promise>`）：修复"不同 IP 集合交错并发时后到的同集合请求挤占槽位、导致重复打上游"的遗漏。新增 `/tmp/test-m6-t5.mjs` 专项验证：A(s1)+B(s2)在途时再来 A'(s1)，上游 batch 调用为 2 次（旧实现为 3 次）。
- `node --check` 与 T1~T5 在补强后全部重跑通过。

## 验证（`/tmp/test-m6.mjs`，全 stub）
| 用例 | 断言要点 | 结果 |
|---|---|---|
| T1 失败不毒化 | 上游全失败 → 200 fail-open 且记 `quality-failopen`；60s 内不重试；61s 后重试成功；成功后按 TTL 缓存 | 通过 |
| T2 singleflight | 两并发 `/sub`（上游延迟 300ms）→ ip-api batch 只打 1 次 | 通过 |
| T3 SWR | 预热后快进 25h，上游延迟 1500ms → 响应 <1200ms 且 200（用旧值）；后台触发 1 次刷新；刷新后不再打上游 | 通过 |
| T4 TTL 分层 | 7h 三者皆新鲜；9h 时 risk40 走 SWR 后台、unknown 走前台、risk0 不刷；25h 时 risk0/40 后台、unknown 前台 | 通过 |
