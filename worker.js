// VPNGate Clean Mihomo — 单文件 Cloudflare Worker（单文件即可直接粘贴部署，无需构建步骤）
// 衍生自 RememberOurPromise/OpenVPNGate4Mihomo (The Unlicense / public domain)
// Authors: @ZJH233-tech & Doubao AI — 新增 IP 纯净度/风险引擎、纯净订阅、VPS 优选配套

const HTML_PAGE = "<!DOCTYPE html>\n<html lang=\"zh-CN\">\n<head>\n<meta charset=\"UTF-8\" />\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n<title>VPNGate 节点浏览器 · OpenVPN → Mihomo</title>\n<link rel=\"icon\" href=\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%230B0F17'/%3E%3Ccircle cx='16' cy='16' r='7' fill='none' stroke='%232DD4BF' stroke-width='2.5'/%3E%3Ccircle cx='16' cy='16' r='2.5' fill='%232DD4BF'/%3E%3C/svg%3E\" />\n<link rel=\"preconnect\" href=\"https://fonts.googleapis.com\" />\n<link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin />\n<link href=\"https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap\" rel=\"stylesheet\" />\n<style>\n  :root{\n    --bg:#0B0F17;\n    --surface:#131A26;\n    --surface-2:#1B2434;\n    --surface-hover:#212C40;\n    --border:#263145;\n    --border-soft:#1B2434;\n    --text:#EAF0F7;\n    --text-muted:#8996AC;\n    --text-faint:#5C6A82;\n    --accent:#2DD4BF;\n    --accent-strong:#14B8A6;\n    --accent-soft:rgba(45,212,191,0.14);\n    --danger:#F87171;\n    --danger-soft:rgba(248,113,113,0.12);\n    --warning:#FBBF24;\n    --proto-tcp:#60A5FA;\n    --tier-fast:#4ADE80;\n    --tier-mid:#FBBF24;\n    --tier-warm:#FB923C;\n    --tier-slow:#F87171;\n    --radius:12px;\n    --radius-sm:7px;\n    --font-display:'Space Grotesk','PingFang SC','Microsoft YaHei',sans-serif;\n    --font-body:-apple-system,BlinkMacSystemFont,'Segoe UI','PingFang SC','Microsoft YaHei',sans-serif;\n    --font-mono:'JetBrains Mono','SFMono-Regular',Consolas,monospace;\n  }\n  *{box-sizing:border-box;}\n  html{background:var(--bg);}\n  html,body{margin:0;padding:0;}\n  body{\n    background:var(--bg);\n    color:var(--text);\n    font-family:var(--font-body);\n    font-size:14px;\n    line-height:1.5;\n    overflow-x:hidden;\n    min-height:100vh;\n    display:flex;\n    flex-direction:column;\n  }\n  a{color:var(--accent);}\n  ::selection{background:var(--accent-soft);}\n\n  /* ---------- topbar ---------- */\n  .topbar{\n    position:sticky;top:0;z-index:30;\n    display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;\n    padding:16px 24px;\n    background:rgba(11,15,23,0.94);\n    backdrop-filter:blur(10px);\n    border-bottom:1px solid var(--border);\n  }\n  .brand{display:flex;align-items:center;gap:12px;}\n  .brand-mark{width:11px;height:11px;border-radius:50%;background:var(--accent);box-shadow:0 0 0 5px var(--accent-soft);flex-shrink:0;}\n  .brand h1{\n    font-family:var(--font-display);font-size:19px;font-weight:600;letter-spacing:-0.01em;margin:0;\n  }\n  .brand p{margin:2px 0 0;font-size:12px;color:var(--text-muted);}\n  .status-cluster{display:flex;align-items:center;gap:14px;font-family:var(--font-mono);font-size:12px;color:var(--text-muted);}\n  .status-cluster .dot-ok{color:var(--tier-fast);}\n  .status-cluster .dot-bad{color:var(--danger);}\n\n  /* ---------- toolbar ---------- */\n  .toolbar{\n    position:fixed;top:65px;left:0;right:0;z-index:29;width:100%;\n    display:flex;flex-wrap:wrap;gap:10px;align-items:center;\n    padding:12px 24px;background:var(--surface);border-bottom:1px solid var(--border);\n  }\n  .toolbar input[type=search],.toolbar select{\n    background:var(--surface-2);border:1px solid var(--border);color:var(--text);\n    padding:8px 12px;border-radius:var(--radius-sm);font-size:13px;font-family:var(--font-body);\n    min-height:34px;\n  }\n  .toolbar input[type=search]{flex:1 1 220px;min-width:160px;}\n  .toolbar select{flex:0 0 auto;}\n  .toolbar input::placeholder{color:var(--text-faint);}\n  .spacer{flex:1;}\n  .count-badge{\n    font-family:var(--font-mono);font-size:12px;color:var(--text-muted);\n    padding:6px 10px;border:1px solid var(--border);border-radius:999px;white-space:nowrap;\n  }\n\n  /* ---------- buttons ---------- */\n  button{font-family:var(--font-body);cursor:pointer;}\n  .btn{\n    background:var(--surface-2);border:1px solid var(--border);color:var(--text);\n    padding:8px 14px;border-radius:var(--radius-sm);font-size:13px;font-weight:500;\n    transition:background .15s,border-color .15s,color .15s;white-space:nowrap;\n  }\n  .btn:hover{background:var(--surface-hover);border-color:var(--accent);}\n  .btn:disabled{opacity:.4;cursor:not-allowed;}\n  .btn:disabled:hover{background:var(--surface-2);border-color:var(--border);}\n  .btn-primary{background:var(--accent);border-color:var(--accent);color:#06201C;font-weight:600;}\n  .btn-primary:hover{background:var(--accent-strong);border-color:var(--accent-strong);}\n  .btn-ghost{background:transparent;}\n  .btn-sm{padding:5px 10px;font-size:12px;}\n  button:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible{\n    outline:2px solid var(--accent);outline-offset:2px;\n  }\n  .icon-btn{\n    background:transparent;border:none;color:var(--text-muted);font-size:20px;line-height:1;\n    padding:4px 8px;border-radius:6px;\n  }\n  .icon-btn:hover{color:var(--text);background:var(--surface-2);}\n\n  /* ---------- main / list ---------- */\n  main{padding:117px 0 12px;max-width:1280px;margin:0 auto;width:100%;flex:1 0 auto;}\n  .banner{\n    margin:16px 24px;padding:12px 16px;border-radius:var(--radius-sm);\n    background:var(--danger-soft);border:1px solid rgba(248,113,113,.35);color:#FFD9D9;font-size:13px;\n  }\n  .empty{margin:60px 24px;text-align:center;color:var(--text-muted);font-size:14px;}\n  .loading-row{margin:24px;color:var(--text-muted);font-family:var(--font-mono);font-size:13px;}\n\n  .table-scroll{\n    overflow-x:auto;\n    width:100vw;\n    margin-left:calc(50% - 50vw);\n    margin-right:calc(50% - 50vw);\n    -webkit-overflow-scrolling:touch;\n  }\n  .table-scroll::-webkit-scrollbar{height:8px;}\n  .table-scroll::-webkit-scrollbar-thumb{background:var(--border);border-radius:4px;}\n  .table-scroll::-webkit-scrollbar-track{background:transparent;}\n\n  .table-head-fixed{\n    position:fixed;left:0;right:0;top:117px;z-index:28;\n    overflow:hidden;background:var(--surface);border-bottom:1px solid var(--border);\n  }\n\n  .row{\n    display:grid;\n    grid-template-columns:\n      minmax(28px,0fr) minmax(58px,0fr) minmax(150px,1.4fr) minmax(100px,0fr) minmax(78px,0fr)\n      minmax(70px,0fr) minmax(120px,0.6fr) minmax(65px,0fr) minmax(110px,0fr)\n      minmax(100px,0fr) minmax(85px,0fr) minmax(240px,2fr) minmax(200px,1.8fr)\n      minmax(70px,0fr) minmax(160px,0fr);\n    align-items:center;gap:0;\n    padding:11px 24px;border-bottom:1px solid var(--border-soft);\n  }\n  .row-head{\n    font-family:var(--font-mono);font-size:10.5px;text-transform:uppercase;letter-spacing:.06em;\n    color:var(--text-faint);background:var(--surface);border-bottom:none;\n  }\n  .row-head .cell{cursor:default;}\n  .row-body:hover{background:var(--surface-2);}\n  .cell{padding:3px 8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;}\n  .cell-country{display:flex;align-items:center;gap:6px;font-family:var(--font-mono);font-size:12.5px;}\n  .cell-host{display:flex;flex-direction:column;gap:2px;min-width:0;}\n  .cell-host .ip{font-family:var(--font-mono);font-size:13px;font-weight:500;overflow:hidden;text-overflow:ellipsis;}\n  .cell-host .hostname{font-size:11px;color:var(--text-faint);overflow:hidden;text-overflow:ellipsis;}\n  .cell-ping{font-family:var(--font-mono);font-size:13px;display:flex;align-items:center;}\n  .cell-score{font-family:var(--font-mono);font-size:12.5px;color:var(--text-muted);}\n  .cell-clean{display:flex;align-items:center;}\n  .q-badge{font-family:var(--font-mono);font-size:11px;font-weight:700;padding:2px 7px;border-radius:5px;border:1px solid currentColor;white-space:nowrap;}\n  .q-badge.q-good{color:var(--tier-fast);background:rgba(74,222,128,.12);}\n  .q-badge.q-mid{color:var(--tier-mid);background:rgba(251,191,36,.12);}\n  .q-badge.q-bad{color:var(--tier-slow);background:rgba(248,113,113,.12);}\n  .q-badge.q-na{color:var(--text-faint);background:transparent;}\n  .cell-sessions,.cell-uptime,.cell-users,.cell-traffic{font-family:var(--font-mono);font-size:12px;color:var(--text-muted);}\n  .cell-operator{font-size:12px;color:var(--text-muted);}\n  .cell-message{font-size:12px;color:var(--text-muted);}\n  .cell-protocol{display:flex;align-items:center;}\n  .cell-actions{display:flex;justify-content:flex-end;align-items:center;gap:6px;}\n\n  .proto-badge{\n    font-family:var(--font-mono);font-size:10px;font-weight:700;\n    padding:3px 6px;border-radius:5px;letter-spacing:.03em;flex-shrink:0;\n    border:1px solid var(--border);color:var(--text-muted);background:var(--surface-2);\n  }\n  .proto-badge.proto-udp{color:var(--warning);border-color:rgba(251,191,36,.4);background:rgba(251,191,36,.12);}\n  .proto-badge.proto-tcp{color:var(--proto-tcp);border-color:rgba(96,165,250,.4);background:rgba(96,165,250,.12);}\n\n  .tier-badge{\n    font-family:var(--font-mono);font-size:11.5px;font-weight:600;\n    padding:2px 7px;border-radius:5px;display:inline-block;border:1px solid currentColor;\n  }\n  .tier-badge.fast{color:var(--tier-fast);background:rgba(74,222,128,.12);}\n  .tier-badge.mid{color:var(--tier-mid);background:rgba(251,191,36,.12);}\n  .tier-badge.warm{color:var(--tier-warm);background:rgba(251,146,60,.12);}\n  .tier-badge.slow{color:var(--tier-slow);background:rgba(248,113,113,.12);}\n\n  .ping-dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:7px;flex-shrink:0;}\n  .ping-dot.fast{background:var(--tier-fast);box-shadow:0 0 7px rgba(74,222,128,.7);}\n  .ping-dot.mid{background:var(--tier-mid);box-shadow:0 0 7px rgba(251,191,36,.6);}\n  .ping-dot.warm{background:var(--tier-warm);box-shadow:0 0 7px rgba(251,146,60,.6);}\n  .ping-dot.slow{background:var(--tier-slow);box-shadow:0 0 7px rgba(248,113,113,.6);}\n\n  .speed-wrap{display:flex;flex-direction:column;gap:4px;width:100%;}\n  .speed-label{font-family:var(--font-mono);font-size:12.5px;}\n  .speed-track{display:block;width:100%;height:5px;background:var(--surface-2);border-radius:3px;overflow:hidden;}\n  .speed-fill{display:block;height:100%;background:linear-gradient(90deg,var(--accent-strong),var(--accent));border-radius:3px;}\n\n  input[type=checkbox]{\n    width:16px;height:16px;accent-color:var(--accent);cursor:pointer;\n  }\n\n  /* ---------- responsive card mode ---------- */\n  @media (max-width:900px){\n    .table-scroll{width:auto;margin-left:0;margin-right:0;}\n    .table-head-fixed{display:none;}\n    .row-body{\n      display:block;margin:12px 16px;padding:14px 16px;\n      border:1px solid var(--border);border-radius:var(--radius);\n    }\n    .row-body .cell{\n      display:flex;justify-content:space-between;align-items:center;gap:12px;\n      white-space:normal;padding:7px 0;border-bottom:1px dashed var(--border-soft);\n    }\n    .row-body .cell:last-child{border-bottom:none;}\n    .row-body .cell::before{\n      content:attr(data-label);font-family:var(--font-mono);font-size:10.5px;color:var(--text-faint);\n      text-transform:uppercase;letter-spacing:.05em;flex-shrink:0;\n    }\n    .cell-checkbox::before,.cell-actions::before{content:'';}\n    .cell-actions{justify-content:flex-end;gap:8px;}\n    .cell-host{align-items:flex-end;text-align:right;}\n    .cell-sessions,.cell-uptime,.cell-users,.cell-traffic{text-align:right;}\n    .speed-wrap{align-items:flex-end;}\n  }\n  @media (max-width:480px){\n    .modal-overlay{padding:10px;}\n    .modal-header,.modal-tabs,.modal-body{padding-left:14px;padding-right:14px;}\n  }\n\n  /* ---------- modal ---------- */\n  .modal-overlay{\n    position:fixed;inset:0;background:rgba(5,8,14,.74);backdrop-filter:blur(3px);\n    display:flex;align-items:center;justify-content:center;z-index:100;padding:20px;\n  }\n  .modal-overlay[hidden]{display:none;}\n  .modal{\n    background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);\n    width:min(780px,100%);max-height:88vh;display:flex;flex-direction:column;overflow:hidden;\n    box-shadow:0 24px 70px rgba(0,0,0,.55);\n  }\n  .modal-header{\n    display:flex;justify-content:space-between;align-items:flex-start;gap:12px;\n    padding:16px 20px;border-bottom:1px solid var(--border);\n  }\n  .modal-header h2{font-family:var(--font-display);font-size:16px;margin:0;font-weight:600;}\n  .modal-header .sub{font-size:12px;color:var(--text-muted);margin-top:3px;font-family:var(--font-mono);}\n  .modal-tabs{display:flex;gap:4px;padding:12px 20px 0;}\n  .tab{background:none;border:none;color:var(--text-muted);padding:8px 14px;border-radius:7px 7px 0 0;font-size:13px;font-weight:500;}\n  .tab.active{color:var(--text);background:var(--bg);}\n  .modal-body{padding:16px 20px 20px;overflow-y:auto;flex:1;}\n  .tab-panel{display:none;}\n  .tab-panel.active{display:block;}\n  .panel-actions{display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap;}\n  textarea{\n    width:100%;min-height:380px;background:var(--bg);color:var(--text);\n    border:1px solid var(--border);border-radius:var(--radius-sm);padding:12px;\n    font-family:var(--font-mono);font-size:12.5px;line-height:1.6;resize:vertical;\n  }\n  .warnings{\n    background:rgba(251,191,36,.08);border:1px solid rgba(251,191,36,.3);color:#FDE4A6;\n    padding:10px 12px;border-radius:var(--radius-sm);font-size:12.5px;margin-bottom:10px;\n  }\n  .warnings[hidden]{display:none;}\n  .warnings ul{margin:4px 0 0;padding-left:18px;}\n\n  /* ---------- footer / toast ---------- */\n  .footer{\n    max-width:1280px;margin:0 auto;padding:16px 24px;color:var(--text-faint);font-size:12px;\n    border-top:1px solid var(--border-soft);width:100%;flex-shrink:0;\n  }\n  .toast-container{position:fixed;bottom:20px;right:20px;display:flex;flex-direction:column;gap:8px;z-index:200;max-width:320px;}\n  .toast{\n    background:var(--surface-2);border:1px solid var(--border);color:var(--text);\n    padding:10px 16px;border-radius:var(--radius-sm);font-size:13px;\n    opacity:0;transform:translateY(8px);transition:opacity .25s ease,transform .25s ease;\n    box-shadow:0 8px 26px rgba(0,0,0,.4);\n  }\n  .toast.show{opacity:1;transform:translateY(0);}\n  .toast-success{border-left:3px solid var(--accent);}\n  .toast-error{border-left:3px solid var(--danger);}\n\n  @media (prefers-reduced-motion:reduce){\n    *{animation:none!important;transition:none!important;}\n  }\n</style>\n</head>\n<body>\n\n<header class=\"topbar\">\n  <div class=\"brand\">\n    <span class=\"brand-mark\"></span>\n    <div>\n      <h1>VPNGate 节点浏览器</h1>\n      <p>OpenVPN 节点列表 · 一键转换为 Mihomo 配置段</p>\n    </div>\n  </div>\n  <div class=\"status-cluster\">\n    <span id=\"statusText\">正在连接 vpngate.net…</span>\n    <button id=\"refreshBtn\" class=\"btn btn-sm\">↻ 刷新</button>\n  </div>\n</header>\n\n<div class=\"toolbar\">\n  <input type=\"search\" id=\"searchInput\" placeholder=\"搜索 主机名 / IP / 国家 / 运营者…\" />\n  <select id=\"countrySelect\"><option value=\"\">全部国家</option></select>\n  <select id=\"sortSelect\">\n    <option value=\"score-desc\">综合评分 · 从高到低</option>\n    <option value=\"ping-asc\">延迟 Ping · 从低到高</option>\n    <option value=\"speed-desc\">速度 · 从高到低</option>\n    <option value=\"numSessions-desc\">在线人数 · 从多到少</option>\n    <option value=\"uptime-desc\">运行时长 · 从长到短</option>\n    <option value=\"clean-desc\">纯净度 · 从高到低</option>\n  </select>\n  <span class=\"spacer\"></span>\n  <span class=\"count-badge\" id=\"countBadge\">0 个节点</span>\n  <button id=\"bulkExportBtn\" class=\"btn\" disabled>批量导出 Mihomo (0)</button>\n</div>\n\n<div class=\"table-head-fixed\" id=\"tableHeadFixed\">\n  <div class=\"row row-head\" id=\"listHead\" hidden>\n    <span class=\"cell cell-checkbox\"><input type=\"checkbox\" id=\"selectAllCheckbox\" title=\"全选当前筛选结果\" /></span>\n    <span class=\"cell\">国家</span>\n    <span class=\"cell\">主机 / IP</span>\n    <span class=\"cell\">评分</span>\n    <span class=\"cell\">纯净度</span>\n    <span class=\"cell\">Ping</span>\n    <span class=\"cell\">速度</span>\n    <span class=\"cell\">在线会话</span>\n    <span class=\"cell\">运行时间</span>\n    <span class=\"cell\">累积用户数</span>\n    <span class=\"cell\">累积流量</span>\n    <span class=\"cell\">运营者</span>\n    <span class=\"cell\">说明</span>\n    <span class=\"cell\">协议</span>\n    <span class=\"cell cell-actions\">操作</span>\n  </div>\n</div>\n\n<main>\n  <div id=\"banner\" class=\"banner\" hidden></div>\n  <div id=\"loadingRow\" class=\"loading-row\">正在获取节点列表…</div>\n\n  <div class=\"table-scroll\" id=\"tableScroll\">\n    <div id=\"list\"></div>\n  </div>\n  <div id=\"emptyState\" class=\"empty\" hidden>没有匹配的节点,试试调整搜索或筛选条件。</div>\n</main>\n\n<footer class=\"footer\">\n  数据来源 <a href=\"https://www.vpngate.net\" target=\"_blank\" rel=\"noopener\">vpngate.net</a>(筑波大学 VPN Gate 学术实验项目,请遵守当地法律法规使用)\n  · Mihomo OpenVPN 字段参考 <a href=\"https://wiki.metacubex.one/config/proxies/openvpn/\" target=\"_blank\" rel=\"noopener\">wiki.metacubex.one</a>\n  · 本工具与上述项目均无官方关联,仅为第三方转换/浏览界面\n</footer>\n\n<!-- 单节点详情弹窗 -->\n<div class=\"modal-overlay\" id=\"modalOverlay\" hidden>\n  <div class=\"modal\">\n    <div class=\"modal-header\">\n      <div>\n        <h2 id=\"modalTitle\">节点详情</h2>\n        <div class=\"sub\" id=\"modalSub\"></div>\n      </div>\n      <button class=\"icon-btn\" id=\"modalClose\" aria-label=\"关闭\">×</button>\n    </div>\n    <div class=\"modal-tabs\">\n      <button class=\"tab active\" data-tab=\"ovpn\">OpenVPN 配置</button>\n      <button class=\"tab\" data-tab=\"mihomo\">Mihomo 配置段</button>\n    </div>\n    <div class=\"modal-body\">\n      <div class=\"tab-panel active\" id=\"tabOvpn\">\n        <div class=\"panel-actions\">\n          <button class=\"btn btn-primary btn-sm\" id=\"copyOvpnBtn\">复制到剪贴板</button>\n          <button class=\"btn btn-sm\" id=\"downloadOvpnBtn\">下载 .ovpn</button>\n        </div>\n        <textarea id=\"ovpnText\" readonly spellcheck=\"false\"></textarea>\n      </div>\n      <div class=\"tab-panel\" id=\"tabMihomo\">\n        <div class=\"warnings\" id=\"mihomoWarnings\" hidden></div>\n        <div class=\"panel-actions\">\n          <button class=\"btn btn-primary btn-sm\" id=\"copyMihomoBtn\">复制到剪贴板</button>\n          <button class=\"btn btn-sm\" id=\"downloadMihomoBtn\">下载 .yaml</button>\n        </div>\n        <textarea id=\"mihomoText\" spellcheck=\"false\"></textarea>\n      </div>\n    </div>\n  </div>\n</div>\n\n<!-- 批量导出弹窗 -->\n<div class=\"modal-overlay\" id=\"bulkModalOverlay\" hidden>\n  <div class=\"modal\">\n    <div class=\"modal-header\">\n      <div>\n        <h2>批量导出 Mihomo 配置</h2>\n        <div class=\"sub\" id=\"bulkSub\"></div>\n      </div>\n      <button class=\"icon-btn\" id=\"bulkModalClose\" aria-label=\"关闭\">×</button>\n    </div>\n    <div class=\"modal-body\">\n      <div class=\"warnings\" id=\"bulkWarnings\" hidden></div>\n      <div class=\"panel-actions\">\n        <button class=\"btn btn-primary btn-sm\" id=\"copyBulkBtn\">复制到剪贴板</button>\n        <button class=\"btn btn-sm\" id=\"downloadBulkBtn\">下载 .yaml</button>\n      </div>\n      <textarea id=\"bulkText\" spellcheck=\"false\"></textarea>\n    </div>\n  </div>\n</div>\n\n<div class=\"toast-container\" id=\"toastContainer\"></div>\n\n<script>\n(function () {\n  'use strict';\n\n  // ==================== 工具函数 ====================\n  function escapeHtml(str) {\n    if (str === null || str === undefined) return '';\n    return String(str)\n      .replace(/&/g, '&amp;')\n      .replace(/</g, '&lt;')\n      .replace(/>/g, '&gt;')\n      .replace(/\"/g, '&quot;')\n      .replace(/'/g, '&#39;');\n  }\n\n  function scrub(v,n){v=String(v==null?'':v);var o='';for(var i=0;i<v.length&&o.length<(n||80);i++){var c=v.charCodeAt(i);o+=(c<32||c===127)?' ':v[i];}return o.replace(/\\s+/g,' ').trim();}\n  function scrubHost(v){return String(v==null?'':v).replace(/[^A-Za-z0-9._:-]/g,'').slice(0,253);}\n  function scrubNum(v,d){var m=String(v==null?'':v).match(/\\d+/);return m?m[0]:d;}\n\n  function flagEmoji(code) {\n    if (!code) return '🌐';\n    const cc = String(code).toUpperCase();\n    if (!/^[A-Z]{2}$/.test(cc)) return '🌐';\n    const points = Array.from(cc).map((c) => 127397 + c.charCodeAt(0));\n    return String.fromCodePoint.apply(String, points);\n  }\n\n  function formatSpeed(bps) {\n    const mbps = bps / 1e6;\n    if (mbps >= 100) return mbps.toFixed(0) + ' Mbps';\n    return mbps.toFixed(1) + ' Mbps';\n  }\n\n  function formatBytes(bytes) {\n    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];\n    let v = Number(bytes) || 0;\n    let i = 0;\n    while (v >= 1024 && i < units.length - 1) {\n      v /= 1024;\n      i++;\n    }\n    return (v >= 100 ? v.toFixed(0) : v.toFixed(1)) + ' ' + units[i];\n  }\n\n  function formatDuration(ms) {\n    const totalMinutes = Math.floor((Number(ms) || 0) / 60000);\n    const days = Math.floor(totalMinutes / 1440);\n    const hours = Math.floor((totalMinutes % 1440) / 60);\n    const minutes = totalMinutes % 60;\n    if (days > 0) return days + ' 天 ' + hours + ' 小时';\n    if (hours > 0) return hours + ' 小时 ' + minutes + ' 分钟';\n    return minutes + ' 分钟';\n  }\n\n  function formatNumber(n) {\n    return Number(n || 0).toLocaleString('zh-CN');\n  }\n\n  function tierOf(v) {\n    const n = Number(v) || 0;\n    if (n < 50) return 'fast';\n    if (n < 100) return 'mid';\n    if (n < 150) return 'warm';\n    return 'slow';\n  }\n\n  function qualityBadge(q) {\n    if (!q) return '<span class=\"q-badge q-na\" title=\"暂无风险数据\">—</span>';\n    var cls = q.grade === 'clean' ? 'q-good' : (q.grade === 'mid' ? 'q-mid' : 'q-bad');\n    var tip = '纯净度' + q.clean + ' / 风险' + q.risk + (q.proxy ? ' · 已知代理' : '') + (q.hosting ? ' · 机房' : '') + (q.mobile ? ' · 移动' : '') + ' · ' + (q.isp || '');\n    return '<span class=\"q-badge ' + cls + '\" title=\"' + escapeHtml(tip) + '\">' + q.clean + '</span>';\n  }\n\n  function keyOf(server) {\n    return server.hostName + '|' + server.ip;\n  }\n\n  function safeDecodeBase64(b64) {\n    try {\n      const cleaned = String(b64 || '').replace(/\\s+/g, '');\n      const binary = atob(cleaned);\n      const bytes = new Uint8Array(binary.length);\n      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);\n      return new TextDecoder('utf-8').decode(bytes);\n    } catch (err) {\n      return '# 无法解码该节点的配置数据: ' + err.message;\n    }\n  }\n\n  // ==================== OpenVPN 配置解析 ====================\n  function parseOvpnConfig(raw) {\n    const lines = raw.split(/\\r\\n|\\r|\\n/);\n    const result = {\n      remoteHost: null, remotePort: null, proto: null,\n      cipher: null, auth: null, compLzo: null, dev: null,\n      ca: null, cert: null, key: null, tlsCrypt: null, tlsAuth: null,\n      keyDirection: null, authUserPass: false, mtu: null,\n      ping: null, pingRestart: null,\n    };\n\n    let block = null;\n    let blockLines = [];\n    const blockTagMap = {\n      '<ca>': 'ca', '</ca>': 'ca',\n      '<cert>': 'cert', '</cert>': 'cert',\n      '<key>': 'key', '</key>': 'key',\n      '<tls-crypt>': 'tlsCrypt', '</tls-crypt>': 'tlsCrypt',\n      '<tls-auth>': 'tlsAuth', '</tls-auth>': 'tlsAuth',\n    };\n\n    for (const rawLine of lines) {\n      const trimmed = rawLine.trim();\n\n      if (Object.prototype.hasOwnProperty.call(blockTagMap, trimmed)) {\n        const isClose = trimmed.indexOf('</') === 0;\n        const key = blockTagMap[trimmed];\n        if (!isClose) {\n          block = key;\n          blockLines = [];\n        } else {\n          result[key] = blockLines.join('\\n').trim();\n          block = null;\n        }\n        continue;\n      }\n\n      if (block) {\n        blockLines.push(rawLine.replace(/\\r$/, ''));\n        continue;\n      }\n\n      if (!trimmed || trimmed.charAt(0) === '#' || trimmed.charAt(0) === ';') continue;\n\n      const spaceIdx = trimmed.indexOf(' ');\n      const directive = (spaceIdx === -1 ? trimmed : trimmed.slice(0, spaceIdx)).toLowerCase();\n      const args = spaceIdx === -1 ? '' : trimmed.slice(spaceIdx + 1).trim();\n\n      switch (directive) {\n        case 'remote': {\n          const p = args.split(/\\s+/);\n          result.remoteHost = p[0];\n          if (p[1]) result.remotePort = p[1];\n          break;\n        }\n        case 'proto': {\n          const p = args.toLowerCase();\n          if (p.indexOf('tcp') === 0) result.proto = 'tcp';\n          else if (p.indexOf('udp') === 0) result.proto = 'udp';\n          break;\n        }\n        case 'port':\n          if (!result.remotePort) result.remotePort = args.trim();\n          break;\n        case 'cipher':\n          result.cipher = args.trim();\n          break;\n        case 'data-ciphers':\n          if (!result.cipher) result.cipher = args.split(':')[0].trim();\n          break;\n        case 'auth':\n          result.auth = args.trim();\n          break;\n        case 'comp-lzo':\n          result.compLzo = args.trim() || 'yes';\n          break;\n        case 'dev':\n        case 'dev-type': {\n          const d = args.toLowerCase();\n          if (d.indexOf('tun') === 0) result.dev = 'tun';\n          else if (d.indexOf('tap') === 0) result.dev = 'tap';\n          break;\n        }\n        case 'key-direction':\n          result.keyDirection = args.trim();\n          break;\n        case 'auth-user-pass':\n          result.authUserPass = true;\n          break;\n        case 'tun-mtu':\n        case 'link-mtu':\n          if (!result.mtu) result.mtu = args.trim();\n          break;\n        case 'ping':\n          result.ping = args.trim();\n          break;\n        case 'ping-restart':\n          result.pingRestart = args.trim();\n          break;\n        case 'keepalive': {\n          // keepalive <ping> <ping-restart> 是 ping/ping-restart 的简写指令\n          const p = args.split(/\\s+/);\n          if (p[0]) result.ping = p[0];\n          if (p[1]) result.pingRestart = p[1];\n          break;\n        }\n        default:\n          break;\n      }\n    }\n    return result;\n  }\n\n  // ==================== Mihomo openvpn 配置段生成 ====================\n  const SUPPORTED_CIPHERS = ['AES-128-GCM', 'AES-256-GCM', 'AES-128-CBC', 'AES-256-CBC', 'CHACHA20-POLY1305'];\n  const SUPPORTED_AUTH = ['MD5', 'SHA1', 'SHA256', 'SHA384', 'SHA512'];\n\n  function yamlQuote(str) {\n    return '\"' + String(str).replace(/\\\\/g, '\\\\\\\\').replace(/\"/g, '\\\\\"') + '\"';\n  }\n\n  function yamlBlock(value, indent) {\n    const pad = ' '.repeat(indent);\n    return String(value).replace(/\\r\\n/g, '\\n').split('\\n').map((l) => pad + l).join('\\n');\n  }\n\n  function buildMihomoProxySegment(server, parsed) {\n    const warnings = [];\n    const lines = [];\n    const name = `VPNGate-${scrub(server.countryShort || '??', 4)}-${scrubHost(server.ip)}`;\n\n    lines.push(`- name: ${yamlQuote(name)}`);\n    lines.push(`  type: openvpn`);\n    lines.push(`  server: ${scrubHost(parsed.remoteHost || server.ip)}`);\n    lines.push(`  port: ${scrubNum(parsed.remotePort, 1194)}`);\n\n    const proto = parsed.proto || 'udp';\n    lines.push(`  proto: ${proto}`);\n    // 注意: 这里的 udp 和上面的 proto 是两个完全不同的字段。\n    // proto 指隧道本身连接服务器所用的传输协议(对应 .ovpn 里的 proto 指令);\n    // udp 是 mihomo 所有代理类型通用的字段,表示\"是否允许 UDP 应用流量(DNS/游戏/QUIC等)通过该节点转发\"。\n    // OpenVPN 建立的是完整的 TUN 隧道,一旦连接建立,不论 proto 是 tcp 还是 udp,隧道内都能正常承载 UDP 应用流量,\n    // 因此这里恒为 true,不应跟随 proto 变化(这是早前版本的一个错误,已修正)。\n    lines.push(`  udp: true`);\n\n    if (parsed.authUserPass) {\n      lines.push(`  # 该配置需要用户名/密码认证 (auth-user-pass),请自行填写凭据`);\n      lines.push(`  # username: \"your-username\"`);\n      lines.push(`  # password: \"your-password\"`);\n    }\n\n    if (parsed.cipher) {\n      if (SUPPORTED_CIPHERS.indexOf(parsed.cipher.toUpperCase()) === -1) {\n        warnings.push(`原始 cipher \"${parsed.cipher}\" 不在 mihomo 已知支持列表(${SUPPORTED_CIPHERS.join('/')})中,请留意兼容性`);\n      }\n      lines.push(`  cipher: ${scrub(parsed.cipher, 40)}`);\n    }\n    if (parsed.auth) {\n      if (SUPPORTED_AUTH.indexOf(parsed.auth.toUpperCase()) === -1) {\n        warnings.push(`原始 auth \"${parsed.auth}\" 不在 mihomo 已知支持列表(${SUPPORTED_AUTH.join('/')})中,请留意兼容性`);\n      }\n      lines.push(`  auth: ${scrub(parsed.auth, 20)}`);\n    }\n\n    if (parsed.ca) {\n      lines.push(`  ca: |`);\n      lines.push(yamlBlock(parsed.ca, 4));\n    } else {\n      warnings.push('未在原始配置中找到 <ca> 证书块,而 mihomo 要求必须提供 ca 字段,请检查该节点配置');\n    }\n\n    if (parsed.cert) {\n      lines.push(`  cert: |`);\n      lines.push(yamlBlock(parsed.cert, 4));\n    }\n    if (parsed.key) {\n      lines.push(`  key: |`);\n      lines.push(yamlBlock(parsed.key, 4));\n    }\n    if (!parsed.cert && !parsed.key && !parsed.authUserPass) {\n      warnings.push('未找到客户端证书(cert/key),也未启用 auth-user-pass,请确认该节点的认证方式');\n    }\n\n    if (parsed.tlsCrypt) {\n      lines.push(`  tls-crypt: |`);\n      lines.push(yamlBlock(parsed.tlsCrypt, 4));\n    } else if (parsed.tlsAuth) {\n      lines.push(`  # 注意: 原配置使用的是 tls-auth(独立 HMAC 签名密钥${parsed.keyDirection ? ', key-direction ' + parsed.keyDirection : ''}),而非 tls-crypt`);\n      lines.push(`  # mihomo 文档目前只公开 tls-crypt 字段,以下为尽力映射,如连接异常请对照最新 mihomo 文档核实`);\n      lines.push(`  tls-crypt: |`);\n      lines.push(yamlBlock(parsed.tlsAuth, 4));\n      warnings.push('原始配置使用 tls-auth 而非 tls-crypt,已尽力映射,请手动确认兼容性');\n    }\n\n    if (parsed.compLzo) {\n      lines.push(`  comp-lzo: ${/^(yes|no|adaptive)$/i.test(parsed.compLzo) ? parsed.compLzo : 'yes'}`);\n    }\n\n    const dev = parsed.dev || 'tun';\n    if (dev === 'tap') {\n      warnings.push('原始配置使用 dev tap(二层网桥模式),mihomo 目前仅支持 tun,该节点可能无法通过 mihomo 使用');\n    }\n    // dev 字段不再写入配置: mihomo 只支持 tun 且这本身就是默认值,显式声明没有意义\n\n    if (parsed.mtu) lines.push(`  mtu: ${scrubNum(parsed.mtu, 1500)}`);\n    if (parsed.ping) lines.push(`  ping: ${scrubNum(parsed.ping, 10)}`);\n    if (parsed.pingRestart) lines.push(`  ping-restart: ${scrubNum(parsed.pingRestart, 60)}`);\n\n    return { yaml: lines.join('\\n'), warnings, name };\n  }\n\n  // ==================== 应用状态 ====================\n  const state = {\n    servers: [],\n    filtered: [],\n    search: '',\n    country: '',\n    sortValue: 'score-desc',\n    selected: new Set(),\n    updatedAt: null,\n  };\n\n  const el = (id) => document.getElementById(id);\n\n  // ==================== 数据获取 ====================\n  function vpnGateRefreshQS() {\n      var t = prompt('强制刷新需要 token（部署者在 CONFIG.SUB_AUTH_TOKEN 中设置），取消则改为普通刷新：');\n      return t ? '?refresh=1&token=' + encodeURIComponent(t) : '';\n    }\n    async function fetchServers(force) {\n    el('refreshBtn').disabled = true;\n    el('statusText').textContent = force ? '正在强制刷新…' : '正在连接 vpngate.net…';\n    hideBanner();\n    try {\n      const res = await fetch('/api/servers' + (force ? vpnGateRefreshQS() : ''), { cache: 'no-store' });\n      const data = await res.json();\n      if (!res.ok || data.error) {\n        throw new Error(data.message || ('HTTP ' + res.status));\n      }\n      state.servers = (data.servers || []).map((s) => {\n        try {\n          const raw = safeDecodeBase64(s.configDataBase64);\n          s.detectedProto = parseOvpnConfig(raw).proto || 'udp';\n        } catch (err) {\n          s.detectedProto = 'udp';\n        }\n        return s;\n      });\n      state.updatedAt = data.updatedAt;\n      state.selected.clear();\n      populateCountryOptions();\n      applyFiltersAndRender();\n      const timeStr = state.updatedAt ? new Date(state.updatedAt).toLocaleString('zh-CN') : '未知';\n      el('statusText').innerHTML = '<span class=\"dot-ok\">●</span> 已连接 · 共 ' + state.servers.length + ' 个节点 · 更新于 ' + escapeHtml(timeStr);\n      el('loadingRow').hidden = true;\n      el('listHead').hidden = state.servers.length === 0;\n    } catch (err) {\n      el('statusText').innerHTML = '<span class=\"dot-bad\">●</span> 连接失败';\n      el('loadingRow').hidden = true;\n      showBanner('无法获取 vpngate.net 的节点列表: ' + escapeHtml(err.message) + '。这可能是网络问题或该站点暂时无法访问,请稍后点击右上角\"刷新\"重试。');\n    } finally {\n      el('refreshBtn').disabled = false;\n      updateFixedOffsets();\n    }\n  }\n\n  function showBanner(html) {\n    const b = el('banner');\n    b.innerHTML = html;\n    b.hidden = false;\n  }\n  function hideBanner() {\n    el('banner').hidden = true;\n  }\n\n  // ==================== 筛选 / 排序 / 渲染 ====================\n  function populateCountryOptions() {\n    const counts = new Map();\n    state.servers.forEach((s) => {\n      const key = s.countryShort || '??';\n      const cur = counts.get(key) || { label: s.countryLong || key, count: 0 };\n      cur.count++;\n      counts.set(key, cur);\n    });\n    const entries = Array.from(counts.entries()).sort((a, b) => a[1].label.localeCompare(b[1].label));\n    const select = el('countrySelect');\n    const prevValue = select.value;\n    select.innerHTML = '<option value=\"\">全部国家 (' + state.servers.length + ')</option>';\n    entries.forEach(([code, info]) => {\n      const opt = document.createElement('option');\n      opt.value = code;\n      opt.textContent = flagEmoji(code) + ' ' + info.label + ' (' + info.count + ')';\n      select.appendChild(opt);\n    });\n    select.value = prevValue && counts.has(prevValue) ? prevValue : '';\n    state.country = select.value;\n  }\n\n  function applyFiltersAndRender() {\n    const q = state.search.trim().toLowerCase();\n    let list = state.servers.filter((s) => {\n      if (state.country && s.countryShort !== state.country) return false;\n      if (!q) return true;\n      return (\n        (s.hostName || '').toLowerCase().indexOf(q) !== -1 ||\n        (s.ip || '').toLowerCase().indexOf(q) !== -1 ||\n        (s.countryLong || '').toLowerCase().indexOf(q) !== -1 ||\n        (s.countryShort || '').toLowerCase().indexOf(q) !== -1 ||\n        (s.operator || '').toLowerCase().indexOf(q) !== -1\n      );\n    });\n\n    const [sortKey, sortDir] = state.sortValue.split('-');\n    const dir = sortDir === 'asc' ? 1 : -1;\n    list = list.slice().sort((a, b) => {\n      const qv=(x)=>sortKey==='clean'?(Number(x.quality&&x.quality.clean)||0):(Number(x[sortKey])||0);\n      const ka = qv(a);\n      const kb = qv(b);\n      if (ka < kb) return -1 * dir;\n      if (ka > kb) return 1 * dir;\n      return 0;\n    });\n\n    state.filtered = list;\n    renderList();\n    updateCounts();\n  }\n\n  function renderList() {\n    const html = state.filtered.map((s) => renderRow(s)).join('');\n    el('list').innerHTML = html;\n    el('emptyState').hidden = state.filtered.length !== 0;\n  }\n\n  const SPEED_BAR_MAX_MBPS = 1000; // 速度条固定刻度: 0-1000 Mbps,超过按满格显示\n  function speedBarPercent(bps) {\n    const mbps = (Number(bps) || 0) / 1e6;\n    return Math.max(2, Math.min(100, Math.round((mbps / SPEED_BAR_MAX_MBPS) * 100)));\n  }\n\n  function renderRow(s) {\n    const k = keyOf(s);\n    const checked = state.selected.has(k) ? 'checked' : '';\n    const pingTierName = tierOf(s.ping);\n    const sessionsTierName = tierOf(s.numSessions);\n    const speedPct = speedBarPercent(s.speed);\n    const hostSafe = escapeHtml(s.hostName);\n    const ipSafe = escapeHtml(s.ip);\n    const opSafe = escapeHtml(s.operator || '—');\n    const msgSafe = escapeHtml(s.message || '—');\n    const countryLabel = escapeHtml(s.countryLong || s.countryShort || '未知');\n    const proto = (s.detectedProto === 'tcp') ? 'tcp' : 'udp';\n\n    return (\n      '<div class=\"row row-body\" data-key=\"' + escapeHtml(k) + '\">' +\n        '<span class=\"cell cell-checkbox\"><input type=\"checkbox\" class=\"row-check\" data-key=\"' + escapeHtml(k) + '\" ' + checked + ' /></span>' +\n        '<span class=\"cell cell-country\" data-label=\"国家\" title=\"' + countryLabel + '\">' + flagEmoji(s.countryShort) + ' ' + escapeHtml(s.countryShort || '??') + '</span>' +\n        '<span class=\"cell cell-host\" data-label=\"主机/IP\">' +\n          '<span class=\"ip\">' + ipSafe + '</span>' +\n          '<span class=\"hostname\">' + hostSafe + '</span>' +\n        '</span>' +\n        '<span class=\"cell cell-score\" data-label=\"评分\">' + formatNumber(s.score) + '</span>' +\n        '<span class=\"cell cell-clean\" data-label=\"纯净度\">' + qualityBadge(s.quality) + '</span>' +\n        '<span class=\"cell cell-ping\" data-label=\"Ping\"><span class=\"ping-dot ' + pingTierName + '\"></span>' + formatNumber(s.ping) + ' ms</span>' +\n        '<span class=\"cell\" data-label=\"速度\">' +\n          '<span class=\"speed-wrap\">' +\n            '<span class=\"speed-label\">' + formatSpeed(s.speed) + '</span>' +\n            '<span class=\"speed-track\"><span class=\"speed-fill\" style=\"width:' + speedPct + '%\"></span></span>' +\n          '</span>' +\n        '</span>' +\n        '<span class=\"cell cell-sessions\" data-label=\"在线会话\"><span class=\"tier-badge ' + sessionsTierName + '\">' + formatNumber(s.numSessions) + '</span></span>' +\n        '<span class=\"cell cell-uptime\" data-label=\"运行时间\">' + formatDuration(s.uptime) + '</span>' +\n        '<span class=\"cell cell-users\" data-label=\"累积用户数\">' + formatNumber(s.totalUsers) + '</span>' +\n        '<span class=\"cell cell-traffic\" data-label=\"累积流量\">' + formatBytes(s.totalTraffic) + '</span>' +\n        '<span class=\"cell cell-operator\" data-label=\"运营者\" title=\"' + opSafe + '\">' + opSafe + '</span>' +\n        '<span class=\"cell cell-message\" data-label=\"说明\" title=\"' + msgSafe + '\">' + msgSafe + '</span>' +\n        '<span class=\"cell cell-protocol\" data-label=\"协议\"><span class=\"proto-badge proto-' + proto + '\">' + proto.toUpperCase() + '</span></span>' +\n        '<span class=\"cell cell-actions\" data-label=\"\">' +\n          '<button class=\"btn btn-sm view-ovpn-btn\" data-key=\"' + escapeHtml(k) + '\">OpenVPN</button>' +\n          '<button class=\"btn btn-sm view-mihomo-btn\" data-key=\"' + escapeHtml(k) + '\">Mihomo</button>' +\n        '</span>' +\n      '</div>'\n    );\n  }\n\n  function updateCounts() {\n    el('countBadge').textContent = state.filtered.length + ' 个节点' + (state.filtered.length !== state.servers.length ? ' (共 ' + state.servers.length + ')' : '');\n    const selCount = state.selected.size;\n    const bulkBtn = el('bulkExportBtn');\n    bulkBtn.textContent = '批量导出 Mihomo (' + selCount + ')';\n    bulkBtn.disabled = selCount === 0;\n\n    const allChecked = state.filtered.length > 0 && state.filtered.every((s) => state.selected.has(keyOf(s)));\n    el('selectAllCheckbox').checked = allChecked;\n  }\n\n  // ==================== 弹窗:节点详情 ====================\n  function showModal(id) {\n    el(id).hidden = false;\n  }\n  function hideModal(id) {\n    el(id).hidden = true;\n  }\n\n  function renderWarnings(targetId, warnings) {\n    const box = el(targetId);\n    if (!warnings || warnings.length === 0) {\n      box.hidden = true;\n      box.innerHTML = '';\n      return;\n    }\n    box.hidden = false;\n    box.innerHTML = '⚠️ 转换提示<ul>' + warnings.map((w) => '<li>' + escapeHtml(w) + '</li>').join('') + '</ul>';\n  }\n\n  function openDetailModal(server, initialTab) {\n    const raw = safeDecodeBase64(server.configDataBase64);\n    const parsed = parseOvpnConfig(raw);\n    const { yaml, warnings } = buildMihomoProxySegment(server, parsed);\n\n    el('modalTitle').textContent = flagEmoji(server.countryShort) + ' ' + (server.countryLong || server.countryShort || '未知地区');\n    el('modalSub').textContent = server.hostName + ' · ' + server.ip;\n\n    el('ovpnText').value = raw;\n    el('mihomoText').value = yamlBlock(yaml, 2);\n    renderWarnings('mihomoWarnings', warnings);\n\n    switchTab(initialTab || 'ovpn');\n    showModal('modalOverlay');\n  }\n\n  function switchTab(tab) {\n    document.querySelectorAll('#modalOverlay .tab').forEach((btn) => {\n      btn.classList.toggle('active', btn.getAttribute('data-tab') === tab);\n    });\n    el('tabOvpn').classList.toggle('active', tab === 'ovpn');\n    el('tabMihomo').classList.toggle('active', tab === 'mihomo');\n  }\n\n  // ==================== 每国择优(L1: 非 JP 每国各 1 个, 对齐后端 /sub?mode=merged) ====================\n  function perCountryPick() {\n    const MIN_SPEED = 2 * 1e6, MAX_PING = 300, MIN_CLEAN = 15, MAXC = 20;\n    const cand = [];\n    for (const s of state.servers) {\n      const cc = (s.countryShort || '').toUpperCase();\n      if (!cc || cc === 'JP') continue;\n      if (s.speed && s.speed < MIN_SPEED) continue;\n      if (s.ping > 0 && s.ping > MAX_PING) continue;\n      if (s.quality && s.quality.clean < MIN_CLEAN) continue;\n      let p = null;\n      try { p = parseOvpnConfig(safeDecodeBase64(s.configDataBase64)); } catch (e) { p = null; }\n      if (!p || !p.ca) continue;\n      cand.push(s);\n    }\n    const pv = (x) => (x.ping > 0 ? x.ping : 99999);\n    const cv = (x) => (x.quality ? Number(x.quality.clean) || 0 : 50);\n    cand.sort((a, b) => b.score - a.score || pv(a) - pv(b) || b.speed - a.speed || cv(b) - cv(a));\n    const byCc = new Map(), seenIp = new Set();\n    for (const s of cand) {\n      const cc = (s.countryShort || '').toUpperCase();\n      if (byCc.has(cc) || seenIp.has(s.ip)) continue;\n      byCc.set(cc, s); seenIp.add(s.ip);\n    }\n    let arr = Array.from(byCc.values());\n    arr.sort((a, b) => b.score - a.score || b.speed - a.speed || pv(a) - pv(b));\n    return arr.slice(0, MAXC);\n  }\n\n  function applyPerCountry() {\n    const pick = perCountryPick();\n    if (!pick.length) { showToast('当前没有符合 L1 宽松条件的其他国家节点', 'error'); return; }\n    state.search = ''; el('searchInput').value = '';\n    el('countrySelect').value = ''; state.country = '';\n    state.selected.clear();\n    pick.forEach((s) => state.selected.add(keyOf(s)));\n    applyFiltersAndRender();\n    showToast('已为 ' + pick.length + ' 个国家各选 1 个最优节点(L1 宽松)', 'success');\n    openBulkModal();\n  }\n\n  // ==================== 弹窗:批量导出 ====================\n  function openBulkModal() {\n    const selectedServers = state.servers.filter((s) => state.selected.has(keyOf(s)));\n    if (selectedServers.length === 0) {\n      showToast('请先勾选至少一个节点', 'error');\n      return;\n    }\n    const allWarnings = [];\n    const segments = selectedServers.map((s) => {\n      const raw = safeDecodeBase64(s.configDataBase64);\n      const parsed = parseOvpnConfig(raw);\n      const { yaml, warnings } = buildMihomoProxySegment(s, parsed);\n      warnings.forEach((w) => allWarnings.push('[' + s.countryShort + ' ' + s.ip + '] ' + w));\n      return yaml;\n    });\n    const full = 'proxies:\\n' + segments.map((seg) => yamlBlock(seg, 2)).join('\\n');\n    el('bulkSub').textContent = '已选 ' + selectedServers.length + ' 个节点';\n    el('bulkText').value = full;\n    renderWarnings('bulkWarnings', allWarnings);\n    showModal('bulkModalOverlay');\n  }\n\n  // ==================== 剪贴板 / 下载 / 提示 ====================\n  function legacyCopy(text) {\n    const ta = document.createElement('textarea');\n    ta.value = text;\n    ta.style.position = 'fixed';\n    ta.style.opacity = '0';\n    document.body.appendChild(ta);\n    ta.focus();\n    ta.select();\n    document.execCommand('copy');\n    document.body.removeChild(ta);\n  }\n\n  async function copyText(text, successMsg) {\n    try {\n      if (navigator.clipboard && window.isSecureContext) {\n        await navigator.clipboard.writeText(text);\n      } else {\n        legacyCopy(text);\n      }\n      showToast(successMsg || '已复制到剪贴板', 'success');\n    } catch (err) {\n      try {\n        legacyCopy(text);\n        showToast(successMsg || '已复制到剪贴板', 'success');\n      } catch (err2) {\n        showToast('复制失败,请手动选择文本复制', 'error');\n      }\n    }\n  }\n\n  function downloadText(filename, text) {\n    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });\n    const url = URL.createObjectURL(blob);\n    const a = document.createElement('a');\n    a.href = url;\n    a.download = filename;\n    document.body.appendChild(a);\n    a.click();\n    document.body.removeChild(a);\n    setTimeout(() => URL.revokeObjectURL(url), 1000);\n    showToast('已下载 ' + filename, 'success');\n  }\n\n  function showToast(msg, type) {\n    const container = el('toastContainer');\n    const item = document.createElement('div');\n    item.className = 'toast ' + (type === 'error' ? 'toast-error' : 'toast-success');\n    item.textContent = msg;\n    container.appendChild(item);\n    requestAnimationFrame(() => item.classList.add('show'));\n    setTimeout(() => {\n      item.classList.remove('show');\n      setTimeout(() => item.remove(), 300);\n    }, 2800);\n  }\n\n  // ==================== 事件绑定 ====================\n  function wireEvents() {\n    el('refreshBtn').addEventListener('click', () => fetchServers(true));\n\n    el('searchInput').addEventListener('input', (e) => {\n      state.search = e.target.value;\n      applyFiltersAndRender();\n    });\n    el('countrySelect').addEventListener('change', (e) => {\n      state.country = e.target.value;\n      applyFiltersAndRender();\n    });\n    el('sortSelect').addEventListener('change', (e) => {\n      state.sortValue = e.target.value;\n      applyFiltersAndRender();\n    });\n\n    el('selectAllCheckbox').addEventListener('change', (e) => {\n      if (e.target.checked) {\n        state.filtered.forEach((s) => state.selected.add(keyOf(s)));\n      } else {\n        state.filtered.forEach((s) => state.selected.delete(keyOf(s)));\n      }\n      renderList();\n      updateCounts();\n    });\n\n    (function () {\n      const btn = document.createElement('button');\n      btn.id = 'perCountryBtn';\n      btn.className = 'btn';\n      btn.title = '按 L1 宽松标准, 为除日本外每个国家各选 1 个最优节点并打开导出';\n      btn.textContent = '每国择优';\n      const bulk = el('bulkExportBtn');\n      if (bulk && bulk.parentNode) bulk.parentNode.insertBefore(btn, bulk);\n      btn.addEventListener('click', applyPerCountry);\n    })();\n    el('bulkExportBtn').addEventListener('click', openBulkModal);\n\n    // 事件委托: 行内 checkbox 与 \"查看配置\" 按钮\n    el('list').addEventListener('change', (e) => {\n      if (e.target.classList.contains('row-check')) {\n        const k = e.target.getAttribute('data-key');\n        if (e.target.checked) state.selected.add(k);\n        else state.selected.delete(k);\n        updateCounts();\n      }\n    });\n    el('list').addEventListener('click', (e) => {\n      const ovpnBtn = e.target.closest('.view-ovpn-btn');\n      const mihomoBtn = e.target.closest('.view-mihomo-btn');\n      const btn = ovpnBtn || mihomoBtn;\n      if (!btn) return;\n      const k = btn.getAttribute('data-key');\n      const server = state.servers.find((s) => keyOf(s) === k);\n      if (server) openDetailModal(server, mihomoBtn ? 'mihomo' : 'ovpn');\n    });\n\n    // 详情弹窗\n    el('modalClose').addEventListener('click', () => hideModal('modalOverlay'));\n    el('modalOverlay').addEventListener('click', (e) => {\n      if (e.target.id === 'modalOverlay') hideModal('modalOverlay');\n    });\n    document.querySelectorAll('#modalOverlay .tab').forEach((btn) => {\n      btn.addEventListener('click', () => switchTab(btn.getAttribute('data-tab')));\n    });\n    el('copyOvpnBtn').addEventListener('click', () => copyText(el('ovpnText').value, 'OpenVPN 配置已复制'));\n    el('downloadOvpnBtn').addEventListener('click', () => {\n      const name = (el('modalSub').textContent || 'vpngate').replace(/[^\\w.\\-]+/g, '_');\n      downloadText(name + '.ovpn', el('ovpnText').value);\n    });\n    el('copyMihomoBtn').addEventListener('click', () => copyText(el('mihomoText').value, 'Mihomo 配置段已复制'));\n    el('downloadMihomoBtn').addEventListener('click', () => {\n      const name = (el('modalSub').textContent || 'vpngate').replace(/[^\\w.\\-]+/g, '_');\n      downloadText(name + '.mihomo.yaml', el('mihomoText').value);\n    });\n\n    // 批量弹窗\n    el('bulkModalClose').addEventListener('click', () => hideModal('bulkModalOverlay'));\n    el('bulkModalOverlay').addEventListener('click', (e) => {\n      if (e.target.id === 'bulkModalOverlay') hideModal('bulkModalOverlay');\n    });\n    el('copyBulkBtn').addEventListener('click', () => copyText(el('bulkText').value, '已复制 ' + state.selected.size + ' 个节点的 Mihomo 配置'));\n    el('downloadBulkBtn').addEventListener('click', () => downloadText('vpngate-mihomo-proxies.yaml', el('bulkText').value));\n\n    document.addEventListener('keydown', (e) => {\n      if (e.key === 'Escape') {\n        hideModal('modalOverlay');\n        hideModal('bulkModalOverlay');\n      }\n    });\n\n    // 横向滚动同步: 固定表头随数据区域的横向滚动一起移动\n    el('tableScroll').addEventListener(\n      'scroll',\n      () => {\n        el('tableHeadFixed').scrollLeft = el('tableScroll').scrollLeft;\n      },\n      { passive: true }\n    );\n  }\n\n  // ==================== 固定定位布局: 动态测量高度,而不是写死像素值 ====================\n  function updateFixedOffsets() {\n    const topbarEl = document.querySelector('.topbar');\n    const toolbarEl = document.querySelector('.toolbar');\n    const headFixedEl = el('tableHeadFixed');\n    const mainEl = document.querySelector('main');\n    if (!topbarEl || !toolbarEl || !headFixedEl || !mainEl) return;\n\n    const topbarH = topbarEl.offsetHeight;\n    toolbarEl.style.top = topbarH + 'px';\n\n    const toolbarH = toolbarEl.offsetHeight;\n    headFixedEl.style.top = (topbarH + toolbarH) + 'px';\n\n    const headFixedVisible = getComputedStyle(headFixedEl).display !== 'none';\n    const headFixedH = headFixedVisible ? headFixedEl.offsetHeight : 0;\n\n    mainEl.style.paddingTop = (toolbarH + headFixedH) + 'px';\n  }\n\n  function setupFixedOffsetWatchers() {\n    updateFixedOffsets();\n    window.addEventListener('resize', updateFixedOffsets);\n    if (typeof ResizeObserver !== 'undefined') {\n      const ro = new ResizeObserver(() => updateFixedOffsets());\n      ro.observe(document.querySelector('.topbar'));\n      ro.observe(document.querySelector('.toolbar'));\n      ro.observe(el('listHead'));\n    }\n  }\n\n  wireEvents();\n  setupFixedOffsetWatchers();\n  fetchServers(false);\n})();\n</script>\n</body>\n</html>\n";

