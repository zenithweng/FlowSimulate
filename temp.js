
const canvas = document.getElementById('flowCanvas');
const ctx = canvas.getContext('2d');
let showLabels = true;
let flowEnabled = true;
let flowOffset = 0;
let scale = 1, offsetX = 0, offsetY = 0;

const styles = {
  solid:  { fill: '#5b8cc4', stroke: '#3a6ea5', text: '#fff' },
  tank:   { fill: '#6a9bd3', stroke: '#3a6ea5', text: '#fff' },
  reagent:{ fill: '#9f7cc4', stroke: '#6a4c9c', text: '#fff' },
  product:{ fill: '#fff8e6', stroke: '#e6a23c', text: '#b87a00' }
};

// 分区背景矩形（逻辑坐标）
const zones = [
  { x: 30, y: 10, w: 580, h: 210, label: '锰回收系统', color: 'rgba(159,124,196,0.12)' },
  { x: 620, y: 10, w: 780, h: 210, label: '氨回收系统', color: 'rgba(64,191,191,0.12)' },
  { x: 30, y: 250, w: 760, h: 150, label: '资源化工段', color: 'rgba(224,176,107,0.14)' },
  { x: 800, y: 400, w: 760, h: 150, label: '无害化工段', color: 'rgba(91,140,196,0.12)' }
];

const nodes = [
  { id: 'L', text: '中转桶',       type: 'tank',   x: 520, y: 150, w: 110, h: 55 },
  { id: 'M', text: '吹脱',         type: 'tank',   x: 1040, y: 150, w: 80, h: 55 },
  { id: 'T', text: '沉淀',         type: 'tank',   x: 860, y: 150, w: 80, h: 55 },

  { id: 'S', text: '锰盐',         type: 'product', x: 360, y:  45, w: 90, h: 50 },
  { id: 'N', text: '沉锰',         type: 'reagent', x: 520, y:  45, w: 80, h: 50 },
  { id: 'O', text: '碱化',         type: 'reagent', x: 760, y:  45, w: 80, h: 50 },
  { id: 'P', text: '蒸氨',         type: 'reagent', x: 1040, y: 45, w: 80, h: 50 },
  { id: 'Q', text: '中和',         type: 'reagent', x: 1200, y: 45, w: 80, h: 50 },

  { id: 'A', text: '原渣',         type: 'solid',  x:  80, y: 330, w: 100, h: 55 },
  { id: 'C', text: '资源化化浆',   type: 'tank',   x: 220, y: 330, w: 120, h: 55 },
  { id: 'D', text: '进料',         type: 'solid',  x: 380, y: 330, w: 80, h: 50 },
  { id: 'E', text: '洗涤',         type: 'solid',  x: 520, y: 330, w: 80, h: 50 },
  { id: 'F', text: '压榨吹扫',     type: 'solid',  x: 680, y: 330, w: 100, h: 55 },

  { id: 'G', text: '无害化化浆',   type: 'tank',   x: 880, y: 470, w: 110, h: 55 },
  { id: 'H', text: '进料',         type: 'solid',  x: 1060, y: 470, w: 80, h: 50 },
  { id: 'I', text: '洗涤',         type: 'solid',  x: 1220, y: 470, w: 80, h: 50 },
  { id: 'J', text: '压榨吹扫',     type: 'solid',  x: 1380, y: 470, w: 100, h: 55 },

  { id: 'K', text: '出渣',         type: 'solid',  x: 1640, y: 470, w: 80, h: 50 },

  { id: 'R', text: '洗涤中转',     type: 'tank',   x: 1220, y: 590, w: 110, h: 55 }
];

const links = [
  { from: 'A', to: 'C', label: '',     style: 'slag' },
  { from: 'C', to: 'D', label: '',     style: 'slag' },
  { from: 'D', to: 'E', label: '渣',   style: 'slag' },
  { from: 'E', to: 'F', label: '渣',   style: 'slag' },
  { from: 'F', to: 'G', label: '渣',   style: 'slag',    way: [[760, 330], [760, 470]] },
  { from: 'G', to: 'H', label: '',     style: 'slag' },
  { from: 'H', to: 'I', label: '渣',   style: 'slag' },
  { from: 'I', to: 'J', label: '渣',   style: 'slag' },
  { from: 'J', to: 'K', label: '渣',   style: 'slag' },

  { from: 'D', to: 'L', label: '水',   style: 'recycle', way: [[380, 150]] },
  { from: 'E', to: 'L', label: '水',   style: 'recycle' },
  { from: 'F', to: 'L', label: '水',   style: 'recycle', way: [[680, 150]] },
  { from: 'L', to: 'C', label: '水',   style: 'water',   way: [[220, 150]] },

  { from: 'H', to: 'M', label: '',     style: 'recycle', way: [[1060, 150]] },
  { from: 'J', to: 'M', label: '水',   style: 'recycle', way: [[1380, 150]] },
  { from: 'M', to: 'T', label: '浆',   style: 'yellow' },
  { from: 'T', to: 'G', label: '水',   style: 'yellow',  way: [[860, 470]] },

  { from: 'I', to: 'R', label: '水',   style: 'recycle' },
  { from: 'Q', to: 'I', label: '水',   style: 'water',   way: [[1200, 470]] },
  { from: 'R', to: 'E', label: '',     style: 'water',   way: [[520, 590]] },

  { from: 'L', to: 'N', label: '',     style: 'reagent' },
  { from: 'N', to: 'O', label: '',     style: 'reagent' },
  { from: 'O', to: 'P', label: '',     style: 'reagent' },
  { from: 'P', to: 'Q', label: '',     style: 'reagent' },
  { from: 'P', to: 'M', label: '渣',   style: 'yellow' },
  { from: 'N', to: 'S', label: '',     style: 'product' }
];

function nodeById(id) { return nodes.find(n => n.id === id); }

function nodeRect(n) {
  return {
    x: offsetX + (n.x - n.w/2) * scale,
    y: offsetY + (n.y - n.h/2) * scale,
    w: n.w * scale,
    h: n.h * scale,
    cx: offsetX + n.x * scale,
    cy: offsetY + n.y * scale
  };
}

function edgePoint(n, dx, dy) {
  const halfW = n.w / 2, halfH = n.h / 2;
  if (dx === 0 && dy === 0) return { x: offsetX + n.x * scale, y: offsetY + n.y * scale };
  const tx = dx > 0 ? halfW / dx : dx < 0 ? -halfW / dx : Infinity;
  const ty = dy > 0 ? halfH / dy : dy < 0 ? -halfH / dy : Infinity;
  const t = Math.min(tx, ty);
  return { x: offsetX + (n.x + dx * t) * scale, y: offsetY + (n.y + dy * t) * scale };
}

function toCanvas(p) { return { x: offsetX + p[0] * scale, y: offsetY + p[1] * scale }; }

function linkPoints(l) {
  const a = nodeById(l.from), b = nodeById(l.to);
  const way = (l.way || []).map(toCanvas);
  const pts = [];
  const first = way.length ? way[0] : toCanvas([b.x, b.y]);
  pts.push(edgePoint(a, first.x - (offsetX + a.x * scale), first.y - (offsetY + a.y * scale)));
  way.forEach(p => pts.push(p));
  const last = way.length ? way[way.length - 1] : pts[0];
  pts.push(edgePoint(b, last.x - (offsetX + b.x * scale), last.y - (offsetY + b.y * scale)));
  return pts;
}

function resize() {
  const rect = canvas.parentElement.getBoundingClientRect();
  canvas.width = rect.width * window.devicePixelRatio;
  canvas.height = rect.height * window.devicePixelRatio;
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';
  ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  const bbox = { minX: 20, maxX: 1700, minY: 10, maxY: 660 };
  scale = Math.min(rect.width / (bbox.maxX - bbox.minX + 120), rect.height / (bbox.maxY - bbox.minY + 80));
  offsetX = (rect.width - (bbox.maxX - bbox.minX) * scale) / 2 - bbox.minX * scale;
  offsetY = (rect.height - (bbox.maxY - bbox.minY) * scale) / 2 - bbox.minY * scale;
  draw();
}

