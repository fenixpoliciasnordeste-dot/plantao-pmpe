// Plantão PMPE — versão 3D (Three.js r128)
// O mapa é o mesmo da versão 2D: o desenho de cima vira o chão, e os prédios ganham altura.
(() => {
  // ---------- Configuração ----------
  const POR_PLANTAO = 10;     // ocorrências por plantão
  const RLM_POR_PLANTAO = 6;  // quantas delas são de RLM; o resto vem das outras matérias
  const RANKS = [
    { nome: "Soldado", xp: 0 },
    { nome: "Cabo", xp: 400 },
    { nome: "Sargento", xp: 900 },
  ];
  const XP_ACERTO = 100;
  const LEAD_DEPOIS_DE = 3;     // pede nome e WhatsApp depois desta ocorrência
  const MENTORIA_SE_ERROS = 3;  // mostra a mentoria para quem errar isso ou mais (ou chegar a Sargento)

  // Sem 3D no aparelho? Vai para a versão 2D.
  if (!window.THREE) { location.replace("index-2d.html"); return; }

  // ---------- Mapa ----------
  const STEP = 300, ROAD = 90, COLS = 7, ROWS = 6;
  const LAND_W = COLS * STEP, WORLD_H = ROWS * STEP;
  const BEACH_W = 110, WORLD_W = LAND_W + 300;
  const SEA_X = LAND_W + 45 + BEACH_W;

  const bairroDaCelula = (i, j) => {
    if (i >= 4 && j <= 1) return "Olinda";
    if (i >= 5 && j >= 2 && j <= 3) return "Marco Zero";
    if (i >= 4 && j >= 4) return "Boa Viagem";
    if (i <= 3 && j >= 2 && j <= 3) return "Av. Agamenon";
    return "Recife";
  };
  const bairroEm = (x, y) => bairroDaCelula(
    Math.max(0, Math.min(COLS - 1, Math.floor(x / STEP))),
    Math.max(0, Math.min(ROWS - 1, Math.floor(y / STEP))));

  const PONTOS = {
    "Olinda": [[1500, 150], [1800, 300], [2100, 150], [1650, 600]],
    "Marco Zero": [[1800, 750], [2100, 900], [1800, 1050], [2100, 750]],
    "Boa Viagem": [[2100, 1500], [1500, 1650], [1800, 1350], [2100, 1650]],
    "Av. Agamenon": [[300, 900], [750, 900], [1200, 900], [450, 900]],
  };
  const LOCAL = { "Olinda": "em Olinda", "Marco Zero": "no Marco Zero", "Boa Viagem": "em Boa Viagem", "Av. Agamenon": "na Av. Agamenon" };

  let seed = 7;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  const solidos = [];   // [x, y, w, h] para colisão
  const parques = [];
  const predios = [];   // { x, y, w, h, cor, alt, tipo }
  const arvores = [];   // [x, y, r]
  const coqueiros = []; // [x, y]
  const map = document.createElement("canvas");
  map.width = WORLD_W; map.height = WORLD_H;

  function desenharMapa() {
    const g = map.getContext("2d");
    g.fillStyle = "#3b3f47"; g.fillRect(0, 0, WORLD_W, WORLD_H);
    g.fillStyle = "#e9d7a5"; g.fillRect(LAND_W + 45, 0, BEACH_W, WORLD_H);
    g.fillStyle = "#1f6fa8"; g.fillRect(SEA_X, 0, WORLD_W - SEA_X, WORLD_H);
    g.strokeStyle = "rgba(255,255,255,.35)"; g.lineWidth = 3;
    for (let y = 20; y < WORLD_H; y += 46) {
      g.beginPath();
      for (let x = SEA_X + 8; x < WORLD_W; x += 4) g.lineTo(x, y + Math.sin(x / 18) * 4);
      g.stroke();
    }
    g.fillStyle = "rgba(255,255,255,.55)"; g.fillRect(SEA_X - 4, 0, 6, WORLD_H);

    for (let i = 0; i < COLS; i++) {
      for (let j = 0; j < ROWS; j++) {
        const x0 = i * STEP + ROAD / 2, y0 = j * STEP + ROAD / 2, s = STEP - ROAD;
        const b = bairroDaCelula(i, j);
        g.fillStyle = "#b9b4a8"; g.fillRect(x0, y0, s, s);
        const x1 = x0 + 10, y1 = y0 + 10, s1 = s - 20;

        if ((i === 2 && j === 1) || (i === 1 && j === 4)) {
          g.fillStyle = "#4f9a4a"; g.fillRect(x1, y1, s1, s1);
          parques.push([x1, y1, s1, s1]);
          for (let k = 0; k < 14; k++) arvore(g, x1 + 15 + rnd() * (s1 - 30), y1 + 15 + rnd() * (s1 - 30), 12 + rnd() * 8);
          continue;
        }
        if (i === 6 && j === 3) {
          g.fillStyle = "#d8cfbd"; g.fillRect(x1, y1, s1, s1);
          rosaDosVentos(g, x0 + s / 2, y0 + s / 2, 70);
          continue;
        }
        if (i === 5 && j === 0) {
          g.fillStyle = "#6fae5a"; g.fillRect(x1, y1, s1, s1);
          g.fillStyle = "#f7f4ec"; g.fillRect(x0 + s / 2 - 50, y0 + s / 2 - 70, 100, 140);
          solidos.push([x0 + s / 2 - 50, y0 + s / 2 - 70, 100, 140]);
          continue;
        }
        if (b === "Olinda") casario(g, x1, y1, s1, ["#f4c430", "#e86a92", "#3fa7d6", "#7bc96f", "#f28c38", "#b57edc"], 16, 8);
        else if (b === "Marco Zero") casario(g, x1, y1, s1, ["#f6d6a8", "#cfe3f0", "#f3b9a6", "#e7e2b4", "#c9d8b6"], 26, 14);
        else if (b === "Boa Viagem") torres(g, x1, y1, s1);
        else casas(g, x1, y1, s1);
      }
    }

    g.strokeStyle = "rgba(255,255,255,.6)"; g.lineWidth = 3; g.setLineDash([18, 16]);
    for (let k = 0; k <= COLS; k++) { g.beginPath(); g.moveTo(k * STEP, 0); g.lineTo(k * STEP, WORLD_H); g.stroke(); }
    for (let k = 0; k <= ROWS; k++) {
      if (k === 3) continue;
      g.beginPath(); g.moveTo(0, k * STEP); g.lineTo(LAND_W, k * STEP); g.stroke();
    }
    g.setLineDash([]);
    g.fillStyle = "#2a7fb8"; g.fillRect(0, 3 * STEP - 5, 4 * STEP + 45, 10);
    g.fillStyle = "rgba(255,255,255,.85)"; g.font = "bold 22px system-ui, sans-serif";
    g.fillText("AV. AGAMENON MAGALHÃES", 470, 3 * STEP - 18);
    g.fillText("AV. AGAMENON MAGALHÃES", 1070, 3 * STEP + 34);
    g.save(); g.translate(LAND_W + 100, 260); g.rotate(Math.PI / 2);
    g.fillStyle = "rgba(255,255,255,.7)"; g.font = "bold 26px system-ui"; g.fillText("ORLA", 0, 0); g.restore();
    for (let y = 1230; y < WORLD_H; y += 70) {
      const x = LAND_W + 80 + (y % 140 ? 12 : -10);
      coqueiros.push([x, y]);
      g.fillStyle = "#3b8a3a"; g.beginPath(); g.arc(x, y, 14, 0, 7); g.fill();
    }
    for (let y = 60; y < 1150; y += 160) coqueiros.push([LAND_W + 90, y]);
  }

  function arvore(g, x, y, r) {
    g.fillStyle = "rgba(0,0,0,.18)"; g.beginPath(); g.arc(x + 4, y + 4, r, 0, 7); g.fill();
    g.fillStyle = "#2f7a35"; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
    arvores.push([x, y, r]);
  }
  function predio(g, x, y, w, h, cor, alt, tipo) {
    g.fillStyle = cor; g.fillRect(x, y, w, h);
    solidos.push([x, y, w, h]);
    predios.push({ x, y, w, h, cor, alt, tipo });
  }
  function casario(g, x, y, s, cores, altBase, altVar) {
    const n = 4, w = s / n;
    for (let k = 0; k < n; k++) {
      predio(g, x + k * w + 2, y + 2, w - 4, 62, cores[Math.floor(rnd() * cores.length)], altBase + rnd() * altVar, "casa");
      predio(g, x + k * w + 2, y + s - 64, w - 4, 62, cores[Math.floor(rnd() * cores.length)], altBase + rnd() * altVar, "casa");
    }
    g.fillStyle = "#86b86b"; g.fillRect(x, y + 70, s, s - 140);
    arvore(g, x + s * 0.3, y + s / 2, 14); arvore(g, x + s * 0.7, y + s / 2, 12);
  }
  function torres(g, x, y, s) {
    const tons = ["#c9d3de", "#d9dfe6", "#b8c4d1", "#e3e7ec"];
    const w = s / 2 - 14;
    predio(g, x + 8, y + 8, w, w, tons[Math.floor(rnd() * 4)], 110 + rnd() * 110, "torre");
    predio(g, x + s / 2 + 6, y + s / 2 + 6, w, w, tons[Math.floor(rnd() * 4)], 90 + rnd() * 90, "torre");
    g.fillStyle = "#4aa3c7"; g.fillRect(x + s / 2 + 16, y + 20, w - 20, w - 40);
    arvore(g, x + 40, y + s - 40, 14);
  }
  function casas(g, x, y, s) {
    const cores = ["#e3d3b5", "#d4c09a", "#eadfca", "#cbb999", "#d9ccb3", "#f0e6d2"];
    for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) {
      const w = s / 2 - 16;
      if (rnd() < 0.15) { arvore(g, x + a * s / 2 + s / 4, y + b * s / 2 + s / 4, 18); continue; }
      const alto = rnd() < 0.3;
      predio(g, x + a * s / 2 + 8, y + b * s / 2 + 8, w, w, cores[Math.floor(rnd() * cores.length)],
        alto ? 45 + rnd() * 40 : 14 + rnd() * 14, alto ? "torre" : "casa");
    }
  }
  function rosaDosVentos(g, cx, cy, r) {
    g.fillStyle = "#b8ab92"; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill();
    const cores = ["#e0563c", "#f2b632", "#3b8ec2", "#f2b632"];
    for (let k = 0; k < 8; k++) {
      const t = k * Math.PI / 4, len = k % 2 ? r * 0.55 : r * 0.92;
      g.fillStyle = cores[k % 4];
      g.beginPath(); g.moveTo(cx, cy);
      g.lineTo(cx + Math.cos(t - 0.2) * r * 0.25, cy + Math.sin(t - 0.2) * r * 0.25);
      g.lineTo(cx + Math.cos(t) * len, cy + Math.sin(t) * len);
      g.lineTo(cx + Math.cos(t + 0.2) * r * 0.25, cy + Math.sin(t + 0.2) * r * 0.25);
      g.fill();
    }
    g.fillStyle = "#0b1830"; g.beginPath(); g.arc(cx, cy, 8, 0, 7); g.fill();
  }

  desenharMapa();

  // ---------- Cena 3D ----------
  const $ = id => document.getElementById(id);
  const cv = $("game");
  const temToque = matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: !temToque, powerPreference: "high-performance" });
  } catch (e) { location.replace("index-2d.html"); return; }
  let qualidade = Math.min(window.devicePixelRatio || 1, temToque ? 1.5 : 2);
  renderer.setPixelRatio(qualidade);

  const CEU = 0x9fd3f5;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(CEU);
  scene.fog = new THREE.Fog(CEU, 450, 1300);
  const camera = new THREE.PerspectiveCamera(60, 1, 2, 2200);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x6b6b5a, 0.85));
  const sol = new THREE.DirectionalLight(0xfff4e0, 0.75);
  sol.position.set(-0.6, 1, -0.4); scene.add(sol);

  // chão = o mapa desenhado
  const texChao = new THREE.CanvasTexture(map);
  texChao.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const chao = new THREE.Mesh(new THREE.PlaneGeometry(WORLD_W, WORLD_H), new THREE.MeshLambertMaterial({ map: texChao }));
  chao.rotation.x = -Math.PI / 2; chao.position.set(WORLD_W / 2, 0, WORLD_H / 2);
  scene.add(chao);
  // mar e terra em volta do mapa
  const mar = new THREE.Mesh(new THREE.PlaneGeometry(9000, 9000), new THREE.MeshLambertMaterial({ color: 0x1f6fa8 }));
  mar.rotation.x = -Math.PI / 2; mar.position.set(WORLD_W / 2 + 4000, -0.6, WORLD_H / 2); scene.add(mar);
  const terra = new THREE.Mesh(new THREE.PlaneGeometry(6000, 9000), new THREE.MeshLambertMaterial({ color: 0x55734a }));
  terra.rotation.x = -Math.PI / 2; terra.position.set(-3000, -0.4, WORLD_H / 2); scene.add(terra);
  [[WORLD_W / 2, -2000], [WORLD_W / 2, WORLD_H + 2000]].forEach(([x, z]) => {
    const t = new THREE.Mesh(new THREE.PlaneGeometry(LAND_W + 90, 4000), terra.material);
    t.rotation.x = -Math.PI / 2; t.position.set((LAND_W + 90) / 2, -0.4, z); scene.add(t);
  });

  // prédios
  const caixa = new THREE.BoxGeometry(1, 1, 1); caixa.translate(0, 0.5, 0);
  function texJanelas() {
    const c = document.createElement("canvas"); c.width = 64; c.height = 128;
    const g = c.getContext("2d");
    g.fillStyle = "#ffffff"; g.fillRect(0, 0, 64, 128);
    g.fillStyle = "#5d7896";
    for (let y = 6; y < 124; y += 12) for (let x = 5; x < 60; x += 14) g.fillRect(x, y, 9, 7);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  }
  function texCasa() {
    const c = document.createElement("canvas"); c.width = 64; c.height = 32;
    const g = c.getContext("2d");
    g.fillStyle = "#ffffff"; g.fillRect(0, 0, 64, 32);
    g.fillStyle = "#6b4a2e"; g.fillRect(8, 12, 10, 20);                 // porta
    g.fillStyle = "#4d6a86"; g.fillRect(28, 10, 10, 9); g.fillRect(46, 10, 10, 9); // janelas
    g.fillStyle = "rgba(255,255,255,.9)"; g.fillRect(0, 0, 64, 3);
    return new THREE.CanvasTexture(c);
  }
  const matTorre = new THREE.MeshLambertMaterial({ map: texJanelas() });
  const matCasa = new THREE.MeshLambertMaterial({ map: texCasa() });
  const matTelhado = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const torresL = predios.filter(p => p.tipo === "torre"), casasL = predios.filter(p => p.tipo === "casa");
  const m4 = new THREE.Matrix4(), cor = new THREE.Color();
  function instanciar(lista, mat, telhado) {
    const im = new THREE.InstancedMesh(caixa, mat, lista.length);
    const tm = new THREE.InstancedMesh(caixa, matTelhado, lista.length);
    lista.forEach((p, k) => {
      m4.makeScale(p.w, p.alt, p.h); m4.setPosition(p.x + p.w / 2, 0, p.y + p.h / 2);
      im.setMatrixAt(k, m4); im.setColorAt(k, cor.set(p.cor));
      m4.makeScale(p.w - 6, 3, p.h - 6); m4.setPosition(p.x + p.w / 2, p.alt, p.y + p.h / 2);
      tm.setMatrixAt(k, m4); tm.setColorAt(k, cor.set(telhado(p)));
    });
    scene.add(im, tm);
  }
  instanciar(torresL, matTorre, () => "#8c96a3");
  instanciar(casasL, matCasa, p => (bairroEm(p.x, p.y) === "Olinda" ? "#b4532a" : p.alt > 20 ? "#9a9184" : "#a5532f"));

  // árvores e coqueiros
  const lambert = c => new THREE.MeshLambertMaterial({ color: c });
  const troncoG = new THREE.CylinderGeometry(1.6, 2.2, 1, 6); troncoG.translate(0, 0.5, 0);
  const copaG = new THREE.IcosahedronGeometry(1, 0);
  const troncos = new THREE.InstancedMesh(troncoG, lambert(0x6b4a2b), arvores.length + coqueiros.length);
  const copas = new THREE.InstancedMesh(copaG, lambert(0x2f7a35), arvores.length);
  const palmas = new THREE.InstancedMesh(copaG, lambert(0x3f9a3c), coqueiros.length);
  arvores.forEach(([x, y, r], k) => {
    m4.makeScale(1, 10, 1); m4.setPosition(x, 0, y); troncos.setMatrixAt(k, m4);
    m4.makeScale(r, r * 0.9, r); m4.setPosition(x, 10 + r * 0.6, y); copas.setMatrixAt(k, m4);
  });
  coqueiros.forEach(([x, y], k) => {
    m4.makeScale(0.8, 34, 0.8); m4.setPosition(x, 0, y); troncos.setMatrixAt(arvores.length + k, m4);
    m4.makeScale(17, 4, 17); m4.setPosition(x, 34, y); palmas.setMatrixAt(k, m4);
  });
  scene.add(troncos, copas, palmas);

  // ---------- Marcos do Recife ----------
  // Igreja em Olinda (fachada virada para a rua de baixo)
  (function igreja() {
    const cx = 5 * STEP + 150, cz = 150, g = new THREE.Group();
    const branco = lambert(0xf7f4ec), ouro = lambert(0xc9a227), porta = lambert(0x7a3b26);
    const corpo = new THREE.Mesh(caixa, branco); corpo.scale.set(100, 42, 140); g.add(corpo);
    const telhado = new THREE.Mesh(new THREE.CylinderGeometry(0, 74, 26, 4, 1), lambert(0xb4532a));
    telhado.rotation.y = Math.PI / 4; telhado.scale.set(1, 1, 1.4); telhado.position.y = 55; g.add(telhado);
    [-37, 37].forEach(dx => {
      const torre = new THREE.Mesh(caixa, branco); torre.scale.set(26, 72, 26); torre.position.set(dx, 0, 57); g.add(torre);
      const topo = new THREE.Mesh(new THREE.ConeGeometry(15, 22, 4), ouro);
      topo.position.set(dx, 83, 57); topo.rotation.y = Math.PI / 4; g.add(topo);
    });
    const p = new THREE.Mesh(caixa, porta); p.scale.set(22, 26, 2); p.position.set(0, 0, 70.5); g.add(p);
    const cruz1 = new THREE.Mesh(caixa, ouro); cruz1.scale.set(3, 18, 3); cruz1.position.set(0, 42, 66); g.add(cruz1);
    const cruz2 = new THREE.Mesh(caixa, ouro); cruz2.scale.set(12, 3, 3); cruz2.position.set(0, 52, 66); g.add(cruz2);
    g.position.set(cx, 0, cz); scene.add(g);
  })();

  // Marco Zero: marco no centro da rosa dos ventos + Torre Malakoff
  (function marcoZero() {
    const cx = 6 * STEP + 150, cz = 3 * STEP + 150;
    const marco = new THREE.Mesh(new THREE.CylinderGeometry(4, 6, 22, 8), lambert(0xd9d2c3));
    marco.position.set(cx, 11, cz); scene.add(marco);
    solidos.push([cx - 8, cz - 8, 16, 16]);
    const tx = 1650, tz = 760; // Torre Malakoff (estilizada), no pátio do quarteirão ao lado
    solidos.push([tx - 20, tz - 20, 40, 40]);
    const g = new THREE.Group();
    const base = new THREE.Mesh(caixa, lambert(0xe8dcc4)); base.scale.set(40, 30, 40); g.add(base);
    const torre = new THREE.Mesh(caixa, lambert(0xd9c9a6)); torre.scale.set(22, 34, 22); torre.position.y = 30; g.add(torre);
    const cupula = new THREE.Mesh(new THREE.SphereGeometry(13, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), lambert(0x6f8fa8));
    cupula.position.y = 64; g.add(cupula);
    g.position.set(tx, 0, tz); scene.add(g);
  })();

  // Placas de bairro (letreiros 3D)
  function textoSprite(txt, { fundo = "rgba(11,24,48,.88)", corTxt = "#ffffff", px = 44, altura = 22 } = {}) {
    const c = document.createElement("canvas"), g = c.getContext("2d");
    g.font = `800 ${px}px system-ui, sans-serif`;
    const w = Math.ceil(g.measureText(txt).width) + px;
    c.width = w; c.height = Math.round(px * 1.6);
    g.font = `800 ${px}px system-ui, sans-serif`;
    if (fundo) { g.fillStyle = fundo; const r = c.height / 2; g.beginPath(); g.moveTo(r, 0); g.arcTo(w, 0, w, c.height, r); g.arcTo(w, c.height, 0, c.height, r); g.arcTo(0, c.height, 0, 0, r); g.arcTo(0, 0, w, 0, r); g.fill(); }
    g.fillStyle = corTxt; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, w / 2, c.height / 2 + 2);
    const t = new THREE.CanvasTexture(c);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: true, transparent: true }));
    s.scale.set(altura * (w / c.height), altura, 1);
    return s;
  }
  [["OLINDA", 1830, 470], ["MARCO ZERO", 1830, 1180], ["BOA VIAGEM", 1680, 1780], ["AV. AGAMENON", 600, 900]].forEach(([t, x, z]) => {
    const s = textoSprite(t, { fundo: "rgba(242,182,50,.95)", corTxt: "#0b1830", px: 48, altura: 26 });
    s.position.set(x, 120, z); scene.add(s);
  });

  // ---------- Viatura ----------
  const viatura = new THREE.Group();
  (function montarViatura() {
    const add = (geo, mat, sx, sy, sz, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.scale.set(sx, sy, sz); m.position.set(x, y, z); viatura.add(m); return m; };
    const branco = lambert(0xf4f6fb), azul = lambert(0x13254a), vidro = lambert(0x7fa7c9), preto = lambert(0x1b1b1b);
    add(caixa, branco, 40, 9, 22, 0, 3.5, 0);         // carroceria
    add(caixa, azul, 9.6, 9.2, 22.2, 15.8, 3.5, 0);    // capô
    add(caixa, azul, 6.6, 9.2, 22.2, -17.3, 3.5, 0);   // traseira
    add(caixa, azul, 18, 1.5, 22.3, -1, 7.5, 0);       // faixa lateral
    add(caixa, vidro, 19, 7, 19, -1, 12.5, 0);         // cabine
    add(caixa, branco, 17, 1.2, 17.5, -1, 19.5, 0);    // teto
    const giroA = add(caixa, new THREE.MeshBasicMaterial({ color: 0xe5484d }), 4, 3, 8, -1, 20.7, -4.5);
    const giroB = add(caixa, new THREE.MeshBasicMaterial({ color: 0x3b82f6 }), 4, 3, 8, -1, 20.7, 4.5);
    add(caixa, new THREE.MeshBasicMaterial({ color: 0xfff1b0 }), 1, 3, 5, 20.2, 5, -7); // faróis
    add(caixa, new THREE.MeshBasicMaterial({ color: 0xfff1b0 }), 1, 3, 5, 20.2, 5, 7);
    const roda = new THREE.CylinderGeometry(4.5, 4.5, 3, 12); roda.rotateX(Math.PI / 2);
    [[12, 11.5], [12, -11.5], [-12, 11.5], [-12, -11.5]].forEach(([x, z]) => {
      const r = new THREE.Mesh(roda, preto); r.position.set(x, 4.5, z); viatura.add(r);
    });
    viatura.userData.giro = [giroA, giroB];
  })();
  scene.add(viatura);

  // Seta de GPS em cima da viatura
  const gps = new THREE.Group();
  (function () {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(6, 16, 4), new THREE.MeshBasicMaterial({ color: 0xe5484d }));
    cone.rotation.z = -Math.PI / 2; gps.add(cone);
    const haste = new THREE.Mesh(caixa, new THREE.MeshBasicMaterial({ color: 0xe5484d }));
    haste.scale.set(12, 3, 4); haste.position.set(-12, -1.5, 0); gps.add(haste);
    gps.scale.set(1.5, 0.35, 1.5); // seta achatada: de cima e de trás fica clara a direção
  })();
  scene.add(gps);

  // Marcador da ocorrência
  const marcador = new THREE.Group();
  const anel = new THREE.Mesh(new THREE.RingGeometry(38, 48, 32), new THREE.MeshBasicMaterial({ color: 0xe5484d, transparent: true, opacity: 0.8, side: THREE.DoubleSide }));
  anel.rotation.x = -Math.PI / 2; anel.position.y = 0.6; marcador.add(anel);
  const feixe = new THREE.Mesh(new THREE.CylinderGeometry(24, 24, 180, 20, 1, true),
    new THREE.MeshBasicMaterial({ color: 0xe5484d, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false }));
  feixe.position.y = 90; marcador.add(feixe);
  const exclamacao = textoSprite("!", { fundo: "#e5484d", px: 80, altura: 34 });
  marcador.add(exclamacao);
  let rotulo = null;
  scene.add(marcador);
  marcador.visible = false;

  // ---------- Estado ----------
  const mm = $("minimap"), mctx = mm.getContext("2d");
  const car = { x: 1200, y: 1200, a: -Math.PI / 2, v: 0 };
  const keys = {};
  let pausado = true;
  let fila = [], atual = null, idx = 0;
  let xp = 0, acertos = 0, inicio = 0, inicioOcorrencia = 0;
  let historico = [];
  let ultimoBairro = "";
  let somLigado = true;
  let travaAte = 0, dedosNoPad = 0;

  function embaralhar(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  function montarFila() {
    const banco = window.QUESTOES;
    const rlm = embaralhar(banco.filter(q => q.area === "RLM")).slice(0, RLM_POR_PLANTAO);
    const outras = embaralhar(banco.filter(q => q.area !== "RLM")).slice(0, POR_PLANTAO - rlm.length);
    const escolhidas = embaralhar([...rlm, ...outras]);
    const livres = embaralhar(Object.entries(PONTOS).flatMap(([b, l]) => l.map(([x, y]) => ({ b, x, y }))));
    const pegar = b => {
      const k = Math.max(0, livres.findIndex(p => !b || p.b === b));
      const p = livres[k] || { b: "Marco Zero", x: 1800, y: 750 };
      livres.splice(k, 1);
      return p;
    };
    const fixas = escolhidas.map(q => (q.bairro ? pegar(q.bairro) : null));
    return escolhidas.map((q, i) => {
      const p = fixas[i] || pegar(null);
      let narrativa = q.narrativa.replace(/\{local\}/g, LOCAL[p.b]);
      narrativa = narrativa.charAt(0).toUpperCase() + narrativa.slice(1);
      const ordem = embaralhar(q.alternativas.map((t, k) => k));
      return { ...q, bairro: p.b, x: p.x, y: p.y, narrativa,
        alternativas: ordem.map(k => q.alternativas[k]), correta: ordem.indexOf(q.correta) };
    });
  }

  // ---------- Som ----------
  let ac = null;
  function bip(freqs, dur = 0.12, tipo = "sine", vol = 0.08) {
    if (!somLigado) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      freqs.forEach((f, k) => {
        const o = ac.createOscillator(), gn = ac.createGain();
        o.type = tipo; o.frequency.value = f;
        const t = ac.currentTime + k * dur;
        gn.gain.setValueAtTime(vol, t); gn.gain.exponentialRampToValueAtTime(0.001, t + dur);
        o.connect(gn); gn.connect(ac.destination); o.start(t); o.stop(t + dur);
      });
    } catch (e) { /* sem som, segue o jogo */ }
  }
  const somAcerto = () => bip([660, 880], 0.12);
  const somErro = () => bip([220, 160], 0.16, "square", 0.05);
  const somSirene = () => bip([900, 650, 900, 650], 0.13, "triangle", 0.05);

  // ---------- Patentes ----------
  const rankDe = v => RANKS.reduce((r, k) => (v >= k.xp ? k : r), RANKS[0]);
  function atualizarHud() {
    const r = rankDe(xp), i = RANKS.indexOf(r), prox = RANKS[i + 1];
    $("rankName").textContent = r.nome;
    $("xpText").textContent = prox ? `${xp} XP · ${prox.nome} em ${prox.xp} XP` : `${xp} XP · patente máxima`;
    $("xpBar").style.width = prox ? `${Math.round(((xp - r.xp) / (prox.xp - r.xp)) * 100)}%` : "100%";
  }
  function toast(html, ms = 1800) {
    const t = $("toast"); t.innerHTML = html; t.classList.add("on");
    clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove("on"), ms);
  }

  // ---------- Fluxo ----------
  const mostrarPad = v => { $("padL").hidden = $("padR").hidden = !(v && temToque); };

  function iniciar() {
    fila = montarFila(); idx = 0; xp = 0; acertos = 0; historico = [];
    car.x = 1200; car.y = 1200; car.a = -Math.PI / 2; car.v = 0;
    inicio = performance.now();
    ["sStart", "sEnd"].forEach(s => $(s).classList.remove("on"));
    $("hud").hidden = false; $("mute").hidden = false; $("hint").hidden = temToque;
    mostrarPad(true);
    setTimeout(() => ($("hint").hidden = true), 6000);
    atualizarHud();
    proximaOcorrencia();
    pausado = false;
  }

  function proximaOcorrencia() {
    if (idx >= fila.length) return fim();
    atual = fila[idx];
    inicioOcorrencia = performance.now();
    marcador.position.set(atual.x, 0, atual.y);
    if (rotulo) { marcador.remove(rotulo); rotulo.material.map.dispose(); }
    rotulo = textoSprite(atual.tipo, { px: 40, altura: 20 });
    rotulo.position.y = 112; marcador.add(rotulo);
    marcador.visible = true;
    somSirene();
    toast(`Nova ocorrência<small>${atual.tipo} · ${atual.bairro}</small>`, 2200);
  }

  function abrirOcorrencia() {
    pausado = true; car.v = 0;
    Object.keys(keys).forEach(k => (keys[k] = false));
    document.querySelectorAll(".pad button.on").forEach(b => b.classList.remove("on"));
    const q = atual;
    travaAte = performance.now() + 800;
    const seg = (performance.now() - inicioOcorrencia) / 1000;
    q.bonus = seg < 25 ? 50 : seg < 40 ? 25 : 0;
    $("qTag").textContent = `Ocorrência ${idx + 1}/${fila.length}`;
    $("qWhere").textContent = q.bairro;
    $("qTitle").textContent = q.tipo;
    $("qNarr").textContent = q.narrativa;
    $("qMateria").textContent = q.materia;
    $("qStem").textContent = q.enunciado;
    const box = $("qAlts"); box.innerHTML = "";
    q.alternativas.forEach((txt, k) => {
      const b = document.createElement("button");
      b.className = "alt";
      b.innerHTML = `<span class="l">${"ABCD"[k]}</span><span></span>`;
      b.lastChild.textContent = txt;
      // trava curta: quem chega segurando FRENTE não marca uma alternativa sem querer ao soltar o dedo
      b.onclick = () => { if (dedosNoPad === 0 && performance.now() >= travaAte) responder(k); };
      box.appendChild(b);
    });
    $("qFeedback").className = "feedback"; $("btnNext").hidden = true;
    $("sQuestion").classList.add("on");
    $("sQuestion").scrollTop = 0;
  }

  function responder(k) {
    const q = atual, certo = k === q.correta;
    const botoes = [...$("qAlts").children];
    botoes.forEach((b, i) => { b.disabled = true; if (i === q.correta) b.classList.add("ok"); });
    const antes = rankDe(xp);
    let ganho = 0;
    if (certo) { ganho = XP_ACERTO + q.bonus; xp += ganho; acertos++; somAcerto(); }
    else { botoes[k].classList.add("bad"); somErro(); }
    historico.push({ tipo: q.tipo, materia: q.materia, certo });
    const fb = $("qFeedback");
    fb.className = "feedback on " + (certo ? "ok" : "bad");
    fb.innerHTML = certo
      ? `<b>Ocorrência resolvida! +${ganho} XP${q.bonus ? ` (bônus de chegada rápida: ${q.bonus})` : ""}</b>`
      : `<b>Não foi dessa vez. A certa é a ${"ABCD"[q.correta]}.</b>`;
    const exp = document.createElement("span"); exp.textContent = q.explicacao; fb.appendChild(exp);
    $("btnNext").hidden = false;
    $("btnNext").textContent = idx + 1 >= fila.length ? "Encerrar plantão" : "Seguir patrulha";
    setTimeout(() => $("btnNext").scrollIntoView({ behavior: "smooth", block: "end" }), 50);
    atualizarHud();
    const depois = rankDe(xp);
    if (depois !== antes) setTimeout(() => { toast(`Promovido a ${depois.nome}!<small>${xp} XP</small>`, 2600); somSirene(); }, 300);
  }

  function seguir() {
    $("sQuestion").classList.remove("on");
    idx++;
    if (idx === LEAD_DEPOIS_DE && !leadSalvo()) { $("sLead").classList.add("on"); return; }
    proximaOcorrencia();
    pausado = false;
  }

  const leadSalvo = () => { try { return !!localStorage.getItem("plantao_lead"); } catch (e) { return false; } };
  function salvarLead(ev) {
    ev.preventDefault();
    const nome = $("leadName").value.trim(), fone = $("leadPhone").value.replace(/\D/g, "");
    if (!nome || fone.length < 10) { $("leadPhone").focus(); $("leadPhone").style.borderColor = "#e5484d"; return; }
    // TODO: enviar para o Foguity ou para uma planilha. No protótipo fica só neste aparelho.
    try { localStorage.setItem("plantao_lead", JSON.stringify({ nome, fone, quando: new Date().toISOString() })); } catch (e) {}
    $("sLead").classList.remove("on");
    toast(`Patente salva, ${nome.split(" ")[0]}!`);
    proximaOcorrencia();
    pausado = false;
  }

  function fim() {
    pausado = true; atual = null; marcador.visible = false;
    $("hud").hidden = true; $("mute").hidden = true; mostrarPad(false);
    const r = rankDe(xp), erros = fila.length - acertos;
    const min = Math.max(1, Math.round((performance.now() - inicio) / 60000));
    $("endTitle").textContent = `Você terminou como ${r.nome}`;
    $("endScore").textContent = `${acertos}/${fila.length} acertos · ${xp} XP`;
    $("endRanks").innerHTML = RANKS.map(k => `<div class="${k === r ? "on" : ""}">${k.nome}</div>`).join("");
    $("endMsg").textContent = r.nome === "Sargento"
      ? `Plantão de respeito em ${min} min. Agora é transformar isso em aprovação na PMPE.`
      : `Plantão concluído em ${min} min. Revise o que errou e tente chegar a Sargento.`;
    $("endReview").innerHTML = "";
    historico.forEach(h => {
      const li = document.createElement("li");
      li.innerHTML = `<span>${h.certo ? "✅" : "❌"}</span><span></span>`;
      li.lastChild.textContent = `${h.tipo} · ${h.materia}`;
      $("endReview").appendChild(li);
    });
    $("btnMentoria").hidden = !(r.nome === "Sargento" || erros >= MENTORIA_SE_ERROS);
    $("sEnd").classList.add("on");
  }

  async function compartilhar() {
    const r = rankDe(xp);
    const texto = `Cheguei a ${r.nome} no Plantão PMPE do Fênix: ${acertos}/${fila.length} acertos. Duvido você passar de mim!`;
    const url = location.href.startsWith("http") ? location.href : "";
    try {
      if (navigator.share) await navigator.share({ title: "Plantão PMPE", text: texto, url: url || undefined });
      else { await navigator.clipboard.writeText(`${texto} ${url}`.trim()); toast("Texto copiado!"); }
    } catch (e) { /* cancelado */ }
  }

  // ---------- Controles ----------
  addEventListener("keydown", e => { keys[e.key.toLowerCase()] = true; if (e.key.startsWith("Arrow")) e.preventDefault(); });
  addEventListener("keyup", e => { keys[e.key.toLowerCase()] = false; });
  document.querySelectorAll(".pad button").forEach(b => {
    const k = b.dataset.key;
    let preso = false;
    const on = e => {
      e.preventDefault(); keys[k] = true; b.classList.add("on");
      if (!preso) { preso = true; dedosNoPad++; }
      try { b.setPointerCapture(e.pointerId); } catch (_) {}
    };
    const off = () => {
      keys[k] = false; b.classList.remove("on");
      if (preso) { preso = false; dedosNoPad = Math.max(0, dedosNoPad - 1); travaAte = Math.max(travaAte, performance.now() + 350); }
    };
    b.addEventListener("pointerdown", on);
    b.addEventListener("pointerup", off); b.addEventListener("pointercancel", off); b.addEventListener("lostpointercapture", off);
    b.addEventListener("contextmenu", e => e.preventDefault());
  });
  $("btnStart").onclick = iniciar;
  $("btnAgain").onclick = iniciar;
  $("btnNext").onclick = seguir;
  $("btnShare").onclick = compartilhar;
  $("leadForm").addEventListener("submit", salvarLead);
  $("mute").onclick = () => { somLigado = !somLigado; $("mute").textContent = somLigado ? "🔊" : "🔇"; };

  // ---------- Física (a mesma do 2D, no plano do chão) ----------
  const R = 15;
  const bate = (x, y) => {
    if (x < R || y < R || x > LAND_W + 45 + BEACH_W - R || y > WORLD_H - R) return true;
    for (const [bx, by, bw, bh] of solidos) {
      const cx = Math.max(bx, Math.min(x, bx + bw)), cy = Math.max(by, Math.min(y, by + bh));
      if ((x - cx) ** 2 + (y - cy) ** 2 < R * R) return true;
    }
    return false;
  };
  const naGrama = (x, y) => parques.some(([px, py, pw, ph]) => x > px && x < px + pw && y > py && y < py + ph) || x > LAND_W + 45;

  function atualizar(dt) {
    const max = naGrama(car.x, car.y) ? 190 : 360;
    let acel = 0, giro = 0;
    if (keys["arrowup"] || keys["w"]) acel = 1;
    if (keys["arrowdown"] || keys["s"]) acel = -1;
    if (keys["arrowleft"] || keys["a"]) giro = -1;
    if (keys["arrowright"] || keys["d"]) giro = 1;

    if (acel > 0) car.v += 430 * acel * dt;
    else if (acel < 0) car.v += (car.v > 0 ? 700 : 260) * acel * dt;
    else car.v -= car.v * Math.min(1, 1.6 * dt);
    car.v = Math.max(-140, Math.min(max, car.v));

    const fator = Math.min(1, Math.abs(car.v) / 80) * Math.sign(car.v || 1);
    car.a += giro * 2.6 * fator * dt;

    const nx = car.x + Math.cos(car.a) * car.v * dt, ny = car.y + Math.sin(car.a) * car.v * dt;
    if (!bate(nx, ny)) { car.x = nx; car.y = ny; }
    else if (!bate(nx, car.y)) { car.x = nx; car.v *= 0.85; }
    else if (!bate(car.x, ny)) { car.y = ny; car.v *= 0.85; }
    else car.v *= -0.25;

    const b = bairroEm(car.x, car.y);
    if (b !== ultimoBairro) { if (ultimoBairro && b !== "Recife") toast(b, 1200); ultimoBairro = b; }

    if (atual && Math.hypot(atual.x - car.x, atual.y - car.y) < 70) abrirOcorrencia();
  }

  // ---------- Câmera e desenho ----------
  let vw = 0, vh = 0;
  function redimensionar() {
    vw = innerWidth; vh = innerHeight;
    renderer.setSize(vw, vh, false);
    camera.aspect = vw / vh;
    camera.fov = vw < vh ? 72 : 60; // celular em pé enxerga um pouco mais dos lados
    camera.updateProjectionMatrix();
  }
  addEventListener("resize", redimensionar);

  const camPos = new THREE.Vector3(car.x - 100, 70, car.y);
  const olhar = new THREE.Vector3();
  let camAng = car.a;
  function atualizarCamera(dt) {
    // a câmera segue a direção da viatura com um pouco de atraso, como nos jogos de carro
    const alvoAng = car.v < -20 ? car.a : car.a;
    let d = alvoAng - camAng; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
    camAng += d * Math.min(1, dt * 4);
    const dist = vw < vh ? 120 : 105, alt = vw < vh ? 78 : 62;
    const desejo = new THREE.Vector3(car.x - Math.cos(camAng) * dist, alt, car.y - Math.sin(camAng) * dist);
    camPos.lerp(desejo, Math.min(1, dt * 6));
    camera.position.copy(camPos);
    olhar.set(car.x + Math.cos(camAng) * 40, 8, car.y + Math.sin(camAng) * 40);
    camera.lookAt(olhar);
  }

  function desenhar(t, dt) {
    viatura.position.set(car.x, 0, car.y);
    viatura.rotation.y = -car.a;
    const pisca = Math.floor(t / 180) % 2 === 0;
    viatura.userData.giro[0].material.color.setHex(pisca ? 0xe5484d : 0x3b82f6);
    viatura.userData.giro[1].material.color.setHex(pisca ? 0x3b82f6 : 0xe5484d);

    if (atual) {
      const p = (Math.sin(t / 220) + 1) / 2;
      anel.scale.setScalar(1 + p * 0.25);
      exclamacao.position.y = 70 + Math.sin(t / 300) * 6;
      const dx = atual.x - car.x, dz = atual.y - car.y, dist = Math.hypot(dx, dz);
      gps.visible = dist > 140;
      gps.position.set(car.x, 36 + Math.sin(t / 250) * 2, car.y);
      gps.rotation.y = -Math.atan2(dz, dx);
      const metros = Math.round(dist / 3) * 3;
      $("mission").innerHTML = `Ocorrência <b>${idx + 1}/${fila.length}</b> · ${atual.bairro}<div class="dist"></div>`;
      $("mission").querySelector(".dist").textContent = `${atual.tipo} · ${metros} m`;
    } else gps.visible = false;

    atualizarCamera(dt);
    renderer.render(scene, camera);
    minimapa();
  }

  function minimapa() {
    const sx = mm.width / WORLD_W, sy = mm.height / WORLD_H;
    mctx.clearRect(0, 0, mm.width, mm.height);
    mctx.drawImage(map, 0, 0, mm.width, mm.height);
    mctx.fillStyle = "rgba(11,24,48,.25)"; mctx.fillRect(0, 0, mm.width, mm.height);
    if (atual) { mctx.fillStyle = "#e5484d"; mctx.beginPath(); mctx.arc(atual.x * sx, atual.y * sy, 7, 0, 7); mctx.fill(); }
    mctx.save(); mctx.translate(car.x * sx, car.y * sy); mctx.rotate(car.a);
    mctx.fillStyle = "#f2b632"; mctx.strokeStyle = "#0b1830"; mctx.lineWidth = 2;
    mctx.beginPath(); mctx.moveTo(9, 0); mctx.lineTo(-6, -6); mctx.lineTo(-6, 6); mctx.closePath(); mctx.fill(); mctx.stroke();
    mctx.restore();
  }

  // Qualidade automática: se o aparelho estiver lento, diminui a resolução
  let amostras = 0, soma = 0;
  function ajustarQualidade(dt) {
    if (pausado || qualidade <= 0.75) return;
    amostras++; soma += dt;
    if (amostras < 90) return;
    const media = soma / amostras; amostras = 0; soma = 0;
    if (media > 1 / 40) {
      qualidade = Math.max(0.75, qualidade - 0.5);
      renderer.setPixelRatio(qualidade);
      redimensionar();
      if (qualidade <= 1) { scene.fog.far = 1000; camera.far = 1300; camera.updateProjectionMatrix(); }
    }
  }

  let ultimo = performance.now();
  function loop(t) {
    const dt = Math.min(0.05, (t - ultimo) / 1000); ultimo = t;
    if (!pausado) atualizar(dt);
    desenhar(t, dt);
    ajustarQualidade(dt);
    requestAnimationFrame(loop);
  }

  redimensionar();
  requestAnimationFrame(loop);
  window.__plantao = { car, get atual() { return atual; }, get xp() { return xp; }, abrirOcorrencia, renderer, get qualidade() { return qualidade; } }; // para testes
})();