// ============================================================
// 端点：
//   /  /index.html   节点浏览器（表格含“纯净度”列，单节点/批量转 Mihomo）
//   /api/servers     实时节点 JSON（边缘缓存；每节点附 quality 风险画像）
//   /sub /mihomo /clash /subscribe   输出完整可直接订阅的 Mihomo 配置
//       参数: n=1..30(默认8)  cc=国家码  proto=tcp|udp|any(默认tcp)
//             sort=score|speed|ping|clean(默认score)  min=最低Mbps(默认3)
//             clean=1(只留非代理/非机房且clean>=50)  maxrisk=0..100 风险上限
//             name=选择组名  refresh=1&token=xxx(绕过缓存，需 CONFIG.SUB_AUTH_TOKEN 鉴权)
//             interval=1..24(订阅刷新周期小时数，默认 6)  shard=0..3(4 账号并联分片)
// 质量源: ip-api.com 批量接口；画像内存缓存分层 8h/24h（M6 F4）；抓取失败只记 60s 负缓存（M6 F1）；
//          过期画像 SWR：先用旧值保订阅可用，后台异步刷新（M6 F3）；画像源故障时 clean=1 自动降级 fail-open，不阻断出节点
// ============================================================
const VPNGATE_API_URL = 'https://www.vpngate.net/api/iphone/';
const UPSTREAM_TTL = 120; // 上游列表边缘缓存 2 分钟，兼顾实时性与响应速度