function drawZones() {
  zones.forEach(z => {
    const x = offsetX + z.x * scale, y = offsetY + z.y * scale;
    const w = z.w * scale, h = z.h * scale;
    ctx.save();
    ctx.fillStyle = z.color;
    ctx.strokeStyle = 'rgba(80,100,60,0.25)';
    ctx.lineWidth = 1.5 * scale;
    ctx.setLineDash([6 * scale, 4 * scale]);
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 12 * scale);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#5a7a4a';
    ctx.font = `bold ${Math.max(14 * scale, 11)}px "Microsoft YaHei"`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(z.label, x + 10 * scale, y + 8 * scale);
    ctx.restore();
  });
}

function drawNode(n) {
  ctx.save();
  const r = nodeRect(n);
  const s = styles[n.type];

  // 阴影
  ctx.shadowColor = 'rgba(0,0,0,0.15)';
  ctx.shadowBlur = 6 * scale;
  ctx.shadowOffsetY = 3 * scale;

  // 渐变填充
  const grad = ctx.createLinearGradient(r.x, r.y, r.x + r.w, r.y + r.h);
  grad.addColorStop(0, s.fill);
  grad.addColorStop(1, lighten(s.fill, 0.15));
  ctx.fillStyle = grad;
  ctx.strokeStyle = s.stroke;
  ctx.lineWidth = 2 * scale;
  const radius = Math.min(12 * scale, r.w / 2);
  ctx.beginPath();
  ctx.roundRect(r.x, r.y, r.w, r.h, radius);
  ctx.fill();
  ctx.stroke();

  ctx.shadowColor = 'transparent';

  // 横排文字
  ctx.fillStyle = s.text;
  ctx.font = `bold ${Math.max(12 * scale, 10)}px "Microsoft YaHei"`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(n.text, r.cx, r.cy);
  ctx.restore();
}

function lighten(hex, amt) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.round((num >> 16) + (255 - (num >> 16)) * amt));
  const g = Math.min(255, Math.round(((num >> 8) & 0x00FF) + (255 - ((num >> 8) & 0x00FF)) * amt));
  const b = Math.min(255, Math.round((num & 0x0000FF) + (255 - (num & 0x0000FF)) * amt));
  return `rgb(${r},${g},${b})`;
}

function pipeColors(style) {
  if (style === 'slag')    return { main: '#d33', flow: '#ff9999', width: 4 };
  if (style === 'water')   return { main: '#40bfbf', flow: '#a6f0f0', width: 3 };
  if (style === 'recycle') return { main: '#45a36c', flow: '#9fe6b8', width: 3 };
  if (style === 'yellow')  return { main: '#e6b800', flow: '#fff099', width: 3 };
  if (style === 'reagent') return { main: '#9f7cc4', flow: '#e6d0f5', width: 3 };
  return { main: '#e6a23c', flow: '#ffe6b3', width: 3 };
}

function drawArrowSegment(p1, p2, style) {
  const c = pipeColors(style);
  const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
  const len = Math.hypot(p2.x - p1.x, p2.y - p1.y);
  if (len < 0.5) return { angle, len };

  ctx.save();
  ctx.translate(p1.x, p1.y);
  ctx.rotate(angle);

  // 阴影
  ctx.shadowColor = 'rgba(0,0,0,0.12)';
  ctx.shadowBlur = 4 * scale;
  ctx.shadowOffsetY = 2 * scale;

  // 主线
  ctx.strokeStyle = c.main;
  ctx.lineWidth = c.width * scale;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(len, 0);
  ctx.stroke();

  ctx.shadowColor = 'transparent';

  // 流动高亮
  if (flowEnabled) {
    ctx.strokeStyle = c.flow;
    ctx.lineWidth = Math.max(1.5 * scale, 1);
    const dash = [8 * scale, 10 * scale];
    ctx.setLineDash(dash);
    ctx.lineDashOffset = -flowOffset;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(len, 0);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.restore();
  return { angle, len };
}

function drawFlowLine(path, style, label) {
  if (path.length < 2) return;
  const c = pipeColors(style);

  for (let i = 0; i < path.length - 1; i++) drawArrowSegment(path[i], path[i + 1], style);

  // 末端箭头
  const p1 = path[path.length - 2], p2 = path[path.length - 1];
  const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
  const headLen = 12 * scale;
  ctx.save();
  ctx.fillStyle = c.main;
  ctx.shadowColor = 'rgba(0,0,0,0.12)';
  ctx.shadowBlur = 4 * scale;
  ctx.shadowOffsetY = 2 * scale;
  ctx.beginPath();
  ctx.moveTo(p2.x, p2.y);
  ctx.lineTo(p2.x - headLen * Math.cos(angle - Math.PI/6), p2.y - headLen * Math.sin(angle - Math.PI/6));
  ctx.lineTo(p2.x - headLen * Math.cos(angle + Math.PI/6), p2.y - headLen * Math.sin(angle + Math.PI/6));
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // 标签
  if (showLabels && label) {
    let best = { i: 0, len: 0 };
    for (let i = 0; i < path.length - 1; i++) {
      const len = Math.hypot(path[i+1].x - path[i].x, path[i+1].y - path[i].y);
      if (len > best.len) best = { i, len };
    }
    const a = path[best.i], b = path[best.i + 1];
    const nx = (b.y - a.y) / best.len;
    const ny = -(b.x - a.x) / best.len;
    ctx.save();
    ctx.fillStyle = c.main;
    ctx.font = `bold ${Math.max(11 * scale, 10)}px "Microsoft YaHei"`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    const mx = (a.x + b.x) / 2 + nx * (8 * scale);
    const my = (a.y + b.y) / 2 + ny * (8 * scale);
    ctx.fillText(label, mx, my);
    ctx.restore();
  }
}

function draw() {
  const rect = canvas.getBoundingClientRect();
  ctx.clearRect(0, 0, rect.width, rect.height);
  drawZones();
  links.forEach(l => drawFlowLine(linkPoints(l), l.style, l.label));
  nodes.forEach(drawNode);
}

function animate() {
  if (flowEnabled) {
    flowOffset += 1.5 * scale;
    draw();
  }
  requestAnimationFrame(animate);
}

function hitTestNode(mx, my) {
  for (let i = nodes.length - 1; i >= 0; i--) {
    const r = nodeRect(nodes[i]);
    if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) return nodes[i];
  }
  return null;
}

function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1, len2 = dx*dx + dy*dy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((px-x1)*dx + (py-y1)*dy) / len2));
  return Math.hypot(px - (x1 + t*dx), py - (y1 + t*dy));
}

function distToPolyline(px, py, pts) {
  let best = Infinity;
  for (let i = 0; i < pts.length - 1; i++) {
    best = Math.min(best, distToSegment(px, py, pts[i].x, pts[i].y, pts[i+1].x, pts[i+1].y));
  }
  return best;
}

function hitTestLink(mx, my) {
  let best = null, bestD = 10 * scale;
  links.forEach(l => {
    const d = distToPolyline(mx, my, linkPoints(l));
    if (d < bestD) { bestD = d; best = l; }
  });
  return best;
}