// ============================================================
// 部署期配置集中块（重构 M1：单文件部署形态保持不变）
//   4 账号并联时，每份部署的差异项（ACCOUNT_TAG / SHARD_ID / SUB_AUTH_TOKEN / 画像 key）
//   推荐在 Cloudflare Dashboard → Worker → Settings → Variables 中设置（密钥用加密 Secret）：
//   代码保持干净版本直接粘贴，控制台的值自动覆盖本块默认值，更新代码不再覆盖密钥（M6.1）。
//   直接改本块仍兼容，作为控制台未设置时的默认值。不引入 KV / D1 依赖。
// ============================================================
const CONFIG = {
  APP_VERSION: '2.1.1',           // 4 副本必须一致；发版时同步修改（x-vg-version 头核对用）
  ACCOUNT_TAG: 'A',              // 本账号标识 A/B/C/D（溯源用）
  SHARD_ID: 0,                   // 本账号分片 0..SHARD_TOTAL-1（M2 ?shard= 参数配合客户端 4 provider 合并）
  SHARD_TOTAL: 4,                // 分片总数
  SUB_AUTH_TOKEN: '',            // ?refresh=1 鉴权 token；为空=强制刷新默认关闭（U-2，防 4 账号额度放大器）
  ABUSEIPDB_KEY: '',             // M4 画像 L3 精查 key；为空=该源禁用
  PROXYCHECK_KEY: '',            // M4 画像 L3 精查 key；为空=该源禁用
  PROFILE_UPDATE_INTERVAL: 6,    // 小时；profile-update-interval 默认值（U-1：12→6）
  PREFILTER_CAP: 60,             // M2：/sub 画像候选上限（把 ip-api 批量笔数压到 ≤1）
  FETCH_TIMEOUT_UPSTREAM: 8000,  // ms；vpngate.net 拉取超时（S-1）
  FETCH_TIMEOUT_IPAPI: 5000,     // ms；ip-api 批量超时（S-1）
  FETCH_TIMEOUT_SCAM: 3000,      // ms；scamalytics 抓取超时（S-1）
};