function showProperties(obj, type) {
  const panel = document.getElementById('propPanel');
  if (type === 'node') {
    let paramsHtml = '';
    if (obj.id === 'A') {
      const p = obj.params || { total: 1, water: 25, mn: 1, nh3n: 0.5, mg: 0.5 };
      const waterWeight = p.total * p.water / 100;
      const dryWeight = p.total - waterWeight;
      paramsHtml = `
        <hr style="margin:14px 0;border-color:#ddd">
        <h3 style="font-size:14px;color:#3a5a40;margin-bottom:10px">原料参数</h3>
        <div class="param-row">
          <label>总重</label>
          <input type="number" id="p-total" value="${p.total}" placeholder="t">
          <span class="unit">t</span>
        </div>
        <div class="param-row">
          <label>含水率</label>
          <input type="number" id="p-water" value="${p.water}" placeholder="%">
          <span class="unit">%</span>
        </div>
        <div class="param-row">
          <label>锰</label>
          <input type="number" id="p-mn" value="${p.mn}" placeholder="%">
          <span class="unit">%</span>
        </div>
        <div class="param-row">
          <label>氨氮</label>
          <input type="number" id="p-nh3n" value="${p.nh3n}" placeholder="%">
          <span class="unit">%</span>
        </div>
        <div class="param-row">
          <label>镁</label>
          <input type="number" id="p-mg" value="${p.mg}" placeholder="%">
          <span class="unit">%</span>
        </div>
        <button class="save-btn" onclick="saveParams('${obj.id}')">保存参数</button>
        <hr style="margin:14px 0;border-color:#ddd">
        <h3 style="font-size:14px;color:#3a5a40;margin-bottom:10px">重量拆分</h3>
        <div class="param-row">
          <label>水重</label>
          <span class="ro-value">${waterWeight.toFixed(3)}</span>
          <span class="unit">t</span>
        </div>
        <div class="param-row">
          <label>干渣重</label>
          <span class="ro-value">${dryWeight.toFixed(3)}</span>
          <span class="unit">t</span>
        </div>
      `;
    } else if (obj.id === 'L') {
      const lp = obj.params || { toN: 0.5 };
      const d = calcResults['D'] || notCalculated();
      const e = calcResults['E'] || notCalculated();
      const f = calcResults['F'] || notCalculated();
      const total = d.toL + e.toL.water + f.toL;
      let mnPct = 0, nh3nPct = 0, mgPct = 0;
      if (total > 0) {
        mnPct = (d.toL * d.mn + e.toL.water * e.toL.mn + f.toL * f.mn) / total;
        nh3nPct = (d.toL * d.nh3n + e.toL.water * e.toL.nh3n + f.toL * f.nh3n) / total;
        mgPct = (d.toL * d.mg + e.toL.water * e.toL.mg + f.toL * f.mg) / total;
      }
      const mnKg = total * mnPct / 100 * 1000;
      const nh3nKg = total * nh3nPct / 100 * 1000;
      const mgKg = total * mgPct / 100 * 1000;
      paramsHtml = `
        <hr style="margin:14px 0;border-color:#ddd">
        <h3 style="font-size:14px;color:#3a5a40;margin-bottom:10px">中转桶参数</h3>
        <div class="param-row">
          <label>去沉锰水量</label>
          <input type="number" id="p-toN" value="${lp.toN}" placeholder="t">
          <span class="unit">t</span>
        </div>
        <button class="save-btn" onclick="saveParams('${obj.id}')">保存参数</button>
        <hr style="margin:14px 0;border-color:#ddd">
        <h3 style="font-size:14px;color:#3a5a40;margin-bottom:10px">计算结果（汇总来水）</h3>
        <div class="param-row"><label>总水量</label><span class="ro-value">${total.toFixed(3)}</span><span class="unit">t</span></div>
        <div class="param-row"><label>锰</label><span class="ro-value">${mnPct.toFixed(2)}</span><span class="unit">%</span></div>
        <div class="param-row"><label>氨氮</label><span class="ro-value">${nh3nPct.toFixed(2)}</span><span class="unit">%</span></div>
        <div class="param-row"><label>镁</label><span class="ro-value">${mgPct.toFixed(2)}</span><span class="unit">%</span></div>
        <hr style="margin:14px 0;border-color:#ddd">
        <h3 style="font-size:14px;color:#3a5a40;margin-bottom:10px">元素重量</h3>
        <div class="param-row">
          <label>锰</label>
          <span class="ro-value">${mnKg.toFixed(3)}</span>
          <span class="unit">kg</span>
        </div>
        <div class="param-row">
          <label>氨氮</label>
          <span class="ro-value">${nh3nKg.toFixed(3)}</span>
          <span class="unit">kg</span>
        </div>
        <div class="param-row">
          <label>镁</label>
          <span class="ro-value">${mgKg.toFixed(3)}</span>
          <span class="unit">kg</span>
        </div>
      `;
    } else if (obj.id === 'N') {
      const np = obj.params || { outMn: 200 };
      paramsHtml = `
        <hr style="margin:14px 0;border-color:#ddd">
        <h3 style="font-size:14px;color:#3a5a40;margin-bottom:10px">沉锰参数</h3>
        <div class="param-row">
          <label>出水锰</label>
          <input type="number" id="p-outMn" value="${np.outMn}" placeholder="mg/L">
          <span class="unit">mg/L</span>
        </div>
        <button class="save-btn" onclick="saveParams('${obj.id}')">保存参数</button>
      `;
    } else if (obj.id === 'O') {
      const op = obj.params || { ph: 12 };
      paramsHtml = `
        <hr style="margin:14px 0;border-color:#ddd">
        <h3 style="font-size:14px;color:#3a5a40;margin-bottom:10px">碱化参数</h3>
        <div class="param-row">
          <label>目标pH</label>
          <input type="number" id="p-ph" value="${op.ph}" step="0.1">
          <span class="unit">-</span>
        </div>
        <button class="save-btn" onclick="saveParams('${obj.id}')">保存参数</button>
      `;
    } else if (obj.id === 'P') {
      const pp = obj.params || { outNh3n: 50 };
      paramsHtml = `
        <hr style="margin:14px 0;border-color:#ddd">
        <h3 style="font-size:14px;color:#3a5a40;margin-bottom:10px">蒸氨参数</h3>
        <div class="param-row">
          <label>蒸氨后氨氮</label>
          <input type="number" id="p-outNh3n" value="${pp.outNh3n}" placeholder="mg/L">
          <span class="unit">mg/L</span>
        </div>
        <button class="save-btn" onclick="saveParams('${obj.id}')">保存参数</button>
      `;
    } else if (obj.id === 'Q') {
      const qp = obj.params || { ph: 8 };
      const q = calcResults['Q'] || notCalculated();
      paramsHtml = `
        <hr style="margin:14px 0;border-color:#ddd">
        <h3 style="font-size:14px;color:#3a5a40;margin-bottom:10px">中和参数</h3>
        <div class="param-row">
          <label>目标pH</label>
          <input type="number" id="p-ph" value="${qp.ph}" step="0.1">
          <span class="unit">-</span>
        </div>
        <button class="save-btn" onclick="saveParams('${obj.id}')">保存参数</button>
        <hr style="margin:14px 0;border-color:#ddd">
        <h3 style="font-size:14px;color:#3a5a40;margin-bottom:10px">计算结果（去洗涤）</h3>
        <div class="param-row"><label>总水量</label><span class="ro-value">${q.total.toFixed(3)}</span><span class="unit">t</span></div>
        <div class="param-row"><label>锰</label><span class="ro-value">${q.mn.toFixed(2)}</span><span class="unit">%</span></div>
        <div class="param-row"><label>氨氮</label><span class="ro-value">${q.nh3n.toFixed(2)}</span><span class="unit">%</span></div>
        <div class="param-row"><label>镁</label><span class="ro-value">${q.mg.toFixed(2)}</span><span class="unit">%</span></div>
      `;
    } else if (obj.id === 'T') {
      const tp = obj.params || { mgRemoval: 20 };
      const t = calcResults['T'] || notCalculated();
      paramsHtml = `
        <hr style="margin:14px 0;border-color:#ddd">
        <h3 style="font-size:14px;color:#3a5a40;margin-bottom:10px">沉淀参数</h3>
        <div class="param-row">
          <label>镁去除比例</label>
          <input type="number" id="p-mgRemoval" value="${tp.mgRemoval}" placeholder="%">
          <span class="unit">%</span>
        </div>
        <button class="save-btn" onclick="saveParams('${obj.id}')">保存参数</button>
        <hr style="margin:14px 0;border-color:#ddd">
        <h3 style="font-size:14px;color:#3a5a40;margin-bottom:10px">计算结果（去无害化）</h3>
        <div class="param-row"><label>总水量</label><span class="ro-value">${t.total.toFixed(3)}</span><span class="unit">t</span></div>
        <div class="param-row"><label>锰</label><span class="ro-value">${t.mn.toFixed(2)}</span><span class="unit">%</span></div>
        <div class="param-row"><label>氨氮</label><span class="ro-value">${t.nh3n.toFixed(2)}</span><span class="unit">%</span></div>
        <div class="param-row"><label>镁</label><span class="ro-value">${t.mg.toFixed(2)}</span><span class="unit">%</span></div>
      `;
    } else if (obj.id === 'M') {
      const mp = obj.params || { blowRate: 20, outNh3n: 0 };
      const m = calcResults['M'] || notCalculated();
      paramsHtml = `
        <hr style="margin:14px 0;border-color:#ddd">
        <h3 style="font-size:14px;color:#3a5a40;margin-bottom:10px">吹脱参数</h3>
        <div class="param-row">
          <label>吹脱率</label>
          <input type="number" id="p-blowRate" value="${mp.blowRate}" placeholder="%">
          <span class="unit">%</span>
        </div>
        <div class="param-row">
          <label>吹脱后氨氮</label>
          <input type="number" id="p-blowOutNh3n" value="${mp.outNh3n}" placeholder="mg/L">
          <span class="unit">mg/L</span>
        </div>
        <button class="save-btn" onclick="saveParams('${obj.id}')">保存参数</button>
        <hr style="margin:14px 0;border-color:#ddd">
        <h3 style="font-size:14px;color:#3a5a40;margin-bottom:10px">计算结果（出水）</h3>
        <div class="param-row"><label>总水量</label><span class="ro-value">${m.total.toFixed(3)}</span><span class="unit">t</span></div>
        <div class="param-row"><label>锰</label><span class="ro-value">${m.mn.toFixed(2)}</span><span class="unit">%</span></div>
        <div class="param-row"><label>氨氮</label><span class="ro-value">${m.nh3n.toFixed(2)}</span><span class="unit">%</span></div>
        <div class="param-row"><label>镁</label><span class="ro-value">${m.mg.toFixed(2)}</span><span class="unit">%</span></div>
      `;
    } else if (obj.id === 'S') {
      const lp = nodeById('L').params || { toN: 0.5 };
      const np = nodeById('N').params || { outMn: 200 };
      const waterT = Number(lp.toN);
      const mnKg = waterT * Number(np.outMn) / 1000;
      paramsHtml = `
        <hr style="margin:14px 0;border-color:#ddd">
        <h3 style="font-size:14px;color:#3a5a40;margin-bottom:10px">产品参数</h3>
        <div class="param-row">
          <label>锰量</label>
          <span class="ro-value">${mnKg.toFixed(3)}</span>
          <span class="unit">kg</span>
          <span class="formula">= 去沉锰水(${waterT}t) × ${np.outMn}mg/L ÷ 1000</span>
        </div>
      `;
    } else if (obj.id === 'C') {
      const src = nodeById('A').params || { total: 1, water: 25, mn: 1, nh3n: 0.5, mg: 0.5 };
      const lp = nodeById('L').params || { toN: 0 };
      const fromL = { water: Number(lp.toN), mn: 0, nh3n: 0, mg: 0 }; // 中转桶回水当前元素按 0
      const total = Number(src.total) + fromL.water;
      const cWaterPct = (Number(src.water) * Number(src.total) + fromL.water * 100) / total;
      const cMnKg = Number(src.mn) / 100 * Number(src.total) * 1000;
      const cNh3nKg = Number(src.nh3n) / 100 * Number(src.total) * 1000;
      const cMgKg = Number(src.mg) / 100 * Number(src.total) * 1000;
      const waterWeight = total * cWaterPct / 100;
      const dryWeight = total - waterWeight;
      paramsHtml = `
        <hr style="margin:14px 0;border-color:#ddd">
        <h3 style="font-size:14px;color:#3a5a40;margin-bottom:10px">浆液参数（计算值）</h3>
        <div class="param-row">
          <label>总重</label>
          <span class="ro-value">${total.toFixed(3)}</span>
          <span class="unit">t</span>
          <span class="formula">= 原渣(${src.total}t) + 中转桶(${fromL.water.toFixed(3)}t)</span>
        </div>
        <div class="param-row">
          <label>含水率</label>
          <span class="ro-value">${cWaterPct.toFixed(1)}</span>
          <span class="unit">%</span>
        </div>
        <hr style="margin:14px 0;border-color:#ddd">
        <h3 style="font-size:14px;color:#3a5a40;margin-bottom:10px">元素重量</h3>
        <div class="param-row">
          <label>锰</label>
          <span class="ro-value">${cMnKg.toFixed(3)}</span>
          <span class="unit">kg</span>
        </div>
        <div class="param-row">
          <label>氨氮</label>
          <span class="ro-value">${cNh3nKg.toFixed(3)}</span>
          <span class="unit">kg</span>
        </div>
        <div class="param-row">
          <label>镁</label>
          <span class="ro-value">${cMgKg.toFixed(3)}</span>
          <span class="unit">kg</span>
        </div>
        <hr style="margin:14px 0;border-color:#ddd">
        <h3 style="font-size:14px;color:#3a5a40;margin-bottom:10px">重量拆分</h3>
        <div class="param-row">
          <label>水重</label>
          <span class="ro-value">${waterWeight.toFixed(3)}</span>
          <span class="unit">t</span>
        </div>
        <div class="param-row">
          <label>干渣重</label>
          <span class="ro-value">${dryWeight.toFixed(3)}</span>
          <span class="unit">t</span>
        </div>
      `;
    } else if (obj.id === 'D') {
      const d = calcResults['D'] || notCalculated();
      const dp = obj.params || { slagWater: 40 };
      paramsHtml = `
        <hr style="margin:14px 0;border-color:#ddd">
        <h3 style="font-size:14px;color:#3a5a40;margin-bottom:10px">进料参数</h3>
        <div class="param-row">
          <label>渣中含水</label>
          <input type="number" id="p-slagWater" value="${dp.slagWater}" placeholder="%">
          <span class="unit">%</span>
        </div>
        <button class="save-btn" onclick="saveParams('${obj.id}')">保存参数</button>
        <hr style="margin:14px 0;border-color:#ddd">
        <h3 style="font-size:14px;color:#3a5a40;margin-bottom:10px">计算结果</h3>
        <div class="param-row">
          <label>含水率</label>
          <span class="ro-value">${d.water.toFixed(1)}</span>
          <span class="unit">%</span>
        </div>
        <div class="param-row">
          <label>去中转桶</label>
          <span class="ro-value">${d.toL.toFixed(3)}</span>
          <span class="unit">t</span>
        </div>
        <hr style="margin:14px 0;border-color:#ddd">
        <h3 style="font-size:14px;color:#3a5a40;margin-bottom:10px">元素重量</h3>
        <div class="param-row">
          <label>锰</label>
          <span class="ro-value">${(d.total * d.mn / 100 * 1000).toFixed(3)}</span>
          <span class="unit">kg</span>
        </div>
        <div class="param-row">
          <label>氨氮</label>
          <span class="ro-value">${(d.total * d.nh3n / 100 * 1000).toFixed(3)}</span>
          <span class="unit">kg</span>
        </div>
        <div class="param-row">
          <label>镁</label>
          <span class="ro-value">${(d.total * d.mg / 100 * 1000).toFixed(3)}</span>
          <span class="unit">kg</span>
        </div>
        <hr style="margin:14px 0;border-color:#ddd">
        <h3 style="font-size:14px;color:#3a5a40;margin-bottom:10px">重量拆分</h3>
        <div class="param-row">
          <label>总重</label>
          <span class="ro-value">${d.total.toFixed(3)}</span>
          <span class="unit">t</span>
        </div>
        <div class="param-row">
          <label>水重</label>
          <span class="ro-value">${d.waterAbs.toFixed(3)}</span>
          <span class="unit">t</span>
        </div>
        <div class="param-row">
          <label>干渣重</label>
          <span class="ro-value">${d.dryWeight.toFixed(3)}</span>
          <span class="unit">t</span>
        </div>
      `;
    } else if (obj.id === 'E') {
      const e = calcResults['E'] || notCalculated();
      const ep = obj.params || { washEff: 80 };
      paramsHtml = `
        <hr style="margin:14px 0;border-color:#ddd">
        <h3 style="font-size:14px;color:#3a5a40;margin-bottom:10px">洗涤参数</h3>
        <div class="param-row">
          <label>洗涤效率</label>
          <input type="number" id="p-washEff" value="${ep.washEff}" placeholder="%">
          <span class="unit">%</span>
        </div>
        <button class="save-btn" onclick="saveParams('${obj.id}')">保存参数</button>
        <hr style="margin:14px 0;border-color:#ddd">
        <h3 style="font-size:14px;color:#3a5a40;margin-bottom:10px">计算结果（去中转桶）</h3>
        <div class="param-row">
          <label>含水率</label>
          <span class="ro-value">${e.toL.water.toFixed(2)}</span>
          <span class="unit">%</span>
        </div>
        <div class="param-row">
          <label>锰</label>
          <span class="ro-value">${e.toL.mn.toFixed(2)}</span>
          <span class="unit">%</span>
        </div>
        <div class="param-row">
          <label>氨氮</label>
          <span class="ro-value">${e.toL.nh3n.toFixed(2)}</span>
          <span class="unit">%</span>
        </div>
        <div class="param-row">
          <label>镁</label>
          <span class="ro-value">${e.toL.mg.toFixed(2)}</span>
          <span class="unit">%</span>
        </div>
        <hr style="margin:14px 0;border-color:#ddd">
        <h3 style="font-size:14px;color:#3a5a40;margin-bottom:10px">计算结果（留在渣里）</h3>
        <div class="param-row">
          <label>含水率</label>
          <span class="ro-value">${e.water.toFixed(2)}</span>
          <span class="unit">%</span>
        </div>
        <div class="param-row">
          <label>锰</label>
          <span class="ro-value">${e.mn.toFixed(2)}</span>
          <span class="unit">%</span>
        </div>
        <div class="param-row">
          <label>氨氮</label>
          <span class="ro-value">${e.nh3n.toFixed(2)}</span>
          <span class="unit">%</span>
        </div>
        <div class="param-row">
          <label>镁</label>
          <span class="ro-value">${e.mg.toFixed(2)}</span>
          <span class="unit">%</span>
        </div>
        <hr style="margin:14px 0;border-color:#ddd">
        <h3 style="font-size:14px;color:#3a5a40;margin-bottom:10px">重量拆分（留在渣里）</h3>
        <div class="param-row">
          <label>总重</label>
          <span class="ro-value">${e.stayTotal.toFixed(3)}</span>
          <span class="unit">t</span>
        </div>
        <div class="param-row">
          <label>水重</label>
          <span class="ro-value">${e.stayWater.toFixed(3)}</span>
          <span class="unit">t</span>
        </div>
        <div class="param-row">
          <label>干渣重</label>
          <span class="ro-value">${e.stayDry.toFixed(3)}</span>
          <span class="unit">t</span>
        </div>
      `;
    } else if (obj.id === 'F') {
      const e = calcResults['E'] || notCalculated();
      const fp = obj.params || { outSlagWater: 25 };
      const fw = Number(fp.outSlagWater);
      const fTotal = e.stayDry / (1 - fw / 100);
      const fWater = fTotal - e.stayDry;
      const toL = Math.max(0, e.stayWater - fWater);
      const ratio = e.stayWater > 0 ? fWater / e.stayWater : 0;
      const f = {
        water: fWater / fTotal * 100,
        mn: e.mn * ratio,
        nh3n: e.nh3n * ratio,
        mg: e.mg * ratio
      };
      paramsHtml = `
        <hr style="margin:14px 0;border-color:#ddd">
        <h3 style="font-size:14px;color:#3a5a40;margin-bottom:10px">压榨吹扫参数</h3>
        <div class="param-row">
          <label>出渣含水率</label>
          <input type="number" id="p-outSlagWater" value="${fp.outSlagWater}" placeholder="%">
          <span class="unit">%</span>
        </div>
        <button class="save-btn" onclick="saveParams('${obj.id}')">保存参数</button>
        <hr style="margin:14px 0;border-color:#ddd">
        <h3 style="font-size:14px;color:#3a5a40;margin-bottom:10px">计算结果</h3>
        <div class="param-row">
          <label>含水率</label>
          <span class="ro-value">${f.water.toFixed(2)}</span>
          <span class="unit">%</span>
          <span class="formula">= 压榨后水量/出渣总量</span>
        </div>
        <div class="param-row">
          <label>锰</label>
          <span class="ro-value">${f.mn.toFixed(2)}</span>
          <span class="unit">%</span>
          <span class="formula">= 洗涤渣锰(${e.mn.toFixed(2)}%) × ${ratio.toFixed(2)}</span>
        </div>
        <div class="param-row">
          <label>氨氮</label>
          <span class="ro-value">${f.nh3n.toFixed(2)}</span>
          <span class="unit">%</span>
          <span class="formula">= 洗涤渣氨氮(${e.nh3n.toFixed(2)}%) × ${ratio.toFixed(2)}</span>
        </div>
        <div class="param-row">
          <label>镁</label>
          <span class="ro-value">${f.mg.toFixed(2)}</span>
          <span class="unit">%</span>
          <span class="formula">= 洗涤渣镁(${e.mg.toFixed(2)}%) × ${ratio.toFixed(2)}</span>
        </div>
        <div class="param-row">
          <label>去中转桶</label>
          <span class="ro-value">${toL.toFixed(3)}</span>
          <span class="unit">t</span>
          <span class="formula">= 洗涤渣水 − 出渣水</span>
        </div>
        <hr style="margin:14px 0;border-color:#ddd">
        <h3 style="font-size:14px;color:#3a5a40;margin-bottom:10px">重量拆分（出渣）</h3>
        <div class="param-row">
          <label>总重</label>
          <span class="ro-value">${fTotal.toFixed(3)}</span>
          <span class="unit">t</span>
        </div>
        <div class="param-row">
          <label>水重</label>
          <span class="ro-value">${fWater.toFixed(3)}</span>
          <span class="unit">t</span>
        </div>
        <div class="param-row">
          <label>干渣重</label>
          <span class="ro-value">${e.stayDry.toFixed(3)}</span>
          <span class="unit">t</span>
        </div>
      `;
    } else if (obj.id === 'G') {
      const g = calcResults['G'] || notCalculated();
      paramsHtml = `
        <hr style="margin:14px 0;border-color:#ddd">
        <h3 style="font-size:14px;color:#3a5a40;margin-bottom:10px">无害化化浆参数（计算值）</h3>
        <div class="param-row"><label>含水率</label><span class="ro-value">${g.water.toFixed(1)}</span><span class="unit">%</span></div>
        <div class="param-row"><label>锰</label><span class="ro-value">${g.mn.toFixed(2)}</span><span class="unit">%</span></div>
        <div class="param-row"><label>氨氮</label><span class="ro-value">${g.nh3n.toFixed(2)}</span><span class="unit">%</span></div>
        <div class="param-row"><label>镁</label><span class="ro-value">${g.mg.toFixed(2)}</span><span class="unit">%</span></div>
        <hr style="margin:14px 0;border-color:#ddd">
        <h3 style="font-size:14px;color:#3a5a40;margin-bottom:10px">重量拆分</h3>
        <div class="param-row"><label>总重</label><span class="ro-value">${g.total.toFixed(3)}</span><span class="unit">t</span></div>
        <div class="param-row"><label>水重</label><span class="ro-value">${g.waterAbs.toFixed(3)}</span><span class="unit">t</span></div>
        <div class="param-row"><label>干渣重</label><span class="ro-value">${g.dryWeight.toFixed(3)}</span><span class="unit">t</span></div>
      `;
    } else if (obj.id === 'H') {
      const h = calcResults['H'] || notCalculated();
      const hp = obj.params || { slagWater: 40 };
      paramsHtml = `
        <hr style="margin:14px 0;border-color:#ddd">
        <h3 style="font-size:14px;color:#3a5a40;margin-bottom:10px">进料参数</h3>
        <div class="param-row">
          <label>渣中含水</label>
          <input type="number" id="p-slagWater" value="${hp.slagWater}" placeholder="%">
          <span class="unit">%</span>
        </div>
        <button class="save-btn" onclick="saveParams('${obj.id}')">保存参数</button>
        <hr style="margin:14px 0;border-color:#ddd">
        <h3 style="font-size:14px;color:#3a5a40;margin-bottom:10px">计算结果</h3>
        <div class="param-row"><label>含水率</label><span class="ro-value">${h.water.toFixed(1)}</span><span class="unit">%</span></div>
        <div class="param-row"><label>锰</label><span class="ro-value">${h.mn.toFixed(2)}</span><span class="unit">%</span></div>
        <div class="param-row"><label>氨氮</label><span class="ro-value">${h.nh3n.toFixed(2)}</span><span class="unit">%</span></div>
        <div class="param-row"><label>镁</label><span class="ro-value">${h.mg.toFixed(2)}</span><span class="unit">%</span></div>
        <div class="param-row"><label>去中转桶</label><span class="ro-value">${h.toL.toFixed(3)}</span><span class="unit">t</span></div>
        <hr style="margin:14px 0;border-color:#ddd">
        <h3 style="font-size:14px;color:#3a5a40;margin-bottom:10px">重量拆分</h3>
        <div class="param-row"><label>总重</label><span class="ro-value">${h.total.toFixed(3)}</span><span class="unit">t</span></div>
        <div class="param-row"><label>水重</label><span class="ro-value">${h.waterAbs.toFixed(3)}</span><span class="unit">t</span></div>
        <div class="param-row"><label>干渣重</label><span class="ro-value">${h.dryWeight.toFixed(3)}</span><span class="unit">t</span></div>
      `;
    } else if (obj.id === 'I') {
      const i = calcResults['I'] || notCalculated();
      const ip = obj.params || { washEff: 80 };
      paramsHtml = `
        <hr style="margin:14px 0;border-color:#ddd">
        <h3 style="font-size:14px;color:#3a5a40;margin-bottom:10px">洗涤参数</h3>
        <div class="param-row">
          <label>洗涤效率</label>
          <input type="number" id="p-washEff" value="${ip.washEff}" placeholder="%">
          <span class="unit">%</span>
        </div>
        <button class="save-btn" onclick="saveParams('${obj.id}')">保存参数</button>
        <hr style="margin:14px 0;border-color:#ddd">
        <h3 style="font-size:14px;color:#3a5a40;margin-bottom:10px">计算结果（去洗涤中转）</h3>
        <div class="param-row"><label>含水率</label><span class="ro-value">${i.toL.water.toFixed(2)}</span><span class="unit">%</span></div>
        <div class="param-row"><label>锰</label><span class="ro-value">${i.toL.mn.toFixed(2)}</span><span class="unit">%</span></div>
        <div class="param-row"><label>氨氮</label><span class="ro-value">${i.toL.nh3n.toFixed(2)}</span><span class="unit">%</span></div>
        <div class="param-row"><label>镁</label><span class="ro-value">${i.toL.mg.toFixed(2)}</span><span class="unit">%</span></div>
        <hr style="margin:14px 0;border-color:#ddd">
        <h3 style="font-size:14px;color:#3a5a40;margin-bottom:10px">计算结果（留在渣里）</h3>
        <div class="param-row"><label>含水率</label><span class="ro-value">${i.water.toFixed(2)}</span><span class="unit">%</span></div>
        <div class="param-row"><label>锰</label><span class="ro-value">${i.mn.toFixed(2)}</span><span class="unit">%</span></div>
        <div class="param-row"><label>氨氮</label><span class="ro-value">${i.nh3n.toFixed(2)}</span><span class="unit">%</span></div>
        <div class="param-row"><label>镁</label><span class="ro-value">${i.mg.toFixed(2)}</span><span class="unit">%</span></div>
        <hr style="margin:14px 0;border-color:#ddd">
        <h3 style="font-size:14px;color:#3a5a40;margin-bottom:10px">重量拆分（留在渣里）</h3>
        <div class="param-row"><label>总重</label><span class="ro-value">${i.stayTotal.toFixed(3)}</span><span class="unit">t</span></div>
        <div class="param-row"><label>水重</label><span class="ro-value">${i.stayWater.toFixed(3)}</span><span class="unit">t</span></div>
        <div class="param-row"><label>干渣重</label><span class="ro-value">${i.stayDry.toFixed(3)}</span><span class="unit">t</span></div>
      `;
    } else if (obj.id === 'J') {
      const j = calcResults['J'] || notCalculated();
      const jp = obj.params || { outSlagWater: 25 };
      paramsHtml = `
        <hr style="margin:14px 0;border-color:#ddd">
        <h3 style="font-size:14px;color:#3a5a40;margin-bottom:10px">压榨吹扫参数</h3>
        <div class="param-row">
          <label>出渣含水率</label>
          <input type="number" id="p-outSlagWater" value="${jp.outSlagWater}" placeholder="%">
          <span class="unit">%</span>
        </div>
        <button class="save-btn" onclick="saveParams('${obj.id}')">保存参数</button>
        <hr style="margin:14px 0;border-color:#ddd">
        <h3 style="font-size:14px;color:#3a5a40;margin-bottom:10px">计算结果</h3>
        <div class="param-row"><label>含水率</label><span class="ro-value">${j.water.toFixed(2)}</span><span class="unit">%</span></div>
        <div class="param-row"><label>锰</label><span class="ro-value">${j.mn.toFixed(2)}</span><span class="unit">%</span></div>
        <div class="param-row"><label>氨氮</label><span class="ro-value">${j.nh3n.toFixed(2)}</span><span class="unit">%</span></div>
        <div class="param-row"><label>镁</label><span class="ro-value">${j.mg.toFixed(2)}</span><span class="unit">%</span></div>
        <div class="param-row"><label>去中转桶</label><span class="ro-value">${j.toL.toFixed(3)}</span><span class="unit">t</span></div>
        <hr style="margin:14px 0;border-color:#ddd">
        <h3 style="font-size:14px;color:#3a5a40;margin-bottom:10px">重量拆分（出渣）</h3>
        <div class="param-row"><label>总重</label><span class="ro-value">${j.total.toFixed(3)}</span><span class="unit">t</span></div>
        <div class="param-row"><label>水重</label><span class="ro-value">${j.waterAbs.toFixed(3)}</span><span class="unit">t</span></div>
        <div class="param-row"><label>干渣重</label><span class="ro-value">${j.dryWeight.toFixed(3)}</span><span class="unit">t</span></div>
      `;
    } else if (obj.id === 'K') {
      const k = calcResults['K'] || notCalculated();
      paramsHtml = `
        <hr style="margin:14px 0;border-color:#ddd">
        <h3 style="font-size:14px;color:#3a5a40;margin-bottom:10px">最终出渣参数（计算值）</h3>
        <div class="param-row"><label>含水率</label><span class="ro-value">${k.water.toFixed(2)}</span><span class="unit">%</span></div>
        <div class="param-row"><label>锰</label><span class="ro-value">${k.mn.toFixed(2)}</span><span class="unit">%</span></div>
        <div class="param-row"><label>氨氮</label><span class="ro-value">${k.nh3n.toFixed(2)}</span><span class="unit">%</span></div>
        <div class="param-row"><label>镁</label><span class="ro-value">${k.mg.toFixed(2)}</span><span class="unit">%</span></div>
        <hr style="margin:14px 0;border-color:#ddd">
        <h3 style="font-size:14px;color:#3a5a40;margin-bottom:10px">重量拆分</h3>
        <div class="param-row"><label>总重</label><span class="ro-value">${k.total.toFixed(3)}</span><span class="unit">t</span></div>
        <div class="param-row"><label>水重</label><span class="ro-value">${k.waterAbs.toFixed(3)}</span><span class="unit">t</span></div>
        <div class="param-row"><label>干渣重</label><span class="ro-value">${k.dryWeight.toFixed(3)}</span><span class="unit">t</span></div>
      `;
    } else if (obj.id === 'R') {
      const rp = obj.params || { total: 0, water: 100, mn: 0, nh3n: 0, mg: 0 };
      paramsHtml = `
        <hr style="margin:14px 0;border-color:#ddd">
        <h3 style="font-size:14px;color:#3a5a40;margin-bottom:10px">洗涤中转参数</h3>
        <div class="param-row">
          <label>总水量</label>
          <input type="number" id="p-r-total" value="${rp.total}" placeholder="t">
          <span class="unit">t</span>
        </div>
        <div class="param-row">
          <label>含水率</label>
          <input type="number" id="p-r-water" value="${rp.water}" placeholder="%">
          <span class="unit">%</span>
        </div>
        <div class="param-row">
          <label>锰</label>
          <input type="number" id="p-r-mn" value="${rp.mn}" placeholder="%">
          <span class="unit">%</span>
        </div>
        <div class="param-row">
          <label>氨氮</label>
          <input type="number" id="p-r-nh3n" value="${rp.nh3n}" placeholder="%">
          <span class="unit">%</span>
        </div>
        <div class="param-row">
          <label>镁</label>
          <input type="number" id="p-r-mg" value="${rp.mg}" placeholder="%">
          <span class="unit">%</span>
        </div>
        <button class="save-btn" onclick="saveParams('${obj.id}')">保存参数</button>
      `;
    }
    panel.innerHTML = `
      <h2>节点属性</h2>
      <p><span class="label">ID：</span><span class="value">${obj.id}</span></p>
      <p><span class="label">名称：</span><span class="value">${obj.text}</span></p>
      <p><span class="label">类型：</span><span class="value">${obj.type === 'solid' ? '固渣/进料' : obj.type === 'tank' ? '容器/中转' : obj.type === 'reagent' ? '药剂反应' : '产品'}</span></p>
      <p><span class="label">坐标：</span><span class="value">(${obj.x.toFixed(0)}, ${obj.y.toFixed(0)})</span></p>
      <p><span class="label">尺寸：</span><span class="value">${obj.w} × ${obj.h}</span></p>
      ${paramsHtml}
    `;
  } else {
    const a = nodeById(obj.from), b = nodeById(obj.to);
    panel.innerHTML = `
      <h2>连线属性</h2>
      <p><span class="label">起点：</span><span class="value">${a.text} (${obj.from})</span></p>
      <p><span class="label">终点：</span><span class="value">${b.text} (${obj.to})</span></p>
      <p><span class="label">介质：</span><span class="value">${obj.label || '-'}</span></p>
      <p><span class="label">线型：</span><span class="value">${obj.style === 'slag' ? '渣输送线' : obj.style === 'water' ? '水处理线' : obj.style === 'recycle' ? '回用水线' : obj.style === 'reagent' ? '药剂反应线' : '产品输出线'}</span></p>
    `;
  }
}