// ------------------------------------------------------------
// M6.1：控制台变量/密钥覆盖。
//   在 Cloudflare Dashboard → Worker → Settings → Variables 中设置同名变量（文本）或密钥（加密），
//   部署的代码无需再手填 CONFIG；以后更新代码直接粘贴干净版本，密钥不再被覆盖。
//   可覆盖项：ACCOUNT_TAG / SHARD_ID / SUB_AUTH_TOKEN / ABUSEIPDB_KEY / PROXYCHECK_KEY
//   说明：env 在同一个 Worker 部署内对所有请求恒定，因此只在首次请求时合并一次（幂等，并发安全）。
// ------------------------------------------------------------
let __envMerged = false;
function mergeEnvOverrides(env) {
  if (__envMerged) return;
  __envMerged = true; // 先置位：即使 env 为空也只执行一次
  if (!env) return;
  const str = (v) => (v === undefined || v === null ? '' : String(v));
  if (str(env.ACCOUNT_TAG).trim() !== '') CONFIG.ACCOUNT_TAG = str(env.ACCOUNT_TAG).trim();
  if (str(env.SHARD_ID).trim() !== '') {
    const n = parseInt(str(env.SHARD_ID).trim(), 10);
    if (Number.isFinite(n)) CONFIG.SHARD_ID = n;
  }
  for (const k of ['SUB_AUTH_TOKEN', 'ABUSEIPDB_KEY', 'PROXYCHECK_KEY']) {
    if (str(env[k]).trim() !== '') CONFIG[k] = str(env[k]); // 密钥原文保留，使用处自行 trim
  }
}