canvas.addEventListener('click', e => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left, y = e.clientY - rect.top;
  const node = hitTestNode(x, y);
  if (node) { showProperties(node, 'node'); return; }
  const link = hitTestLink(x, y);
  if (link) { showProperties(link, 'link'); return; }
  document.getElementById('propPanel').innerHTML = '<h2>属性</h2><div class="empty">点击 Canvas 中的节点或连线查看属性</div>';
});

let calcCache = {};
let calcResults = {};
let lastCalcRound = 0;

function clearCalcCache() { calcCache = {}; }
function cached(key, fn) {
  if (calcCache[key]) return calcCache[key];
  const r = fn();
  calcCache[key] = r;
  return r;
}

function notCalculated() {
  return { water: 0, mn: 0, nh3n: 0, mg: 0, total: 0, waterAbs: 0, dryWeight: 0, stayTotal:0, stayWater:0, stayDry:0, toL:0 };
}
function calcD() {
  return cached('D', () => {
  const a = nodeById('A').params || { total: 1, water: 25, mn: 1, nh3n: 0.5, mg: 0.5 };
  const dp = nodeById('D').params || { slagWater: 40 };
  const cTotal = Number(a.total);
  const cwPct = Number(a.water);
  const dwPct = Number(dp.slagWater);
  const dryWeight = cTotal * (1 - cwPct / 100);   // 干渣重量（全部进入 D）
  const dTotal = dryWeight / (1 - dwPct / 100);   // D 总重
  const dWater = dTotal - dryWeight;              // D 中水重
  const toL = Math.max(0, cTotal * cwPct / 100 - dWater); // 去中转桶的水重
  const ratio = (cTotal * cwPct / 100) > 0 ? dWater / (cTotal * cwPct / 100) : 0;
  return {
    total: dTotal,
    dryWeight,
    waterAbs: dWater,
    water: dWater / dTotal * 100,
    mn: a.mn * ratio,
    nh3n: a.nh3n * ratio,
    mg: a.mg * ratio,
    toL: toL,
    raw: a
  };
  });
}