// ============================================================
// 合并订阅(?mode=merged)专用：自建「日本承载IP落地」VLESS-Reality 节点
//   该节点落在 VPS 本机出口 IP(承载IP)，不经过 VPNGate tun0 住宅落地
// ⚠️ 私有参数请自行填写后再部署,切勿把真实 IP/UUID/密钥提交到公开仓库
// ============================================================
const SELF_JP_NODE = {
  name: '日本-自建承载落地',
  server: 'YOUR_SERVER_IP',
  port: 443,
  uuid: 'YOUR_UUID',
  network: 'tcp',
  flow: 'xtls-rprx-vision',
  sni: 'www.ibm.com',
  pbk: 'YOUR_REALITY_PUBLIC_KEY',
  sid: 'YOUR_REALITY_SHORT_ID',
  fp: 'chrome',
};
const PER_COUNTRY_MAX = 20;   // 非日本国家最多各取 1 个的国家数上限
const L1_MIN_CLEAN = 15;      // L1 宽松: 仅当“有画像且 clean<15(极脏)”才剔除; 无画像保留
const OTHER_MIN_SPEED = 2;    // 其他国家默认最低速度 Mbps
const OTHER_MAX_PING = 300;   // 其他国家默认最大延迟 ms

// M-2：自建节点是否仍是占位符（未配置）。true=若下发则为 broken 订阅，必须显式禁用/报错
function isSelfNodeUnconfigured() {
  return !SELF_JP_NODE || SELF_JP_NODE.server === 'YOUR_SERVER_IP';
}

export default {
  async fetch(request, env, ctx) {
    mergeEnvOverrides(env); // M6.1：控制台变量/密钥覆盖 CONFIG（首次请求合并一次）
    const url = new URL(request.url);
    const p = url.pathname.replace(/\/+$/, '') || '/';
    try {
      if (p === '/api/servers') return await handleServersApi(request, ctx);
      if (p === '/sub' || p === '/mihomo' || p === '/clash' || p === '/subscribe') {
        return await handleSubscription(url, ctx);
      }
      if (p === '/' || p === '/index.html') {
        return new Response(HTML_PAGE, {
          headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-cache' },
        });
      }
      return new Response('Not Found', { status: 404 });
    } catch (err) {
      return new Response('Worker error: ' + (err && err.message ? err.message : String(err)), {
        status: 500,
        headers: { 'content-type': 'text/plain; charset=utf-8' },
      });
    }
  },
};

// ------------------------------------------------------------
// 上游 VPNGate CSV 拉取 + 边缘缓存
// ------------------------------------------------------------
// U-2: ?refresh=1 鉴权。SUB_AUTH_TOKEN 为空时强制刷新默认关闭，
//      防止公开部署后被当作 4 账号额度放大器滥用。
function checkRefreshAuth(q) {
  const token = (CONFIG.SUB_AUTH_TOKEN || '').trim();
  if (!token) return false;
  return q.get('token') === token;
}

async function getServers(ctx, force) {
  const hasCache = typeof caches !== 'undefined' && caches.default;
  const cacheKey = new Request('https://vpngate-cache.internal/raw?v=1');
  let stale = null;
  if (hasCache) {
    const hit = await caches.default.match(cacheKey);
    if (hit) {
      if (!force) return { servers: parseVpnGateCsv(await hit.text()), cached: true };
      stale = hit; // 强制刷新时保留旧缓存作为失败兜底
    }
  }
  let text;
  try {
    const upstream = await fetch(VPNGATE_API_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; VPNGateSubWorker/2.0)', Accept: 'text/plain,*/*' },
      signal: AbortSignal.timeout(CONFIG.FETCH_TIMEOUT_UPSTREAM), // S-1：上游 hang 住不再拖死整个请求
    });
    if (!upstream.ok) throw new Error('HTTP ' + upstream.status);
    text = await upstream.text();
    const parsed = parseVpnGateCsv(text);
    if (!parsed.length) throw new Error('empty');
    if (hasCache) {
      ctx.waitUntil(
        caches.default.put(
          cacheKey,
          new Response(text, { headers: { 'cache-control': 'public, max-age=' + UPSTREAM_TTL } })
        )
      );
    }
    return { servers: parsed, cached: false };
  } catch (err) {
    if (stale) return { servers: parseVpnGateCsv(await stale.text()), cached: true, stale: true };
    throw new Error('vpngate.net 拉取失败(' + (err && err.message) + ')且无可用缓存');
  }
}

async function handleServersApi(request, ctx) {
  const u = new URL(request.url);
  const wantRefresh = u.searchParams.get('refresh') === '1';
  if (wantRefresh && !checkRefreshAuth(u.searchParams)) {
    return jsonResponse({ error: true, message: 'refresh=1 需要鉴权：请在部署的 CONFIG.SUB_AUTH_TOKEN 中设置 token，并以 ?refresh=1&token=xxx 调用' }, 403, 0);
  }
  const { servers, cached } = await getServers(ctx, wantRefresh);
  const bag = { degraded: [] };
  // 附带 IP 纯净度/风险画像(一次批量 + 长缓存; 质量源故障时自动降级为 null, 不影响列表)
  try { await enrichQuality(servers, ctx, bag); } catch (e) {}
  const out = servers.map((s) => {
    const o = Object.assign({}, s);
    o.quality = s._q || null;
    delete o._q;
    return o;
  });
  return jsonResponse(
    { error: false, updatedAt: new Date().toISOString(), cached, count: out.length, servers: out },
    200,
    60,
    bag.degraded
  );
}

// ------------------------------------------------------------
// IP 纯净度 / 风险(欺诈)画像
//   主源 ip-api.com 批量接口(免 key): proxy/hosting/mobile/isp/asn/type
//   risk 0-100 越高越"脏", clean=100-risk 即纯净度; grade: clean/mid/risk
//   Scamalytics 有 Cloudflare 反爬, 云端无法稳定自动抓取,
//   故用业界通用的代理/机房/ASN 多信号合成可解释的风险(欺诈)分, 并长缓存
// ------------------------------------------------------------
const qualityMem = new Map();           // isolate 级内存缓存 ip -> {t, q, neg?}
// M6 F1：抓取失败的负缓存上限 60s —— 失败结果不写入长期缓存，过期后下次请求可重试
const NEG_TTL_MS = 60 * 1000;
// M6 F4：画像 TTL 分层（与 scamTtl 的"敏感区 8h / 稳定区 24h"对齐）：
//   决策敏感区（risk 25~74）8h；稳定区（<25 或 ≥75）24h；未知（q 为 null）8h。
//   静态/低变化画像（干净住宅 IP 等）因此享受更长 TTL，画像预算集中在"会改变结论的 IP"上。
function qualityTtl(q) {
  if (!q || typeof q.risk !== 'number' || isNaN(q.risk)) return 8 * 3600 * 1000;
  return (q.risk >= 25 && q.risk < 75) ? 8 * 3600 * 1000 : 24 * 3600 * 1000;
}
function qualityExpired(c, now) {
  if (!c) return true;
  if (c.neg) return now - c.t > NEG_TTL_MS; // 失败负缓存：60s 后即可重试（F1）
  return now - c.t > qualityTtl(c.q);       // 分层 TTL（F4）
}
const HOSTING_KEYWORDS = /(vpn|proxy|softether|hosting|datacenter|data.?center|cloud|vps|colocation|m247|digitalocean|ovh|hetzner|choopa|vultr|linode|amazon|aws|google|microsoft|azure|oracle|alibaba|tencent|quadranet|reliablesite|psychz|netcup|contabo|leaseweb|nforce|server|servers?)/i;

function assessQuality(r) {
  if (!r) return null;
  if (r.status === 'fail') return null; // M3：ip-api 查不到的行返回 null，不再反向标"干净"（原反向击穿 bug）
  const proxy = r.proxy === true;
  const hosting = r.hosting === true;
  const mobile = r.mobile === true;
  const kind = String(r.type || '').toLowerCase();
  const orgText = [r.isp, r.org, r.as, r.asname, r.type].filter(Boolean).join(' ');
  const ptrText = String(r.reverse || ''); // M2：PTR 主机名是机房判定的优质载体（batch fields 零成本增补）
  // M3 评分 v2：互斥层（同一事实只计一次，消除 proxy/hosting/关键词叠加膨胀：原最高 45+25+15=85）
  let risk = 0;
  if (proxy) risk += 40;                 // 已知匿名代理/VPN 出口 —— 风险主因
  else if (hosting) risk += 20;          // 机房/数据中心
  else if (kind === 'business') risk += 5;
  // 修正层：ASN/ISP/PTR 关键词仅在未被 proxy/hosting 标记时生效，避免对同一事实重复计分
  if (!proxy && !hosting && HOSTING_KEYWORDS.test(orgText + ' ' + ptrText)) risk += 10;
  if (mobile) risk = Math.max(0, risk - 20);      // 蜂窝网络更接近住宅, 减分
  // 运营商住宅带宽(isp)且未被标代理/机房, 天然低风险, 封顶 10
  if (kind === 'isp' && !proxy && !hosting) risk = Math.min(risk, 10);
  risk = Math.max(0, Math.min(100, risk));
  const clean = 100 - risk;
  let grade = 'clean';
  if (clean < 50) grade = 'risk';
  else if (clean < 80) grade = 'mid';
  return { proxy, hosting, mobile, kind: kind || 'unknown', isp: r.isp || r.org || r.as || '', risk, clean, grade };
}

// M2：源级软退避（isolate 级）：429/连续失败后一段时间内不再打该源，避免雪崩时反复撞限速
const srcCooldown = new Map(); // src -> 到期时间戳(ms)
function srcOnCooldown(name) {
  const until = srcCooldown.get(name);
  return !!until && Date.now() < until;
}
function srcBackoff(name, ms) { srcCooldown.set(name, Date.now() + ms); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ------------------------------------------------------------
// M3 L0 硬黑名单层：威胁情报一票否决 / 惩罚（fail-open：源故障时跳过，不误杀）
//   FireHOL level1：聚合 Spamhaus DROP/eDROP 等劫持网段 → 命中一票否决（risk=100）
//   Tor 出口表：命中 → risk+25（惩罚不否决，Tor 出口未必恶意但易被站点风控）
//   零 key、零配额；24h/6h 边缘缓存 + isolate 内存驻留解析结果
// ------------------------------------------------------------
const FIREHOL_URL = 'https://cdn.jsdelivr.net/gh/firehol/blocklist-ipsets@master/firehol_level1.netset';
const FIREHOL_CACHE_KEY = 'https://vpngate-cache.internal/bl?src=firehol&v=1';
const FIREHOL_TTL_MS = 24 * 3600 * 1000;
const TOR_URL = 'https://check.torproject.org/exit-addresses';
const TOR_CACHE_KEY = 'https://vpngate-cache.internal/bl?src=tor&v=1';
const TOR_TTL_MS = 6 * 3600 * 1000;
const FETCH_TIMEOUT_BL = 8000; // 黑名单文件拉取超时
let fireholParsed = null; // {t, ranges} isolate 内存驻留，避免每请求重复解析数千行 CIDR
let torParsed = null;     // {t, set}

function ipToInt(ip) {
  const p = String(ip || '').split('.');
  if (p.length !== 4) return -1;
  let n = 0;
  for (const x of p) {
    const v = parseInt(x, 10);
    if (isNaN(v) || v < 0 || v > 255) return -1;
    n = n * 256 + v;
  }
  return n >>> 0;
}
function parseNetset(text) {
  const ranges = [];
  for (const line of String(text || '').split('\n')) {
    const t = line.trim();
    if (!t || t[0] === '#' || t[0] === ';') continue;
    const slash = t.indexOf('/');
    if (slash < 0) {
      const ip = ipToInt(t);
      if (ip >= 0) ranges.push([ip, ip]);
      continue;
    }
    const base = ipToInt(t.slice(0, slash));
    const bits = parseInt(t.slice(slash + 1), 10);
    if (base < 0 || isNaN(bits) || bits < 0 || bits > 32) continue;
    const mask = bits === 0 ? 0 : (0xFFFFFFFF << (32 - bits)) >>> 0;
    const start = (base & mask) >>> 0;
    const end = (base | (~mask >>> 0)) >>> 0;
    ranges.push([start, end]);
  }
  ranges.sort((a, b) => a[0] - b[0]);
  return ranges;
}
function inRanges(ranges, ip) {
  const n = ipToInt(ip);
  if (n < 0 || !ranges || !ranges.length) return false;
  let lo = 0, hi = ranges.length - 1; // 二分查（ranges 按 start 排序，overlap 不影响成员判定）
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (n < ranges[mid][0]) hi = mid - 1;
    else if (n > ranges[mid][1]) lo = mid + 1;
    else return true;
  }
  return false;
}
async function fetchTextCached(url, cacheKey, maxAge, ctx, bag, srcName) {
  const hasCache = typeof caches !== 'undefined' && caches.default;
  try {
    if (hasCache) {
      const hit = await caches.default.match(new Request(cacheKey));
      if (hit) return await hit.text();
    }
    const r = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_BL) });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const text = await r.text();
    if (hasCache && ctx && ctx.waitUntil) {
      ctx.waitUntil(caches.default.put(
        new Request(cacheKey),
        new Response(text, { headers: { 'cache-control': 'public, max-age=' + maxAge } })
      ));
    }
    return text;
  } catch (e) {
    if (bag) bag.degraded.push(srcName);
    return null; // fail-open
  }
}
async function loadFirehol(ctx, bag) {
  const now = Date.now();
  if (fireholParsed && now - fireholParsed.t < FIREHOL_TTL_MS) return fireholParsed.ranges;
  const text = await fetchTextCached(FIREHOL_URL, FIREHOL_CACHE_KEY, 86400, ctx, bag, 'firehol');
  if (!text) return null;
  const ranges = parseNetset(text);
  fireholParsed = { t: now, ranges };
  return ranges;
}
async function loadTorList(ctx, bag) {
  const now = Date.now();
  if (torParsed && now - torParsed.t < TOR_TTL_MS) return torParsed.set;
  const text = await fetchTextCached(TOR_URL, TOR_CACHE_KEY, 21600, ctx, bag, 'tor');
  if (!text) return null;
  const set = new Set();
  for (const line of text.split('\n')) {
    const t = line.trim();
    if (t.startsWith('ExitAddress ')) {
      const ip = t.split(/\s+/)[1];
      if (ipToInt(ip) >= 0) set.add(ip);
    }
  }
  torParsed = { t: now, set };
  return set;
}

// M6 F1/F2：返回 {got, failed} —— got: ip -> 画像（含 null：ip-api 明确回答 fail，是有效负数据，走 F4 分层 TTL）；
//   failed: 抓取失败的 ip（超时/429/异常/整批未返回），由调用方记 60s 负缓存，不污染长期缓存。
async function batchIpaQuality(ips, bag) {
  // ip-api 批量接口一次最多 100 个; 免费版仅 http(Worker 可发起 http 子请求), 15 次/分
  const got = new Map();
  const failed = new Set(ips);
  if (srcOnCooldown('ipapi')) { if (bag) bag.degraded.push('ipapi-cooldown'); return { got, failed }; }
  let batchIdx = 0;
  for (let i = 0; i < ips.length; i += 100) {
    if (batchIdx > 0) await sleep(300 + Math.random() * 200); // M2：批间抖动，避开 15 次/分限速
    batchIdx++;
    const chunk = ips.slice(i, i + 100);
    try {
      // M2：fields 追加 reverse(PTR 主机名，机房判定) + status(失败行识别，M3 用)
      const resp = await fetch('http://ip-api.com/batch?fields=query,status,countryCode,isp,org,as,asname,type,mobile,proxy,hosting,reverse', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'User-Agent': 'VPNGateSub/2.1' },
        body: JSON.stringify(chunk.map((ip) => ({ query: ip }))),
        signal: AbortSignal.timeout(CONFIG.FETCH_TIMEOUT_IPAPI), // S-1
      });
      if (resp.status === 429) {
        srcBackoff('ipapi', 5 * 60 * 1000); // M2：429 后本 isolate 5 分钟不再打
        if (bag) bag.degraded.push('ipapi-429');
        break;
      }
      if (!resp.ok) continue;
      const rows = await resp.json();
      for (const r of rows) if (r && r.query) { got.set(r.query, assessQuality(r)); failed.delete(r.query); }
    } catch (e) { /* 单批失败：该批 ip 留在 failed，走 60s 负缓存后重试（M6 F1） */ }
  }
  return { got, failed };
}