function calcE() {
  return cached('E', () => {
  const d = calcResults['D'] || notCalculated();
  const ep = nodeById('E').params || { washEff: 80 };
  const r = nodeById('R').params || { total: 0, water: 0, mn: 0, nh3n: 0, mg: 0 };
  const eff = Number(ep.washEff) / 100;
  const rTotal = Number(r.total);
  const rWater = rTotal * Number(r.water) / 100;
  const stayDry = d.dryWeight;                               // 干渣全部留下
  const stayWater = d.waterAbs * (1 - eff) + rWater;          // 留在渣里的水 + 洗涤中转回水
  const stayTotal = stayDry + stayWater;
  const toLWater = d.waterAbs * eff;
  const toLMn = d.mn * eff;     // d.mn 是占 D 水量的百分比，近似按水量比例
  const toLNh3n = d.nh3n * eff;
  const toLMg = d.mg * eff;
  return {
    eff,
    stayDry,
    stayWater,
    stayTotal,
    toLTotal: toLWater,
    water: stayWater / stayTotal * 100,
    mn: (d.total * d.mn / 100 * (1 - eff) + rTotal * Number(r.mn) / 100) / stayTotal * 100,
    nh3n: (d.total * d.nh3n / 100 * (1 - eff) + rTotal * Number(r.nh3n) / 100) / stayTotal * 100,
    mg: (d.total * d.mg / 100 * (1 - eff) + rTotal * Number(r.mg) / 100) / stayTotal * 100,
    toL: {
      water: toLWater,
      mn: toLMn,
      nh3n: toLNh3n,
      mg: toLMg
    }
  };
  });
}