// ------------------------------------------------------------
// M6 F2 singleflight：同一 isolate 内，并发请求对同一批 IP 的画像抓取只打一次上游，
//   后到的请求等待共享结果，避免上游抖动时请求被放大。key 为排序后的 IP 集合；
//   按 key 独立建槽：不同 IP 集合的并发抓取互不挤占（M6 验收补强）。
// ------------------------------------------------------------
const ipaFlights = new Map(); // key(排序后IP集合) -> Promise
function fetchIpaBatchFlight(ips, bag) {
  const key = [...ips].sort().join(',');
  let p = ipaFlights.get(key);
  if (!p) {
    p = batchIpaQuality(ips, bag);
    ipaFlights.set(key, p);
    const clear = () => { if (ipaFlights.get(key) === p) ipaFlights.delete(key); };
    p.then(clear, clear);
  }
  return p;
}

// M6：ip-api 抓取 + 缓存写入统一入口（F1 失败 60s 负缓存 / F2 singleflight）
async function fetchIpaIntoCache(ips, bag) {
  const uniq = [...new Set(ips)];
  if (!uniq.length) return;
  const { got, failed } = await fetchIpaBatchFlight(uniq, bag);
  const now = Date.now();
  for (const ip of uniq) {
    if (got.has(ip)) qualityMem.set(ip, { t: now, q: got.get(ip) }); // 含 q=null（ip-api 明确 fail）：有效负数据，走 F4 分层 TTL
    else if (failed.has(ip)) qualityMem.set(ip, { t: now, q: null, neg: true }); // F1：抓取失败只记 60s 负缓存
  }
}

async function enrichQuality(servers, ctx, bag) {
  const now = Date.now();
  const need = [];  // 从未画像 / 失败负缓存过期：同步抓取（首屏需要数据；失败走 60s 负缓存，下次重试）
  const stale = []; // M6 F3：过期但有旧值 —— 先用旧画像保证订阅可用，后台异步刷新
  for (const s of servers) {
    const c = qualityMem.get(s.ip);
    if (!c || qualityExpired(c, now)) {
      if (c && !c.neg && c.q) stale.push(s.ip);
      else need.push(s.ip);
    }
  }
  if (need.length) await fetchIpaIntoCache(need, bag);
  if (stale.length && ctx && ctx.waitUntil) {
    // F3 stale-while-revalidate：不阻塞本次响应；后台刷新失败只记 60s 负缓存，不影响已返回的旧画像
    ctx.waitUntil(fetchIpaIntoCache(stale, null).catch(() => {}));
  }
  for (const s of servers) {
    const _hit = (qualityMem.get(s.ip) || {}).q;
    // S-2 写时复制：enrichScam 的欺诈加罚只允许改这个副本，不得污染 qualityMem 缓存基线
    // （原 bug：s._q 是缓存对象引用，Math.max 原地改写导致 risk 只升不降，脏一次洗不白）
    s._q = _hit ? { ..._hit } : null;
  }
  // M3 L0 硬黑名单层：只作用于副本 s._q，不污染缓存；源故障时跳过（fail-open）
  const _ranges = await loadFirehol(ctx, bag);
  const _torSet = await loadTorList(ctx, bag);
  if (_ranges || _torSet) {
    for (const s of servers) {
      const q = s._q;
      if (!q) continue;
      if (_ranges && inRanges(_ranges, s.ip)) {
        q.risk = 100; q.clean = 0; q.grade = 'risk'; q.blacklisted = true; // 一票否决：劫持/恶意网段
      } else if (_torSet && _torSet.has(s.ip)) {
        q.risk = Math.min(100, q.risk + 25); // 惩罚不否决
        q.clean = 100 - q.risk;
        q.grade = q.clean < 50 ? 'risk' : q.clean < 80 ? 'mid' : 'clean';
        q.torExit = true;
      }
    }
  }
  try { await loadScamCache(); await enrichScam(servers, ctx); } catch (e) {}
  // M4 L3 定向精查（预算熔断；key 为空时整层静默跳过，零子请求）
  try { await enrichTargeted(servers, bag); } catch (e) {}
  return servers;
}

// ------------------------------------------------------------
// Scamalytics 欺诈分(2026-09-10 实测 Worker 直连可达,无403):
//   仅对 ip-api 预筛后的头部候选做增量抓取,单请求子请求预算内(免费版50,留余量),
//   isolate 内存 + 边缘缓存 24h;score>=75 一票否决,50-74 重罚,25-49 中罚
// ------------------------------------------------------------
const SCAM_TTL_MS = 24 * 3600 * 1000;
const SCAM_FETCH_BATCH = 5;   // 并发
const SCAM_MAX_NEW = 20;      // M4：单次请求最多新抓的 IP 数（原 28，给 L3 精查腾子请求预算）
const ROLLING_REFRESH_AGE_MS = 8 * 3600 * 1000; // M4 R2：超过 8h 的条目顺带滚动刷新
const ROLLING_REFRESH_MAX = 6;                  // M4 R2：每请求最多顺带刷新数
const scamMem = new Map();    // ip -> {t, score|null, neg?}

// M4 R3 分层 TTL：分值落在决策敏感区（25~74）的条目 8h 过期，稳定区（<25 或 ≥75）24h，
// 把画像预算集中在"会改变结论的 IP"上
function scamTtl(score) {
  if (score === null || score === undefined || isNaN(score)) return SCAM_TTL_MS;
  return (score >= 25 && score < 75) ? 8 * 3600 * 1000 : SCAM_TTL_MS;
}

async function fetchScamScore(ip) {
  try {
    const r = await fetch('https://scamalytics.com/ip/' + ip, {
      headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/126 Safari/537.36' },
      signal: AbortSignal.timeout(CONFIG.FETCH_TIMEOUT_SCAM), // S-1：对方 tarpit 时不再串行拖数十秒
    });
    if (!r.ok) return null;
    const t = await r.text();
    const m = t.match(/Fraud Score[^0-9]{0,40}([0-9]{1,3})/);
    const v = m ? parseInt(m[1], 10) : null;
    return v === null || isNaN(v) ? null : Math.min(100, v);
  } catch (e) { return null; }
}

// M6 F2：scamalytics 按 IP singleflight —— 同一 isolate 内并发请求对同一 IP 只抓一次，
//   后到的请求等待共享结果。fetchScamScore 本身永不 reject（内部已 catch），这里仍做双保险清理。
const scamFlight = new Map(); // ip -> Promise<score|null>
function fetchScamScoreSF(ip) {
  let p = scamFlight.get(ip);
  if (!p) {
    p = fetchScamScore(ip);
    scamFlight.set(ip, p);
    const clear = () => { if (scamFlight.get(ip) === p) scamFlight.delete(ip); };
    p.then(clear, clear);
  }
  return p;
}

async function enrichScam(servers, ctx) {
  const now = Date.now();
  const cands = servers
    .filter((s) => s._q && s._q.risk < 90)
    .sort((a, b) => a._q.risk - b._q.risk)
    .slice(0, 30);
  const need = [];
  const rolling = [];
  for (const s of cands) {
    const c = scamMem.get(s.ip);
    // M6 F1：失败条目（neg）60s 后即可重试；F4：成功条目沿用 scamTtl 分层（敏感区 8h / 稳定区 24h）
    const expired = !c || (c.neg ? now - c.t > NEG_TTL_MS : now - c.t > scamTtl(c.score));
    if (expired) need.push(s.ip); // M4 R3：分层 TTL
    // M6：失败条目不占滚动刷新预算（60s 负缓存到期后走 need 正常重试）
    else if (!c.neg && c.score !== null && c.score !== undefined && now - c.t > ROLLING_REFRESH_AGE_MS) rolling.push(s.ip); // M4 R2：8h+ 条目顺带刷新
  }
  const budget = [...need.slice(0, SCAM_MAX_NEW), ...rolling.slice(0, ROLLING_REFRESH_MAX)];
  for (let i = 0; i < budget.length; i += SCAM_FETCH_BATCH) {
    const chunk = budget.slice(i, i + SCAM_FETCH_BATCH);
    const rs = await Promise.all(chunk.map((ip) => fetchScamScoreSF(ip))); // M6 F2：按 IP singleflight
    for (let j = 0; j < chunk.length; j++) {
      if (rs[j] !== null) scamMem.set(chunk[j], { t: now, score: rs[j] });
      else scamMem.set(chunk[j], { t: now, score: null, neg: true }); // M6 F1：失败只记 60s 负缓存（原：12h  effectively）
    }
  }
  for (const s of servers) {
    const c = scamMem.get(s.ip);
    if (!c || c.score === null || c.score === undefined || !s._q) continue;
    const scam = c.score;
    s._q.scam = scam;
    let risk = s._q.risk;
    if (scam >= 75) risk = Math.max(risk, 90);
    else if (scam >= 50) risk = Math.max(risk, 65);
    else if (scam >= 25) risk = Math.max(risk, 45);
    s._q.risk = Math.max(0, Math.min(100, risk));
    s._q.clean = 100 - s._q.risk;
    s._q.grade = s._q.clean < 50 ? 'risk' : s._q.clean < 80 ? 'mid' : 'clean';
  }
  if (ctx && typeof caches !== 'undefined' && caches.default && budget.length) {
    try {
      const dump = {};
      for (const [ip, c] of scamMem) dump[ip] = c;
      ctx.waitUntil(caches.default.put(
        new Request('https://vpngate-cache.internal/scam?v=1'),
        new Response(JSON.stringify(dump), { headers: { 'cache-control': 'public, max-age=86400' } })
      ));
    } catch (e) {}
  }
}

async function loadScamCache() {
  if (typeof caches === 'undefined' || !caches.default) return;
  try {
    const hit = await caches.default.match(new Request('https://vpngate-cache.internal/scam?v=1'));
    if (hit) {
      const dump = await hit.json();
      const now = Date.now();
      for (const ip of Object.keys(dump)) {
        const c = dump[ip];
        if (c && c.t && now - c.t < scamTtl(c.score) && !scamMem.has(ip)) scamMem.set(ip, c); // M4 R3：回灌按分层 TTL 判定
      }
    }
  } catch (e) {}
}
// ------------------------------------------------------------
// M4 L3 定向精查：只对风险临界带 [40,70) 的候选做，预算熔断（合计 ≤8/请求）
//   AbuseIPDB："这个 IP 最近是否被拿来干坏事"（abuseConfidenceScore）
//   proxycheck.io："这个 IP 是不是代理"一手信号（proxy=yes / risk）
//   key 为空 = 该源静默禁用；任何失败 = fail-open（不加分不否决）
//   证据互斥：ip-api 已计过的 proxy 身份不重复计分
// ------------------------------------------------------------
const L3_BUDGET = 8;            // AbuseIPDB + proxycheck 合计每请求上限
const L3_TIMEOUT_MS = 4000;
const L3_RISK_LOW = 40, L3_RISK_HIGH = 70; // 临界带：低于 40 已干净，高于 70 已由 L1/L2 处理

async function fetchAbuseIPDB(ip, bag) {
  const key = (CONFIG.ABUSEIPDB_KEY || '').trim();
  if (!key) return null;
  try {
    const r = await fetch('https://api.abuseipdb.com/api/v2/check?ipAddress=' + encodeURIComponent(ip) + '&maxAgeInDays=90', {
      headers: { Key: key, Accept: 'application/json' },
      signal: AbortSignal.timeout(L3_TIMEOUT_MS),
    });
    if (r.status === 429) { if (bag) bag.degraded.push('abuseipdb-429'); return null; }
    if (!r.ok) return null;
    const j = await r.json();
    const d = (j && j.data) || {};
    return { conf: d.abuseConfidenceScore || 0, reports: d.totalReports || 0 };
  } catch (e) { return null; }
}
async function fetchProxycheck(ip, bag) {
  const key = (CONFIG.PROXYCHECK_KEY || '').trim();
  if (!key) return null;
  try {
    const r = await fetch('https://proxycheck.io/v2/' + encodeURIComponent(ip) + '?key=' + encodeURIComponent(key) + '&vpn=1&asn=1&risk=1', {
      signal: AbortSignal.timeout(L3_TIMEOUT_MS),
    });
    if (!r.ok) return null;
    const j = await r.json();
    const d = (j && j[ip]) || {};
    return { proxy: d.proxy === 'yes', risk: parseInt(d.risk || '0', 10) || 0 };
  } catch (e) { return null; }
}
function rescore(q) {
  q.risk = Math.max(0, Math.min(100, q.risk));
  q.clean = 100 - q.risk;
  q.grade = q.clean < 50 ? 'risk' : q.clean < 80 ? 'mid' : 'clean';
}
async function enrichTargeted(servers, bag) {
  // key 全空时整层静默跳过（零子请求）
  if (!(CONFIG.ABUSEIPDB_KEY || '').trim() && !(CONFIG.PROXYCHECK_KEY || '').trim()) return;
  const cands = servers
    .filter((s) => s._q && !s._q.blacklisted && s._q.risk >= L3_RISK_LOW && s._q.risk < L3_RISK_HIGH)
    .sort((a, b) => b._q.risk - a._q.risk)
    .slice(0, Math.ceil(L3_BUDGET / 2));
  let used = 0;
  for (const s of cands) {
    if (used >= L3_BUDGET) break;
    const q = s._q;
    const jobs = [];
    if ((CONFIG.ABUSEIPDB_KEY || '').trim() && used < L3_BUDGET) { jobs.push(fetchAbuseIPDB(s.ip, bag)); used++; }
    if ((CONFIG.PROXYCHECK_KEY || '').trim() && used < L3_BUDGET) { jobs.push(fetchProxycheck(s.ip, bag)); used++; }
    const [ab, pc] = await Promise.all(jobs);
    if (ab) {
      if (ab.conf >= 80) {
        q.risk = 100; q.clean = 0; q.grade = 'risk'; q.blacklisted = true; q.abuseVeto = true;
      } else if (ab.conf >= 50) {
        q.risk = Math.max(q.risk, ab.conf);
      }
    }
    if (pc && !q.blacklisted) {
      if (pc.proxy && !q.proxy) q.risk = Math.min(100, q.risk + 45); // 互斥：ip-api 已标 proxy 的不重复计
      if (pc.risk >= 75) q.risk = Math.max(q.risk, 75);
      rescore(q);
    } else if (ab) {
      rescore(q);
    }
  }
}