function calcF() {
  return cached('F', () => {
  const e = calcResults['E'] || notCalculated();
  const fp = nodeById('F').params || { outSlagWater: 25 };
  const fw = Number(fp.outSlagWater);
  const fTotal = e.stayDry / (1 - fw / 100);
  const fWater = fTotal - e.stayDry;
  const ratio = e.stayWater > 0 ? fWater / e.stayWater : 0;
  return {
    total: fTotal,
    dryWeight: e.stayDry,
    waterAbs: fWater,
    toL: Math.max(0, e.stayWater - fWater),
    water: fWater / fTotal * 100,
    mn: e.mn * ratio,
    nh3n: e.nh3n * ratio,
    mg: e.mg * ratio
  };
  });
}

function calcM() {
  return cached('M', () => {
  const h = calcResults['H'] || notCalculated();
  const j = calcResults['J'] || notCalculated();
  const mp = nodeById('M').params || { blowRate: 20, outNh3n: 0 };
  const mWater = h.toL + j.toL;
  const mTotal = mWater;
  if (mTotal <= 0) return { total: 0, waterAbs: 0, water: 0, mn: 0, nh3n: 0, mg: 0 };
  // 元素按水量加权（假设均溶解在水中）
  const mn = (h.toL * h.mn + j.toL * j.mn) / mWater;
  let nh3n = (h.toL * h.nh3n + j.toL * j.nh3n) / mWater;
  const mg = (h.toL * h.mg + j.toL * j.mg) / mWater;
  // 吹脱：优先使用吹脱率
  const blowRate = Number(mp.blowRate) / 100;
  const outNh3n = Number(mp.outNh3n);
  if (blowRate > 0) {
    nh3n = nh3n * (1 - blowRate);
  } else if (outNh3n > 0) {
    // 用出水浓度反算去除率（以 mg/L 近似等于 %）
    nh3n = Math.min(nh3n, outNh3n / 1000);
  }
  return { total: mTotal, waterAbs: mWater, water: 100, mn, nh3n, mg };
  });
}