const qRisk = (s) => (s && s._q ? s._q.risk : 50); // M3：无画像按中性风险，不因缺失被歧视（原 999 逆向淘汰优质未画像节点）
const qGradeCN = (g) => (g === 'clean' ? '干净' : g === 'mid' ? '中等' : '高风险');

// ------------------------------------------------------------
// 自动优选订阅
// ------------------------------------------------------------
// M4 R4：空结果兜底。picked 为空时返回最近一次非空订阅（6h 边缘缓存），避免客户端断粮
const LASTGOOD_TTL = 6 * 3600; // 秒
function lastgoodKey(sig) { return 'https://vpngate-cache.internal/lastgood?sig=' + encodeURIComponent(sig); }
async function loadLastgood(ctx, sig) {
  if (typeof caches === 'undefined' || !caches.default) return null;
  try {
    const hit = await caches.default.match(new Request(lastgoodKey(sig)));
    return hit ? await hit.text() : null;
  } catch (e) { return null; }
}
function saveLastgood(ctx, sig, text) {
  if (typeof caches === 'undefined' || !caches.default || !ctx || !ctx.waitUntil) return;
  try {
    ctx.waitUntil(caches.default.put(
      new Request(lastgoodKey(sig)),
      new Response(text, { headers: { 'cache-control': 'public, max-age=' + LASTGOOD_TTL } })
    ));
  } catch (e) {}
}