function calcT() {
  return cached('T', () => {
  const m = calcResults['M'] || notCalculated();
  const tp = nodeById('T').params || { mgRemoval: 20 };
  const mgRemoval = Number(tp.mgRemoval) / 100;
  return {
    total: m.total,
    waterAbs: m.waterAbs,
    water: 100,
    mn: m.mn,
    nh3n: m.nh3n,
    mg: m.mg * (1 - mgRemoval)
  };
  });
}

function calcG() {
  return cached('G', () => {
  const f = calcResults['F'] || notCalculated();
  const t = calcResults['T'] || notCalculated();
  const total = f.total + t.total;
  const waterWeight = f.waterAbs + t.waterAbs;
  const dryWeight = f.dryWeight;
  if (total <= 0) return { total: 0, dryWeight: 0, waterAbs: 0, water: 0, mn: 0, nh3n: 0, mg: 0 };
  return {
    total,
    dryWeight,
    waterAbs: waterWeight,
    water: waterWeight / total * 100,
    mn: (f.total * f.mn / 100 + t.total * t.mn / 100) / total * 100,
    nh3n: (f.total * f.nh3n / 100 + t.total * t.nh3n / 100) / total * 100,
    mg: (f.total * f.mg / 100 + t.total * t.mg / 100) / total * 100
  };
  });
}

function calcH() {
  return cached('H', () => {
  const g = calcResults['G'] || notCalculated();
  const hp = nodeById('H').params || { slagWater: 40 };
  const hw = Number(hp.slagWater);
  const dryWeight = g.dryWeight;
  const hTotal = dryWeight / (1 - hw / 100);
  const hWater = hTotal - dryWeight;
  const toL = Math.max(0, g.waterAbs - hWater);
  const ratio = g.waterAbs > 0 ? hWater / g.waterAbs : 0;
  return {
    total: hTotal,
    dryWeight,
    waterAbs: hWater,
    toL,
    water: hWater / hTotal * 100,
    mn: g.mn * ratio,
    nh3n: g.nh3n * ratio,
    mg: g.mg * ratio
  };
  });
}

function calcQ() {
  return cached('Q', () => {
  const lp = nodeById('L').params || { toN: 0.5 };
  const np = nodeById('N').params || { outMn: 200 };
  const pp = nodeById('P').params || { outNh3n: 50 };
  const d = calcResults['D'] || notCalculated();
  const e = calcResults['E'] || notCalculated();
  const f = calcResults['F'] || notCalculated();
  const lWater = d.toL + e.toL.water + f.toL;
  let lMn = 0, lMg = 0;
  if (lWater > 0) {
    lMn = (d.toL * d.mn + e.toL.water * e.toL.mn + f.toL * f.mn) / lWater;
    lMg = (d.toL * d.mg + e.toL.water * e.toL.mg + f.toL * f.mg) / lWater;
  }
  const qWater = Number(lp.toN);
  const qNh3n = Number(pp.outNh3n) / 1000; // mg/L 近似转 %
  return {
    total: qWater,
    waterAbs: qWater,
    water: 100,
    mn: 0, // 沉锰已去除
    nh3n: qNh3n,
    mg: lMg
  };
  });
}

function calcI() {
  return cached('I', () => {
  const h = calcResults['H'] || notCalculated();
  const ip = nodeById('I').params || { washEff: 80 };
  const q = calcResults['Q'] || notCalculated();
  const eff = Number(ip.washEff) / 100;
  const stayDry = h.dryWeight;
  const qWater = q.total * q.water / 100;
  const stayWater = h.waterAbs * (1 - eff) + qWater;
  const stayTotal = stayDry + stayWater;
  const toLWater = h.waterAbs * eff;
  return {
    eff,
    stayDry,
    stayWater,
    stayTotal,
    water: stayWater / stayTotal * 100,
    mn: (h.total * h.mn / 100 * (1 - eff) + q.total * q.mn / 100) / stayTotal * 100,
    nh3n: (h.total * h.nh3n / 100 * (1 - eff) + q.total * q.nh3n / 100) / stayTotal * 100,
    mg: (h.total * h.mg / 100 * (1 - eff) + q.total * q.mg / 100) / stayTotal * 100,
    toL: {
      water: toLWater,
      mn: h.mn * eff,
      nh3n: h.nh3n * eff,
      mg: h.mg * eff
    }
  };
  });
}

function calcJ() {
  return cached('J', () => {
  const i = calcResults['I'] || notCalculated();
  const jp = nodeById('J').params || { outSlagWater: 25 };
  const jw = Number(jp.outSlagWater);
  const jTotal = i.stayDry / (1 - jw / 100);
  const jWater = jTotal - i.stayDry;
  const ratio = i.stayWater > 0 ? jWater / i.stayWater : 0;
  return {
    total: jTotal,
    dryWeight: i.stayDry,
    waterAbs: jWater,
    toL: Math.max(0, i.stayWater - jWater),
    water: jWater / jTotal * 100,
    mn: i.mn * ratio,
    nh3n: i.nh3n * ratio,
    mg: i.mg * ratio
  };
  });
}

function saveParams(nodeId) {
  const n = nodeById(nodeId);
  if (nodeId === 'A') {
    n.params = {
      total: document.getElementById('p-total').value,
      water: document.getElementById('p-water').value,
      mn: document.getElementById('p-mn').value,
      nh3n: document.getElementById('p-nh3n').value,
      mg: document.getElementById('p-mg').value
    };
  } else if (nodeId === 'L') {
    n.params = { toN: document.getElementById('p-toN').value };
  } else if (nodeId === 'N') {
    n.params = { outMn: document.getElementById('p-outMn').value };
  } else if (nodeId === 'O') {
    n.params = { ph: document.getElementById('p-ph').value };
  } else if (nodeId === 'P') {
    n.params = { outNh3n: document.getElementById('p-outNh3n').value };
  } else if (nodeId === 'Q') {
    n.params = { ph: document.getElementById('p-ph').value };
  } else if (nodeId === 'R') {
    n.params = {
      total: document.getElementById('p-r-total').value,
      water: document.getElementById('p-r-water').value,
      mn: document.getElementById('p-r-mn').value,
      nh3n: document.getElementById('p-r-nh3n').value,
      mg: document.getElementById('p-r-mg').value
    };
  } else if (nodeId === 'T') {
    n.params = { mgRemoval: document.getElementById('p-mgRemoval').value };
  } else if (nodeId === 'M') {
    n.params = {
      blowRate: document.getElementById('p-blowRate').value,
      outNh3n: document.getElementById('p-blowOutNh3n').value
    };
  } else if (nodeId === 'D' || nodeId === 'H') {
    n.params = { slagWater: document.getElementById('p-slagWater').value };
  } else if (nodeId === 'E' || nodeId === 'I') {
    n.params = { washEff: document.getElementById('p-washEff').value };
  } else if (nodeId === 'F' || nodeId === 'J') {
    n.params = { outSlagWater: document.getElementById('p-outSlagWater').value };
  }
  const btn = document.querySelector('.save-btn');
  if (btn) { btn.textContent = '已保存'; setTimeout(() => btn.textContent = '保存参数', 1200); }
}

function resetView() { resize(); }
function toggleLabels() { showLabels = !showLabels; draw(); }
function toggleFlow() {
  flowEnabled = !flowEnabled;
  document.getElementById('flowBtn').textContent = flowEnabled ? '暂停流动' : '开始流动';
  if (flowEnabled) draw();
}

function runCalc(maxRounds = 20) {
  const status = document.getElementById('calcStatus');
  status.style.display = 'block';
  let round = 0;
  function step() {
    clearCalcCache();
    calcJ();
    round++;
    lastCalcRound = round;
    const lWater = calcD().toL + calcE().toL.water + calcF().toL;
      calcResults = {
        A: nodeById('A').params,
        C: { mnKg: 0, nh3nKg: 0, mgKg: 0 }, // placeholder
        D: calcD(), E: calcE(), F: calcF(),
        G: calcG(), H: calcH(), I: calcI(), J: calcJ(),
        K: calcJ(), L: { total: lWater }, M: calcM(),
        N: nodeById('N').params, O: nodeById('O').params,
        P: nodeById('P').params, Q: calcQ(), R: nodeById('R').params,
        S: { mnKg: 0 }, T: calcT()
      };
    status.textContent = '计算中... 迭代次数：' + round;
    if (round < maxRounds) {
      setTimeout(step, 30);
    } else {
      status.textContent = '计算结束，共迭代 ' + round + ' 次';
    }
  }
  step();
}


window.addEventListener('resize', resize);
window.addEventListener('load', () => { resize(); animate(); });