async function handleSubscription(url, ctx) {
  const q = url.searchParams;
  const mode = (q.get('mode') || '').trim().toLowerCase();
  if (mode === 'merged' || q.get('merge') === '1') return await handleMergedSubscription(q, ctx, false);
  if (mode === 'self') {
    // M-2 去 VPS 化安全阀：SELF_JP_NODE 仍是占位符时明确 410，不静默下发 broken 订阅
    if (isSelfNodeUnconfigured()) {
      return new Response('# 410: ?mode=self 需要自建 VPS 落地节点（SELF_JP_NODE 未配置）。请使用普通 /sub 订阅。', {
        status: 410,
        headers: { 'content-type': 'text/plain; charset=utf-8' },
      });
    }
    return await handleMergedSubscription(q, ctx, true);
  }
  const opts = {
    n: clampInt(q.get('n'), 1, 30, 8),
    cc: (q.get('cc') || '').trim().toUpperCase(),
    proto: (q.get('proto') || 'tcp').trim().toLowerCase(), // 默认 tcp，更稳；udp / any
    sort: (q.get('sort') || 'score').trim().toLowerCase(),
    minSpeed: clampInt(q.get('min'), 0, 100000, 3) * 1e6, // 默认 ≥3Mbps
    group: q.get('name') || 'VPNGate',
    clean: q.get('clean') === '1',                        // 纯净模式: 只留非代理/非机房低风险 IP
    maxRisk: (() => { const v = clampInt(q.get('maxrisk'), 0, 100, -1); return v; })(),
    interval: clampInt(q.get('interval'), 1, 24, CONFIG.PROFILE_UPDATE_INTERVAL), // U-1：订阅刷新周期参数化
    degraded: [], // 降级标记：fail-open / 画像源故障时写入 YAML 注释与 x-vg-degraded 头
  };
  const wantRefresh = q.get('refresh') === '1';
  if (wantRefresh && !checkRefreshAuth(q)) {
    return new Response('# 403: refresh=1 需要鉴权。请在部署的 CONFIG.SUB_AUTH_TOKEN 中设置 token，并以 ?refresh=1&token=xxx 调用。', {
      status: 403,
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  }
  const { servers: allServers, cached } = await getServers(ctx, wantRefresh);
  // M2：分片过滤（4 账号并联：客户端 4 provider 合并时各账号只服务自己的分片，天然去重；
  // 单独使用某账号订阅时不要带 shard 参数）
  let servers = allServers;
  let shardSig = '';
  const shardParam = q.get('shard');
  if (shardParam !== null && shardParam !== '') {
    const k = clampInt(shardParam, 0, CONFIG.SHARD_TOTAL - 1, -1);
    if (k >= 0) {
      servers = servers.filter((s) => hashShard(s.ip) % CONFIG.SHARD_TOTAL === k);
      shardSig = 'shard' + k;
    }
  }
  // M2 管线重排：轻量预筛 → 截断 → 仅对候选画像（原：全量画像后再过滤）
  const cands = prefilterCandidates(servers, opts);
  await enrichQuality(cands, ctx, { degraded: opts.degraded });
  // U-3 画像健康度（M2：按候选集统计）：可用率 <50% 时 fail-open
  const _imaged = cands.filter((s) => s._q).length;
  opts.qualityHealthy = cands.length === 0 || _imaged / cands.length >= 0.5;
  if (!opts.qualityHealthy) opts.degraded.push('quality-failopen');
  const picked = pickBest(cands, opts);
  const lgSig = [opts.cc || '', opts.proto, opts.clean ? '1' : '0', String(opts.maxRisk), String(opts.n), shardSig].join('|');
  if (!picked.length) {
    // M4 R4：空结果兜底——返回最近一次非空订阅（可能滞后 6h），避免客户端断粮；无兜底时才 502
    const lg = await loadLastgood(ctx, lgSig);
    if (lg) {
      opts.degraded.push('empty-fallback');
      const warnNote = `# 注意：本次无符合条件节点，已回退到最近一次可用订阅（内容可能滞后最多 6 小时）\n`;
      return new Response(warnNote + lg, { status: 200, headers: yamlHeaders(120, opts.interval, opts.degraded) });
    }
    return new Response('# 当前没有符合条件的 VPNGate 节点，请稍后重试或放宽参数（如 ?proto=any&min=0，纯净模式无节点时去掉 clean=1）', {
      status: 502,
      headers: yamlHeaders(0, opts.interval, opts.degraded),
    });
  }
  const yaml = buildMihomoSubscription(picked, opts);
  const qualityDesc = opts.clean
    ? `纯净模式=开(仅非代理/非机房/clean≥50${opts.maxRisk >= 0 ? ' 且 risk≤' + opts.maxRisk : ''})`
    : (opts.maxRisk >= 0 ? `风险上限=risk≤${opts.maxRisk}` : '纯净模式=关(速度优先,标注风险)');
  const headerNote =
    `# VPNGate 实时优选订阅（Cloudflare Worker 生成）\n` +
    `# 版本: ${CONFIG.APP_VERSION}#${CONFIG.ACCOUNT_TAG}  生成时间(UTC): ${new Date().toISOString()}  上游缓存: ${cached ? '命中' : '最新拉取'}\n` +
    `# 筛选: 国家=${opts.cc || '全球'} 协议=${opts.proto} 数量=${opts.n} 排序=${opts.sort} 最低=${opts.minSpeed / 1e6}Mbps 刷新周期=${opts.interval}h ${qualityDesc}\n` +
    (opts.degraded.length ? `# 注意: [${opts.degraded.join(',')}] 画像源故障，已降级 fail-open（未知节点放行）——非正常纯净状态，请稍后重试\n` : '') +
    `# 纯净度=100-风险分(代理/机房/ASN多信号合成); 想要更干净的出口加 clean=1\n` +
    `# 入选 ${picked.length} 个节点；客户端(Mihomo/ClashMeta内核≥v1.19.25)会在其中自动测速选最快\n\n`;
  const body = headerNote + yaml;
  saveLastgood(ctx, lgSig, body); // M4 R4：非空结果写回边缘缓存，供下次空结果时兜底
  return new Response(body, { status: 200, headers: yamlHeaders(120, opts.interval, opts.degraded) });
}

function yamlHeaders(ttl, intervalH, degraded) {
  const iv = Math.max(1, Math.min(24, parseInt(intervalH, 10) || CONFIG.PROFILE_UPDATE_INTERVAL));
  const h = {
    'content-type': 'text/yaml; charset=utf-8',
    'cache-control': 'public, max-age=' + ttl,
    'profile-update-interval': String(iv), // U-1：默认 12→6 小时；URL ?interval=1..24 可覆盖
    'content-disposition': "attachment; filename*=utf-8''vpngate.yaml",
    'access-control-allow-origin': '*',
    'x-vg-version': CONFIG.APP_VERSION + '#' + CONFIG.ACCOUNT_TAG, // 4 账号一致性核对
  };
  const dg = (degraded || []).filter(Boolean);
  if (dg.length) h['x-vg-degraded'] = dg.join(','); // M3：画像源降级可观测
  return h;
}

// ------------------------------------------------------------
// M2 管线重排：轻量预筛（零子请求）→ 截断 → 仅对候选画像
//   原管线对全量节点先画像再过滤，冷 isolate 一次打 3~10 个 batch；
//   现只对预筛幸存者画像，批量笔数压到 ≤1（PREFILTER_CAP），并给 4 账号 shard 留好位置
// ------------------------------------------------------------
// 分片哈希（djb2，确定性：同一 IP 永远归属同一分片，4 账号天然去重）
function hashShard(ip) {
  let h = 5381;
  const s = String(ip || '');
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h;
}

function prefilterCandidates(servers, opts) {
  const out = [];
  for (const s of servers) {
    if (opts.cc && (s.countryShort || '').toUpperCase() !== opts.cc) continue;
    if (s.speed && s.speed < opts.minSpeed) continue;
    let parsed;
    try {
      parsed = parseOvpnConfig(b64Utf8(s.configDataBase64));
    } catch (e) {
      continue;
    }
    if (!parsed.ca) continue; // mihomo openvpn 必须有 CA
    const proto = parsed.proto || 'udp';
    if (opts.proto !== 'any' && proto !== opts.proto) continue;
    s._p = parsed;
    out.push(s);
  }
  // 预排序后截断：score 高者优先进画像，避免把批量预算浪费在注定被截掉的节点上
  const pingV = (x) => (x.ping && x.ping > 0 ? x.ping : 99999);
  out.sort((a, b) => b.score - a.score || pingV(a) - pingV(b));
  return out.slice(0, CONFIG.PREFILTER_CAP);
}

// 综合优选：质量过滤 -> 排序 -> IP 去重 -> 取前 N（输入为 prefilterCandidates 的候选集）
function pickBest(cands, opts) {
  const ok = [];
  for (const s of cands) {
    // 纯净度/风险过滤（M2：cc/speed/CA/proto 轻量过滤已在 prefilterCandidates 完成）
    const q = s._q;
    if (q && q.blacklisted) continue; // M3：一票否决（FireHOL 劫持网段），独立信号、fail-open 下依然生效
    if (opts.clean) {
      if (opts.qualityHealthy !== false) {
        // 纯净模式: 质量数据缺失时保守跳过; 必须非代理、非机房、clean≥50
        if (!q || q.proxy || q.hosting || q.clean < 50) continue;
      } else if (q && (q.proxy || q.hosting || q.clean < 50)) {
        continue; // U-3 降级态：画像源故障时只剔除已知脏节点，未知放行（fail-open）
      }
    }
    if (opts.maxRisk >= 0) {
      if (opts.qualityHealthy !== false) {
        if (!q || q.risk > opts.maxRisk) continue;
      } else if (q && q.risk > opts.maxRisk) {
        continue; // U-3 降级态同上
      }
    }
    ok.push(s);
  }
  const pingV = (x) => (x.ping && x.ping > 0 ? x.ping : 99999);
  ok.sort((a, b) => {
    // 纯净优先: 风险升序, 同分再比综合分/延迟/速度
    if (opts.sort === 'clean') {
      return qRisk(a) - qRisk(b) || b.score - a.score || pingV(a) - pingV(b) || b.speed - a.speed;
    }
    if (opts.sort === 'speed') return b.speed - a.speed || qRisk(a) - qRisk(b) || pingV(a) - pingV(b) || b.score - a.score;
    if (opts.sort === 'ping') return pingV(a) - pingV(b) || qRisk(a) - qRisk(b) || b.score - a.score;
    // 默认 score 综合分; 同档时风险更低者优先
    return b.score - a.score || qRisk(a) - qRisk(b) || pingV(a) - pingV(b) || b.speed - a.speed;
  });
  const seen = new Set();
  const out = [];
  for (const s of ok) {
    if (seen.has(s.ip)) continue;
    seen.add(s.ip);
    out.push(s);
    if (out.length >= opts.n) break;
  }
  return out;
}

// ------------------------------------------------------------
// 合并订阅: 1 个自建日本承载落地(VLESS) + 非 JP 每个国家各 1 个 L1 宽松优选
// ------------------------------------------------------------
async function handleMergedSubscription(q, ctx, selfOnly) {
  const opts = {
    proto: (q.get('proto') || 'tcp').trim().toLowerCase(), // 其他国家优先协议, 默认 tcp; any=不限
    minSpeed: clampInt(q.get('min'), 0, 100000, OTHER_MIN_SPEED) * 1e6,
    maxPing: clampInt(q.get('maxping'), 0, 100000, OTHER_MAX_PING),
    group: q.get('name') || 'VPNGate',
  };
  let others = [], cached = false, ccList = '';
  const mBag = { degraded: [] }; // M3：merged 路径画像降级信号
  if (!selfOnly) {
    // merged: 日本自建 + 非 JP 每国 L1 优选
    const wantRefresh = q.get('refresh') === '1';
    if (wantRefresh && !checkRefreshAuth(q)) {
      return new Response('# 403: refresh=1 需要鉴权（CONFIG.SUB_AUTH_TOKEN）', {
        status: 403,
        headers: { 'content-type': 'text/plain; charset=utf-8' },
      });
    }
    const got = await getServers(ctx, wantRefresh);
    cached = got.cached;
    await enrichQuality(got.servers, ctx, mBag);
    others = pickPerCountry(got.servers, opts);
    if (!others.length) {
      return new Response('# 当前没有符合条件的非日本 VPNGate 节点，请稍后重试，或放宽参数（如 ?proto=any&min=0&maxping=500）', {
        status: 502,
        headers: yamlHeaders(0, undefined, mBag.degraded),
      });
    }
    ccList = others.map((s) => s._cc).join(',');
  }
  // selfOnly: 仅日本自建 VLESS, 不依赖 vpngate 上游。M-2：占位符未配置时不下发（入口已 410，此处防御性再判一次）
  const selfNode = isSelfNodeUnconfigured() ? null : SELF_JP_NODE;
  const yaml = buildMergedSubscription(selfNode, others, opts);
  const headerNote = selfOnly
    ? `# VPNGate 日本自建承载落地订阅（Cloudflare Worker 生成）\n` +
      `# 生成时间(UTC): ${new Date().toISOString()}\n` +
      `# 仅含 1 个自建 VLESS-Reality 节点(出口=VPS 本机承载 IP), 不依赖公共节点池, 用于最稳接入/客户端导入自检\n\n`
    : `# VPNGate 全球合并优选订阅（Cloudflare Worker 生成）\n` +
      `# 生成时间(UTC): ${new Date().toISOString()}  上游缓存: ${cached ? '命中' : '最新拉取'}\n` +
      `# 结构: ${selfNode ? '日本=1 个自建 VLESS 承载落地(VPS 本机 IP 出口); ' : '(自建节点未配置，已禁用；)'}其余 ${others.length} 国各 1 个 L1 宽松优选\n` +
      `# L1 宽松口径: 允许机房/已知代理、画像缺失不剔除, 仅剔除有画像且 clean<${L1_MIN_CLEAN} 的极脏节点; 国内按 综合分→延迟→速度→风险 择优, 优先 ${opts.proto === 'any' ? '任意' : opts.proto} 协议(无则回退)\n` +
      `# 其他国家(${others.length}): ${ccList}\n` +
      `# 客户端在 VPNGate-Auto 组内自动测速选最快; 也可在选择组手动固定「日本自建」或某个国家\n\n`;
  return new Response(headerNote + yaml, { status: 200, headers: yamlHeaders(selfOnly ? 300 : 120, undefined, mBag.degraded) });
}

// 非 JP 每国择优(L1): 硬门槛(速度/延迟/配置完整/极脏) -> 全局择优排序 -> 每国取 1(优先指定协议) -> 国家排序截断
function pickPerCountry(servers, opts) {
  const pingV = (x) => (x.ping && x.ping > 0 ? x.ping : 99999);
  const riskV = (x) => (x._q ? x._q.risk : 50); // 无画像按中性风险, 不因其缺失而被歧视
  const ok = [];
  for (const s of servers) {
    const cc = (s.countryShort || '').toUpperCase();
    if (!cc || cc === 'JP') continue;                 // 日本走自建节点, 不取公共池
    if (s.speed && s.speed < opts.minSpeed) continue; // 速度门槛
    if (s.ping && s.ping > 0 && s.ping > opts.maxPing) continue; // 延迟门槛
    let parsed;
    try { parsed = parseOvpnConfig(b64Utf8(s.configDataBase64)); } catch (e) { continue; }
    if (!parsed.ca) continue;                         // mihomo openvpn 必须有 CA
    const q = s._q;
    if (q && q.clean < L1_MIN_CLEAN) continue;        // L1: 仅踢极脏; 无画像/机房/代理均保留
    s._p = parsed;
    s._cc = cc;
    ok.push(s);
  }
  // 全局择优: 综合分↓ -> 延迟↑ -> 速度↓ -> 风险↑(同档更干净者优先)
  ok.sort((a, b) => b.score - a.score || pingV(a) - pingV(b) || b.speed - a.speed || riskV(a) - riskV(b));
  const preferred = new Map(); // cc -> 协议匹配的最优
  const fallback = new Map();  // cc -> 任意协议兜底
  const seenIp = new Set();
  for (const s of ok) {
    if (seenIp.has(s.ip)) continue;
    const cc = s._cc;
    const proto = s._p.proto || 'udp';
    if (!fallback.has(cc)) { fallback.set(cc, s); seenIp.add(s.ip); }
    if ((opts.proto === 'any' || proto === opts.proto) && !preferred.has(cc)) preferred.set(cc, s);
  }
  const chosen = [];
  for (const [cc, fb] of fallback) chosen.push(preferred.get(cc) || fb);
  // 国家之间排序: 选中节点综合分↓ -> 速度↓ -> 延迟↑
  chosen.sort((a, b) => b.score - a.score || b.speed - a.speed || pingV(a) - pingV(b));
  return chosen.slice(0, PER_COUNTRY_MAX);
}

// 自建日本承载落地节点的 Mihomo VLESS-Reality 段
function selfVlessYaml(n) {
  const L = [];
  L.push(`  - name: ${yq(n.name)}`);
  L.push(`    type: vless`);
  L.push(`    server: ${scrubHost(n.server)}`);
  L.push(`    port: ${scrubNum(n.port, 443)}`);
  L.push(`    uuid: ${scrub(n.uuid, 64)}`);
  L.push(`    network: ${scrub(n.network || 'tcp', 8)}`);
  L.push(`    tls: true`);
  L.push(`    udp: true`);
  L.push(`    flow: ${scrub(n.flow, 40)}`);
  L.push(`    servername: ${scrub(n.sni, 80)}`);
  L.push(`    reality-opts:`);
  L.push(`      public-key: ${scrub(n.pbk, 64)}`);
  L.push(`      short-id: ${scrub(n.sid, 32)}`);
  L.push(`    client-fingerprint: ${scrub(n.fp || 'chrome', 16)}`);
  return L.join('\n');
}

// 合并订阅完整 Mihomo 配置: proxies=[自建日本 VLESS, ...每国 OpenVPN], Auto 自动测速 + 手动选择组
function buildMergedSubscription(self, others, opts) {
  const g = scrub(opts.group || 'VPNGate', 40) || 'VPNGate';
  const auto = 'VPNGate-Auto';
  // M-2：self 为 null（占位符未配置）时只输出公共池节点，不下发 broken 的自建段
  const proxies = [...(self ? [selfVlessYaml(self)] : []), ...others.map(proxyYaml)].join('\n');
  const allNames = [...(self ? [self.name] : []), ...others.map(nodeName)];
  const nameList = allNames.map(yq).join(', ');
  return [
    'mixed-port: 7890',
    'allow-lan: false',
    'bind-address: "*"',
    'mode: rule',
    'log-level: info',
    'ipv6: false',
    'unified-delay: true',
    'tcp-concurrent: true',
    'find-process-mode: off',
    'proxies:',
    proxies,
    'proxy-groups:',
    `  - name: ${yq(auto)}`,
    '    type: url-test',
    '    url: http://www.gstatic.com/generate_204',
    '    interval: 300',
    '    tolerance: 120',
    `    proxies: [${nameList}]`,
    `  - name: ${yq(g)}`,
    '    type: select',
    `    proxies: [${yq(auto)}, ${nameList}, "DIRECT"]`,
    'rules:',
    '  - GEOIP,LAN,DIRECT,no-resolve',
    '  - GEOIP,CN,DIRECT',
    `  - MATCH,${g}`,
    '',
  ].join('\n');
}

// ------------------------------------------------------------
// Mihomo(Clash Meta) 完整订阅生成，type: openvpn
// ------------------------------------------------------------
function nodeName(s, i) {
  return `VG-${s.countryShort || 'UN'}-${s.ip}`;
}
function yq(str) {
  return '"' + String(str == null ? '' : str).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
}
// 清洗来自第三方(VPNGate/ip-api/用户参数)的自由文本：去控制字符(含换行)、折叠空白、限长，防止 YAML 断行注入
function scrub(v, n = 80) {
  return String(v == null ? '' : v).replace(/[\x00-]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);
}
// 仅保留主机名/IP 合法字符
function scrubHost(v) {
  return String(v == null ? '' : v).replace(/[^A-Za-z0-9._:\-]/g, '').slice(0, 253);
}
// 仅保留数字（端口/数值类指令），非法时回退默认值
function scrubNum(v, d) {
  const m = String(v == null ? '' : v).match(/\d+/);
  return m ? m[0] : d;
}
function block(value, indent) {
  const pad = ' '.repeat(indent);
  return String(value).replace(/\r\n/g, '\n').split('\n').map((l) => pad + l).join('\n');
}
function proxyYaml(s) {
  const p = s._p;
  const L = [];
  const q = s._q;
  const qNote = q
    ? ` 纯净度${q.clean}/风险${q.risk}(${qGradeCN(q.grade)}${q.proxy ? ',代理' : ''}${q.hosting ? ',机房' : ''}${q.mobile ? ',移动' : ''}; ${scrub(q.isp, 60)})`
    : ' 纯净度未知';
  L.push(`  - name: ${yq(nodeName(s))}`);
  L.push(`    type: openvpn`);
  L.push(`    server: ${scrubHost(p.remoteHost || s.ip)}`);
  L.push(`    port: ${scrubNum(p.remotePort, 1194)}`);
  L.push(`    proto: ${p.proto === 'tcp' ? 'tcp' : 'udp'}`);
  L.push(`    udp: true`);
  L.push(`    # score=${s.score} ping=${s.ping}ms speed=${(s.speed / 1e6).toFixed(1)}Mbps uptime_min=${Math.round(s.uptime / 60000)} country=${s.countryShort};${qNote}`);
  if (p.cipher) L.push(`    cipher: ${scrub(p.cipher, 40)}`);
  if (p.auth) L.push(`    auth: ${scrub(p.auth, 20)}`);
  if (p.ca) {
    L.push(`    ca: |`);
    L.push(block(p.ca, 6));
  }
  if (p.cert) {
    L.push(`    cert: |`);
    L.push(block(p.cert, 6));
  }
  if (p.key) {
    L.push(`    key: |`);
    L.push(block(p.key, 6));
  }
  if (p.tlsCrypt) {
    L.push(`    tls-crypt: |`);
    L.push(block(p.tlsCrypt, 6));
  } else if (p.tlsAuth) {
    // Q-3 已核实（Mihomo OpenVPNOption 有独立 tls-auth + key-direction 字段，见 pkg.go.dev）：
    // 原代码把 tls-auth 内容误标为 tls-crypt 且丢弃 key-direction，此类节点握手失败
    L.push(`    tls-auth: |`);
    L.push(block(p.tlsAuth, 6));
    if (p.keyDirection) L.push(`    key-direction: ${scrub(p.keyDirection, 4)}`);
  }
  if (p.compLzo) L.push(`    comp-lzo: ${/^(yes|no|adaptive)$/i.test(p.compLzo) ? scrub(p.compLzo,10) : 'yes'}`);
  if (p.mtu) L.push(`    mtu: ${scrubNum(p.mtu, 1500)}`);
  if (p.ping) L.push(`    ping: ${scrubNum(p.ping, 10)}`);
  if (p.pingRestart) L.push(`    ping-restart: ${scrubNum(p.pingRestart, 60)}`);
  return L.join('\n');
}
function buildMihomoSubscription(list, opts) {
  const names = list.map(nodeName);
  const auto = 'VPNGate-Auto';
  const g = scrub(opts.group || 'VPNGate', 40) || 'VPNGate';
  const sel = yq(g);
  const proxies = list.map(proxyYaml).join('\n');
  const nameList = names.map(yq).join(', ');
  return [
    'mixed-port: 7890',
    'allow-lan: false',
    'bind-address: "*"',
    'mode: rule',
    'log-level: info',
    'ipv6: false',
    'unified-delay: true',
    'tcp-concurrent: true',
    'find-process-mode: off',
    'proxies:',
    proxies,
    'proxy-groups:',
    `  - name: ${yq(auto)}`,
    '    type: url-test',
    '    url: http://www.gstatic.com/generate_204',
    '    interval: 300',
    '    tolerance: 120',
    `    proxies: [${nameList}]`,
    `  - name: ${sel}`,
    '    type: select',
    `    proxies: [${yq(auto)}, ${nameList}, "DIRECT"]`,
    'rules:',
    '  - GEOIP,LAN,DIRECT,no-resolve',
    '  - GEOIP,CN,DIRECT',
    `  - MATCH,${g}`,
    '',
  ].join('\n');
}

// ------------------------------------------------------------
// OpenVPN 配置解析（移植自原项目 page.html，Worker 端可用）
// ------------------------------------------------------------
function parseOvpnConfig(raw) {
  const lines = raw.split(/\r\n|\r|\n/);
  const r = {
    remoteHost: null, remotePort: null, proto: null,
    cipher: null, auth: null, compLzo: null, dev: null,
    ca: null, cert: null, key: null, tlsCrypt: null, tlsAuth: null,
    keyDirection: null, authUserPass: false, mtu: null, ping: null, pingRestart: null,
  };
  let block = null;
  let blockLines = [];
  const tagMap = {
    '<ca>': 'ca', '</ca>': 'ca',
    '<cert>': 'cert', '</cert>': 'cert',
    '<key>': 'key', '</key>': 'key',
    '<tls-crypt>': 'tlsCrypt', '</tls-crypt>': 'tlsCrypt',
    '<tls-auth>': 'tlsAuth', '</tls-auth>': 'tlsAuth',
  };
  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (Object.prototype.hasOwnProperty.call(tagMap, trimmed)) {
      const close = trimmed.indexOf('</') === 0;
      const k = tagMap[trimmed];
      if (!close) { block = k; blockLines = []; }
      else { r[k] = blockLines.join('\n').trim(); block = null; }
      continue;
    }
    if (block) { blockLines.push(rawLine.replace(/\r$/, '')); continue; }
    if (!trimmed || trimmed.charAt(0) === '#' || trimmed.charAt(0) === ';') continue;
    const si = trimmed.indexOf(' ');
    const dir = (si === -1 ? trimmed : trimmed.slice(0, si)).toLowerCase();
    const args = si === -1 ? '' : trimmed.slice(si + 1).trim();
    switch (dir) {
      case 'remote': {
        const p = args.split(/\s+/);
        r.remoteHost = p[0];
        if (p[1]) r.remotePort = p[1];
        break;
      }
      case 'proto':
        if (args.toLowerCase().indexOf('tcp') === 0) r.proto = 'tcp';
        else if (args.toLowerCase().indexOf('udp') === 0) r.proto = 'udp';
        break;
      case 'port':
        if (!r.remotePort) r.remotePort = args.trim();
        break;
      case 'cipher': r.cipher = args.trim(); break;
      case 'data-ciphers': if (!r.cipher) r.cipher = args.split(':')[0].trim(); break;
      case 'auth': r.auth = args.trim(); break;
      case 'comp-lzo': r.compLzo = args.trim() || 'yes'; break;
      case 'dev':
      case 'dev-type':
        if (args.toLowerCase().indexOf('tun') === 0) r.dev = 'tun';
        else if (args.toLowerCase().indexOf('tap') === 0) r.dev = 'tap';
        break;
      case 'key-direction': r.keyDirection = args.trim(); break;
      case 'auth-user-pass': r.authUserPass = true; break;
      case 'tun-mtu':
      case 'link-mtu': if (!r.mtu) r.mtu = args.trim(); break;
      case 'ping': r.ping = args.trim(); break;
      case 'ping-restart': r.pingRestart = args.trim(); break;
      case 'keepalive': {
        const p = args.split(/\s+/);
        if (p[0]) r.ping = p[0];
        if (p[1]) r.pingRestart = p[1];
        break;
      }
      default: break;
    }
  }
  return r;
}

// ------------------------------------------------------------
// VPNGate CSV 解析（沿用原项目稳健策略：前13固定 + 末尾base64）
// ------------------------------------------------------------
function parseVpnGateCsv(text) {
  const out = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.charAt(0) === '*' || line.charAt(0) === '#') continue;
    const parts = rawLine.split(',');
    if (parts.length < 15) continue;
    const num = (x) => Number(x) || 0;
    out.push({
      hostName: parts[0],
      ip: parts[1],
      score: num(parts[2]),
      ping: num(parts[3]),
      speed: num(parts[4]),
      countryLong: parts[5],
      countryShort: parts[6],
      numSessions: num(parts[7]),
      uptime: num(parts[8]),
      totalUsers: num(parts[9]),
      totalTraffic: num(parts[10]),
      logType: parts[11],
      operator: parts[12],
      message: parts.slice(13, parts.length - 1).join(','),
      configDataBase64: parts[parts.length - 1].trim(),
    });
  }
  return out;
}

// base64 -> UTF-8 字符串（Worker 运行时）
function b64Utf8(b64) {
  const clean = String(b64).replace(/\s+/g, '');
  const bin = atob(clean);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder('utf-8').decode(bytes);
}
function clampInt(v, lo, hi, dft) {
  const n = parseInt(v, 10);
  if (isNaN(n)) return dft;
  return Math.max(lo, Math.min(hi, n));
}
function jsonResponse(obj, status, ttl, degraded) {
  const headers = {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': '*',
    'cache-control': ttl ? 'public, max-age=' + ttl : 'no-store',
    'x-vg-version': CONFIG.APP_VERSION + '#' + CONFIG.ACCOUNT_TAG,
  };
  const dg = (degraded || []).filter(Boolean);
  if (dg.length) headers['x-vg-degraded'] = dg.join(','); // M3
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers,
  });
}