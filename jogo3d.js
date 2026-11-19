// Plantão PMPE — versão 3D (Three.js r128)
// O mapa é o mesmo da versão 2D: o desenho de cima vira o chão, e os prédios ganham altura.
(() => {
  // ---------- Configuração ----------
  const POR_PLANTAO = 10;     // ocorrências por plantão
  const RLM_POR_PLANTAO = 5;  // RLM continua sendo a matéria com mais peso
  const ALTO_RISCO_POR_PLANTAO = 2; // ocorrências com bandido armado (uso da força)
  const MARIA_DA_PENHA_POR_PLANTAO = 1; // sempre cai
  // o resto (2) vem de Direito em geral, Informática, Português e História
  const RANKS = [
    { nome: "Soldado", xp: 0 },
    { nome: "Cabo", xp: 400 },
    { nome: "Sargento", xp: 900 },
  ];
  const XP_ACERTO = 100;
  const LEAD_DEPOIS_DE = 3;     // pede nome e WhatsApp depois desta ocorrência
  const MENTORIA_SE_ERROS = 3;  // mostra a mentoria para quem errar isso ou mais (ou chegar a Sargento)

  // Sem 3D? Vai para a versão 2D, dizendo o motivo (aparece num aviso lá).
  const ir2d = motivo => location.replace("index-2d.html?motivo=" + motivo);
  if (!window.THREE) { ir2d("biblioteca"); return; }

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
  // ---------- Prévia do visual "caprichado" (?visual=caprichado) ----------
  const CAPRICHADO = new URLSearchParams(location.search).get("visual") === "caprichado";
  if (CAPRICHADO) {
    // faixas de pedestre na chegada de cada cruzamento
    const g = map.getContext("2d");
    g.fillStyle = "rgba(245,245,240,.88)";
    for (let i = 1; i < COLS; i++) for (let j = 1; j < ROWS; j++) {
      const cx = i * STEP, cy = j * STEP;
      for (let k = -36; k <= 36; k += 12) {
        g.fillRect(cx + k - 3, cy - 70, 6, 18); g.fillRect(cx + k - 3, cy + 52, 6, 18);   // atravessando a rua vertical
        g.fillRect(cx - 70, cy + k - 3, 18, 6); g.fillRect(cx + 52, cy + k - 3, 18, 6);   // atravessando a rua horizontal
      }
    }
  }

  // ---------- Cena 3D ----------
  const $ = id => document.getElementById(id);
  const cv = $("game");
  const temToque = matchMedia("(pointer: coarse)").matches || "ontouchstart" in window;
  if (temToque) document.body.classList.add("toque");
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: !temToque, powerPreference: "high-performance" });
    if (!renderer.getContext()) throw new Error("sem contexto");
  } catch (e) { ir2d("webgl"); return; }
  let qualidade = Math.min(window.devicePixelRatio || 1, temToque ? 1.25 : 2);
  renderer.setPixelRatio(qualidade);

  // Fim de tarde no Recife: céu degradê, sol baixo e quente, sombras compridas
  const CEU = 0xf1c39a; // cor do horizonte (neblina)
  const scene = new THREE.Scene();
  scene.background = (() => {
    const c = document.createElement("canvas"); c.width = 4; c.height = 256;
    const g = c.getContext("2d"), gr = g.createLinearGradient(0, 0, 0, 256);
    gr.addColorStop(0, "#3d64a8"); gr.addColorStop(0.45, "#8fb6df"); gr.addColorStop(0.78, "#f4c08c"); gr.addColorStop(1, "#ef925c");
    g.fillStyle = gr; g.fillRect(0, 0, 4, 256);
    return new THREE.CanvasTexture(c);
  })();
  scene.fog = new THREE.Fog(CEU, 450, 1300);
  const camera = new THREE.PerspectiveCamera(60, 1, 2, 2200);
  // brilho de luz (sprite somado): giroflex, faróis, postes
  const texBrilho = (() => {
    const c = document.createElement("canvas"); c.width = c.height = 64;
    const g = c.getContext("2d"), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.25, "rgba(255,255,255,.55)"); gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();
  const brilho = (cor, tam) => {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: texBrilho, color: cor, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    sp.scale.setScalar(tam); return sp;
  };

  scene.add(new THREE.HemisphereLight(0xffe4c8, 0x5b5048, 0.62));
  const sol = new THREE.DirectionalLight(0xffc28a, 1.05);
  const SOL_DIR = new THREE.Vector3(-0.72, 0.45, 0.52).normalize(); // sol a oeste, baixo
  sol.castShadow = true;
  sol.shadow.mapSize.set(temToque ? 1024 : 2048, temToque ? 1024 : 2048);
  Object.assign(sol.shadow.camera, { left: -380, right: 380, top: 380, bottom: -380, near: 1, far: 1600 });
  sol.shadow.bias = -0.0008;
  scene.add(sol, sol.target);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = temToque ? THREE.PCFShadowMap : THREE.PCFSoftShadowMap;

  // chão = o mapa desenhado
  const texChao = new THREE.CanvasTexture(map);
  texChao.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const chao = new THREE.Mesh(new THREE.PlaneGeometry(WORLD_W, WORLD_H), new THREE.MeshLambertMaterial({ map: texChao }));
  chao.rotation.x = -Math.PI / 2; chao.position.set(WORLD_W / 2, 0, WORLD_H / 2);
  chao.receiveShadow = true;
  scene.add(chao);
  // mar e terra em volta do mapa
  const mar = new THREE.Mesh(new THREE.PlaneGeometry(9000, 9000), CAPRICHADO
    ? new THREE.MeshPhongMaterial({ color: 0x1d5f95, specular: 0xffd2a0, shininess: 90 })
    : new THREE.MeshLambertMaterial({ color: 0x1f6fa8 }));
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
    const c = document.createElement("canvas"); c.width = 256; c.height = 512;
    const g = c.getContext("2d");
    g.fillStyle = "#ffffff"; g.fillRect(0, 0, 256, 512);
    // janelas: algumas com luz acesa (fim de tarde)
    for (let y = 24; y < 496; y += 48) {
      g.fillStyle = "#e8e2d6"; g.fillRect(0, y - 10, 256, 4); // laje entre andares
      for (let x = 20; x < 240; x += 56) {
        g.fillStyle = Math.random() < 0.22 ? "#ffd58a" : "#4f6a88";
        g.fillRect(x, y, 36, 28);
        g.fillStyle = "rgba(255,255,255,.25)"; g.fillRect(x, y, 36, 4);
      }
    }
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
    im.castShadow = im.receiveShadow = true; tm.castShadow = true;
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
  [troncos, copas, palmas].forEach(m => (m.castShadow = true));
  scene.add(troncos, copas, palmas); // trocados pelos modelos 3D quando eles carregam

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
    // faróis acesos (o brilho aparece na prévia caprichada)
    viatura.userData.farois = [[20.6, 5, -7], [20.6, 5, 7]];
  })();
  viatura.traverse(o => { if (o.isMesh) o.castShadow = true; });
  scene.add(viatura);

  // ---------- Prévia caprichada: mar com ondas, postes, brilhos e acabamento de imagem ----------
  let ondas = null, composer = null, passeAcabamento = null;
  const brilhosViatura = [];
  if (CAPRICHADO) {
    // mar: malha com ondas e reflexo do sol por cima do mar pintado no chão
    const geo = new THREE.PlaneGeometry(1400, WORLD_H + 1200, 70, 90); geo.rotateX(-Math.PI / 2);
    ondas = new THREE.Mesh(geo, new THREE.MeshPhongMaterial({ color: 0x1d6aa3, specular: 0xffe0b0, shininess: 70, transparent: true, opacity: 0.93 }));
    ondas.position.set(SEA_X + 700, 0.8, WORLD_H / 2); ondas.receiveShadow = true;
    ondas.userData.base = Float32Array.from(geo.attributes.position.array);
    scene.add(ondas);
    // postes de luz na calçada, com lâmpada acesa (fim de tarde)
    const pts = [];
    for (let k = 0; k <= COLS; k++) for (let y = 75; y < WORLD_H; y += 150) if (y % STEP) pts.push([k * STEP + 47, y]);
    for (let k = 1; k < ROWS; k++) for (let x = 75; x < LAND_W; x += 150) if (x % STEP) pts.push([x, k * STEP - 47]);
    const hasteG = new THREE.CylinderGeometry(0.9, 1.2, 34, 6); hasteG.translate(0, 17, 0);
    const lampG = new THREE.BoxGeometry(5, 2, 3);
    const hastes = new THREE.InstancedMesh(hasteG, lambert(0x3a3f47), pts.length);
    const lamps = new THREE.InstancedMesh(lampG, new THREE.MeshBasicMaterial({ color: 0xfff1c4 }), pts.length);
    const glowPos = new Float32Array(pts.length * 3);
    pts.forEach(([x, z], i) => {
      m4.makeTranslation(x, 0, z); hastes.setMatrixAt(i, m4);
      m4.makeTranslation(x, 34, z); lamps.setMatrixAt(i, m4);
      glowPos.set([x, 34, z], i * 3);
    });
    hastes.castShadow = true;
    const glowGeo = new THREE.BufferGeometry(); glowGeo.setAttribute("position", new THREE.BufferAttribute(glowPos, 3));
    const glows = new THREE.Points(glowGeo, new THREE.PointsMaterial({ map: texBrilho, color: 0xffc46b, size: 16, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true }));
    scene.add(hastes, lamps, glows);
    // brilho do giroflex e dos faróis
    const gV = brilho(0xff3b3b, 18), gA = brilho(0x3b7bff, 18); gV.position.set(-1, 22, -4.5); gA.position.set(-1, 22, 4.5);
    const f1 = brilho(0xfff1b0, 16), f2 = brilho(0xfff1b0, 16); f1.position.set(21.5, 5, -7); f2.position.set(21.5, 5, 7);
    viatura.add(gV, gA, f1, f2); brilhosViatura.push(gV, gA);
    // acabamento de imagem: brilho (bloom) + contraste de cinema, cor mais viva e vinheta
    if (THREE.EffectComposer && THREE.UnrealBloomPass) {
      composer = new THREE.EffectComposer(renderer);
      composer.addPass(new THREE.RenderPass(scene, camera));
      composer.addPass(new THREE.UnrealBloomPass(new THREE.Vector2(512, 512), 0.28, 0.35, 0.93));
      passeAcabamento = new THREE.ShaderPass({
        uniforms: { tDiffuse: { value: null }, sat: { value: 1.3 }, vinheta: { value: 0.35 } },
        vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
        fragmentShader: `uniform sampler2D tDiffuse; uniform float sat; uniform float vinheta; varying vec2 vUv;
          vec3 aces(vec3 x){ return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14),0.0,1.0); }
          void main(){
            vec3 c = texture2D(tDiffuse, vUv).rgb;
            c = aces(c * 0.95);                                   // contraste de cinema
            float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
            c = mix(vec3(l), c, sat);                             // cor mais viva
            c *= vec3(1.04, 1.0, 0.95);                           // puxa para o dourado do fim de tarde
            float d = distance(vUv, vec2(0.5));
            c *= 1.0 - vinheta * smoothstep(0.35, 0.85, d);       // vinheta
            gl_FragColor = vec4(c, 1.0);
          }`,
      });
      composer.addPass(passeAcabamento);
    }
  }
  function atualizarCaprichado(t) {
    if (!CAPRICHADO) return;
    if (ondas) {
      const pos = ondas.geometry.attributes.position, a = pos.array, b = ondas.userData.base, s = t / 1000;
      for (let i = 0; i < a.length; i += 3) {
        const x = b[i], z = b[i + 2];
        a[i + 1] = Math.sin(x * 0.02 + s * 1.6) * 1.6 + Math.sin(z * 0.013 - s * 1.1) * 1.4 + Math.sin((x + z) * 0.035 + s * 2.3) * 0.6;
      }
      pos.needsUpdate = true; ondas.geometry.computeVertexNormals();
    }
    const pisca = Math.floor(t / 180) % 2 === 0;
    if (brilhosViatura.length) { brilhosViatura[0].visible = pisca; brilhosViatura[1].visible = !pisca; }
  }

  // ---------- Modelos 3D (Kenney, CC0) ----------
  // Carregam por cima do que já existe: se algum falhar, o jogo segue com as formas simples.
  const MODELOS = {
    police: "modelos/carros/police.glb", sedan: "modelos/carros/sedan.glb", taxi: "modelos/carros/taxi.glb",
    suv: "modelos/carros/suv.glb", hatch: "modelos/carros/hatchback-sports.glb", van: "modelos/carros/van.glb",
    ambulancia: "modelos/carros/ambulance.glb", cone: "modelos/carros/cone.glb",
    coqueiro: "modelos/natureza/tree_palmTall.glb", coqueiro2: "modelos/natureza/tree_palmDetailedTall.glb",
    arvore: "modelos/natureza/tree_default.glb", carvalho: "modelos/natureza/tree_oak.glb",
  };
  const mod = {};
  const EIXO_Y = new THREE.Vector3(0, 1, 0);

  function prepararModelo(obj) {
    obj.updateMatrixWorld(true);
    const partes = [], box = new THREE.Box3();
    obj.traverse(o => {
      if (!o.isMesh) return;
      const m = o.material;
      const mat = new THREE.MeshLambertMaterial({ map: m.map || null, color: 0xffffff, transparent: !!m.transparent, alphaTest: m.alphaTest || 0 });
      if (m.color) mat.color.copy(m.color);
      if (mat.map) mat.map.encoding = THREE.LinearEncoding;
      const geo = o.geometry.clone(); geo.applyMatrix4(o.matrixWorld); geo.computeBoundingBox();
      box.union(geo.boundingBox);
      partes.push({ geo, mat });
    });
    return { partes, box, tam: box.getSize(new THREE.Vector3()), centro: box.getCenter(new THREE.Vector3()) };
  }

  function carregarModelos() {
    if (!THREE.GLTFLoader) return Promise.resolve();
    const loader = new THREE.GLTFLoader();
    return Promise.all(Object.entries(MODELOS).map(([k, url]) => new Promise(res => {
      loader.load(url + "?v=1", g => { try { mod[k] = prepararModelo(g.scene); } catch (e) {} res(); }, undefined, () => res());
    })));
  }

  // Posição de um modelo no mundo: centro em (x, z), base no chão, virado para o ângulo dado.
  // Os carros da Kenney apontam para +Z; giramos +90° para a frente ficar em +X (o "para frente" do jogo).
  function pose(m, x, z, ang, escala, ehCarro) {
    const q = new THREE.Quaternion().setFromAxisAngle(EIXO_Y, -ang + (ehCarro ? Math.PI / 2 : 0));
    const off = new THREE.Vector3(m.centro.x * escala, 0, m.centro.z * escala).applyQuaternion(q);
    return new THREE.Matrix4().compose(new THREE.Vector3(x - off.x, -m.box.min.y * escala, z - off.z), q, new THREE.Vector3(escala, escala, escala));
  }
  function espalhar(m, poses) {
    if (!poses.length) return;
    m.partes.forEach(p => {
      const im = new THREE.InstancedMesh(p.geo, p.mat, poses.length);
      poses.forEach((mx, k) => im.setMatrixAt(k, mx));
      im.castShadow = true; im.receiveShadow = true;
      scene.add(im);
    });
  }

  let viaturaModelo = false;
  function aplicarModelos() {
    // viatura
    if (mod.police) {
      const m = mod.police, esc = 42 / Math.max(m.tam.x, m.tam.z);
      const g = new THREE.Group();
      m.partes.forEach(p => { const me = new THREE.Mesh(p.geo, p.mat); me.castShadow = true; g.add(me); });
      g.scale.setScalar(esc);
      g.rotation.y = Math.PI / 2;
      g.position.set(-m.centro.z * esc, -m.box.min.y * esc, m.centro.x * esc);
      viatura.children.forEach(c => (c.visible = false));
      viatura.add(g);
      // giroflex piscando por cima do modelo
      const topo = (m.box.max.y - m.box.min.y) * esc;
      viatura.userData.giro.forEach((gm, i) => { gm.visible = true; gm.scale.set(5, 2.5, 7); gm.position.set(-1, topo - 0.5, i ? 4.5 : -4.5); });
      viaturaModelo = true;
    }
    // árvores e coqueiros
    const temArvore = mod.arvore || mod.carvalho, temCoqueiro = mod.coqueiro || mod.coqueiro2;
    if (temArvore) {
      const a = [], b = [];
      arvores.forEach(([x, y, r], k) => {
        const m = (k % 3 === 0 && mod.carvalho) || mod.arvore || mod.carvalho;
        (m === mod.arvore ? a : b).push(pose(m, x, y, k * 1.7, (20 + r * 1.3) / m.tam.y, false));
      });
      if (mod.arvore) espalhar(mod.arvore, a);
      if (mod.carvalho) espalhar(mod.carvalho, b);
      copas.visible = false;
    }
    if (temCoqueiro) {
      const a = [], b = [];
      coqueiros.forEach(([x, y], k) => {
        const m = (k % 2 && mod.coqueiro2) || mod.coqueiro || mod.coqueiro2;
        (m === mod.coqueiro ? a : b).push(pose(m, x, y, k * 2.3, 46 / m.tam.y, false));
      });
      if (mod.coqueiro) espalhar(mod.coqueiro, a);
      if (mod.coqueiro2) espalhar(mod.coqueiro2, b);
      palmas.visible = false;
    }
    if (temArvore || temCoqueiro) troncos.visible = false;
    // carros estacionados nas ruas (também viram obstáculo)
    const tipos = ["sedan", "taxi", "suv", "hatch", "van", "sedan", "taxi"].filter(k => mod[k]);
    if (tipos.length) {
      const porTipo = {};
      const pontos = Object.values(PONTOS).flat().concat([[1200, 1200]]);
      const longe = (x, y) => pontos.every(([px, py]) => Math.hypot(px - x, py - y) > 110);
      let s = 11; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
      const vagas = [];
      for (let k = 1; k <= 6; k++) for (let j = 0; j < ROWS; j++) vagas.push({ x: k * STEP, y: j * STEP + 150, vert: true });
      for (let k = 1; k <= 5; k++) for (let i = 0; i < COLS; i++) vagas.push({ x: i * STEP + 150, y: k * STEP, vert: false });
      vagas.forEach(v => {
        if (r() > 0.42) return;
        const lado = r() < 0.5 ? -1 : 1, desl = (r() - 0.5) * 80;
        const x = v.vert ? v.x + lado * 38 : v.x + desl, y = v.vert ? v.y + desl : v.y + lado * 38; // encostado no meio-fio
        if (!longe(x, y)) return;
        const tipo = tipos[Math.floor(r() * tipos.length)], m = mod[tipo];
        const ang = v.vert ? (lado > 0 ? Math.PI / 2 : -Math.PI / 2) : (lado > 0 ? 0 : Math.PI);
        (porTipo[tipo] = porTipo[tipo] || []).push(pose(m, x, y, ang, 38 / Math.max(m.tam.x, m.tam.z), true));
        solidos.push(v.vert ? [x - 13, y - 20, 26, 40] : [x - 20, y - 13, 40, 26]);
      });
      Object.entries(porTipo).forEach(([k, poses]) => espalhar(mod[k], poses));
    }
    // ambulância e cones na frente da igreja de Olinda e no Marco Zero, para dar vida
    if (mod.cone) espalhar(mod.cone, [[1950, 1170], [1975, 1170], [2000, 1170], [1560, 330], [1585, 330]].map(([x, z]) => pose(mod.cone, x, z, 0, 7 / mod.cone.tam.y, false)));
    if (mod.ambulancia) {
      espalhar(mod.ambulancia, [pose(mod.ambulancia, 1650, 330, 0, 46 / Math.max(mod.ambulancia.tam.x, mod.ambulancia.tam.z), true)]);
      solidos.push([1627, 317, 46, 26]);
    }
  }

  // ---------- Cidade viva: trânsito e pedestres ----------
  const transito = []; // carros andando
  const pedestres = [];
  const FAIXA = 14;    // distância do centro da rua até o meio da faixa (mão direita)
  const N_CARROS = temToque ? 12 : 18, N_PEDESTRES = temToque ? 14 : 24;
  const VIS = 650;     // longe disso, pedestre fica parado e escondido (economiza o celular)

  // ruas: cruzamentos de x = 300..2100 e y = 300..1500 (as bordas do mapa ficam de fora)
  const NOS_X = [1, 2, 3, 4, 5, 6, 7], NOS_Y = [1, 2, 3, 4, 5];
  const no = (i, j) => ({ x: i * STEP, y: j * STEP });
  const vizinhos = ([i, j]) => [[i + 1, j], [i - 1, j], [i, j + 1], [i, j - 1]].filter(([a, b]) => NOS_X.includes(a) && NOS_Y.includes(b));
  const dir = (a, b) => { const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1; return { x: dx / l, y: dy / l }; };
  const direita = d => ({ x: -d.y, y: d.x }); // lado direito de quem vai na direção d (y para baixo)

  // monta o caminho de um carro: chega no cruzamento C vindo de P e sai para N, fazendo a curva
  function trecho(P, C, N) {
    const p = no(...P), c = no(...C), n = no(...N);
    const di = dir(p, c), dO = dir(c, n), ri = direita(di), ro = direita(dO);
    const A = { x: c.x - di.x * 52 + ri.x * FAIXA, y: c.y - di.y * 52 + ri.y * FAIXA };
    const E = { x: c.x + dO.x * 52 + ro.x * FAIXA, y: c.y + dO.y * 52 + ro.y * FAIXA };
    let Q;
    if (Math.abs(di.x * dO.x + di.y * dO.y) > 0.9) Q = di.x * dO.x + di.y * dO.y > 0 ? { x: (A.x + E.x) / 2, y: (A.y + E.y) / 2 } : { x: c.x + di.x * 40, y: c.y + di.y * 40 };
    else Q = Math.abs(di.x) > 0.5 ? { x: E.x, y: A.y } : { x: A.x, y: E.y };
    const pts = [A];
    for (let k = 1; k <= 6; k++) { const t = k / 6, u = 1 - t; pts.push({ x: u * u * A.x + 2 * u * t * Q.x + t * t * E.x, y: u * u * A.y + 2 * u * t * Q.y + t * t * E.y }); }
    return pts;
  }
  function proximoTrecho(c) {
    const ops = vizinhos(c.para).filter(([a, b]) => !(a === c.de[0] && b === c.de[1]));
    const N = ops.length ? ops[Math.floor(Math.random() * ops.length)] : c.de;
    c.pontos.push(...trecho(c.de, c.para, N));
    c.de = c.para; c.para = N;
  }

  function criarTransito() {
    const tipos = ["sedan", "taxi", "suv", "hatch", "van", "taxi"].filter(k => mod[k]);
    if (!tipos.length) return;
    const porTipo = {};
    for (let k = 0; k < N_CARROS; k++) {
      // começa no meio de uma rua qualquer, longe da viatura
      let de, para, tent = 0;
      do {
        de = [NOS_X[Math.floor(Math.random() * NOS_X.length)], NOS_Y[Math.floor(Math.random() * NOS_Y.length)]];
        const vs = vizinhos(de); para = vs[Math.floor(Math.random() * vs.length)];
      } while (Math.hypot(no(...de).x - 1200, no(...de).y - 1200) < 350 && ++tent < 20);
      const a = no(...de), b = no(...para), d = dir(a, b), r = direita(d);
      const tipo = tipos[k % tipos.length];
      const c = { tipo, de, para, pontos: [], x: (a.x + b.x) / 2 + r.x * FAIXA, y: (a.y + b.y) / 2 + r.y * FAIXA,
        a: Math.atan2(d.y, d.x), v: 0, vmax: 110 + Math.random() * 70, espera: 0, fantasma: 0, r: 18, rodando: 0, giroBatida: 0 };
      proximoTrecho(c);
      transito.push(c);
      (porTipo[tipo] = porTipo[tipo] || []).push(c);
    }
    // um InstancedMesh por peça de cada modelo: poucas chamadas de desenho mesmo com muitos carros
    Object.entries(porTipo).forEach(([tipo, lista]) => {
      const m = mod[tipo], esc = 34 / Math.max(m.tam.x, m.tam.z);
      const ims = m.partes.map(p => { const im = new THREE.InstancedMesh(p.geo, p.mat, lista.length); im.castShadow = true; im.frustumCulled = false; scene.add(im); return im; });
      lista.forEach((c, i) => { c.desenho = { ims, i, m, esc }; });
    });
  }

  function atualizarTransito(dt) {
    for (const c of transito) {
      // olha para frente: viatura (sempre) e outros carros (a não ser que esteja destravando)
      const hx = Math.cos(c.a), hy = Math.sin(c.a);
      let bloqueado = false;
      const olha = (o, dist, larg) => {
        const rx = o.x - c.x, ry = o.y - c.y, fr = rx * hx + ry * hy, lat = Math.abs(rx * hy - ry * hx);
        return fr > 0 && fr < dist && lat < larg;
      };
      // rodando depois de uma batida: perde o controle por um instante
      if (c.rodando > 0) { c.rodando -= dt; c.a += c.giroBatida * dt; c.giroBatida *= 0.92; }
      if (c.fantasma <= 0 && (olha(car, 70, 26) || Math.hypot(car.x - c.x, car.y - c.y) < 40)) bloqueado = true;
      if (!bloqueado && c.fantasma <= 0) for (const o of transito) if (o !== c && olha(o, 58, 20)) { bloqueado = true; break; }
      if (!bloqueado) for (const p of pedestres.concat(pessoasCena)) if (!p.morto && olha(p, 45, 16)) { bloqueado = true; break; }
      if (c.rodando > 0) bloqueado = true;
      c.espera = bloqueado ? c.espera + dt : 0;
      // esperou demais: se for a viatura parada na frente, ultrapassa pela esquerda; se for cruzamento entupido, segue
      if (c.espera > 2.2 && c.rodando <= 0) {
        if (olha(car, 90, 30)) {
          const lx = hy, ly = -hx; // esquerda de quem dirige
          c.pontos.unshift(
            { x: c.x + hx * 25 + lx * 32, y: c.y + hy * 25 + ly * 32 },
            { x: car.x + hx * 30 + lx * 34, y: car.y + hy * 30 + ly * 34 },
            { x: car.x + hx * 80 + lx * 12, y: car.y + hy * 80 + ly * 12 });
        }
        c.fantasma = 2; c.espera = 0;
      }
      c.fantasma -= dt;
      const alvoV = bloqueado ? 0 : c.vmax;
      c.v += Math.sign(alvoV - c.v) * Math.min(Math.abs(alvoV - c.v), (bloqueado ? 420 : 160) * dt);
      // segue os pontos do caminho
      let passo = c.v * dt;
      while (passo > 0 && c.pontos.length) {
        const p = c.pontos[0], dx = p.x - c.x, dy = p.y - c.y, d = Math.hypot(dx, dy);
        if (d <= passo) { c.x = p.x; c.y = p.y; passo -= d; c.pontos.shift(); if (c.pontos.length < 3) proximoTrecho(c); }
        else {
          c.x += dx / d * passo; c.y += dy / d * passo; passo = 0;
          let da = Math.atan2(dy, dx) - c.a; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
          c.a += da * Math.min(1, dt * 10);
        }
      }
      if (!c.pontos.length) proximoTrecho(c);
      const { ims, i, m, esc } = c.desenho;
      const mx = pose(m, c.x, c.y, c.a, esc, true);
      ims.forEach(im => im.setMatrixAt(i, mx));
    }
    const vistos = new Set();
    for (const c of transito) if (!vistos.has(c.desenho.ims)) { vistos.add(c.desenho.ims); c.desenho.ims.forEach(im => (im.instanceMatrix.needsUpdate = true)); }
  }

  // pedestres: dão a volta no quarteirão pela calçada, ou andam na orla
  const PESSOAS = ["character-male-a", "character-male-c", "character-male-e", "character-female-a", "character-female-c", "character-female-e"];
  const gltfPessoas = {};
  function carregarPessoas() {
    if (!THREE.GLTFLoader || !THREE.SkeletonUtils) return Promise.resolve();
    const loader = new THREE.GLTFLoader();
    return Promise.all(PESSOAS.concat(["character-soldier", "character-raider", "weapon-shooter"]).map(n => new Promise(res => loader.load(`modelos/pessoas/${n}.glb?v=1`, g => { gltfPessoas[n] = g; res(); }, undefined, () => res()))));
  }

  // Um personagem animado pronto para a cena (clone com esqueleto próprio)
  function montarPersonagem(g, altura) {
    const obj = THREE.SkeletonUtils.clone(g.scene);
    obj.traverse(o => {
      if (!o.isMesh) return;
      const m = o.material, mat = new THREE.MeshLambertMaterial({ map: m.map || null, skinning: !!o.isSkinnedMesh });
      if (m.color) mat.color.copy(m.color);
      if (mat.map) mat.map.encoding = THREE.LinearEncoding;
      o.material = mat; o.castShadow = true; o.frustumCulled = false;
    });
    const cx = new THREE.Box3().setFromObject(obj), alt = cx.max.y - cx.min.y || 1;
    obj.scale.setScalar(altura / alt);
    const mixer = new THREE.AnimationMixer(obj);
    let atualAc = null;
    const acao = (nome, umaVez) => {
      const clip = g.animations.find(a => a.name === nome) || g.animations.find(a => a.name === "idle");
      if (!clip) return;
      const ac = mixer.clipAction(clip);
      if (ac === atualAc) return;
      ac.setLoop(umaVez ? THREE.LoopOnce : THREE.LoopRepeat); ac.clampWhenFinished = !!umaVez;
      ac.reset().play();
      if (atualAc) ac.crossFadeFrom(atualAc, 0.2, false);
      atualAc = ac;
      if (pers.arma) pers.arma.visible = !!pers.armado && nome === "holding-right-shoot";
    };
    const pers = { obj, mixer, acao, x: 0, y: 0, altLocal: alt, escala: altura / alt, armado: false };
    return pers;
  }
  const olharPara = (p, x, y) => { p.obj.rotation.y = -Math.atan2(y - p.y, x - p.x) + Math.PI / 2; };
  const colocar = (p, x, y) => { p.x = x; p.y = y; p.obj.position.set(x, 0, y); };

  // ---------- Abordagem: o policial desce da viatura e vai até o envolvido ----------
  let policial = null, envolvido = null, cena = null;
  const envolvidos = {};
  const pessoasCena = []; // o trânsito também para para eles
  // prende a arma (de desenho) no braço direito do personagem
  function armar(pers) {
    const g = gltfPessoas["weapon-shooter"];
    if (!g || pers.arma) return;
    const arma = g.scene.clone(true);
    arma.traverse(o => {
      if (!o.isMesh) return;
      const m = o.material, mat = new THREE.MeshLambertMaterial({ map: m.map || null });
      if (m.color) mat.color.copy(m.color);
      if (mat.map) mat.map.encoding = THREE.LinearEncoding;
      o.material = mat; o.castShadow = true;
    });
    const tam = new THREE.Box3().setFromObject(arma).getSize(new THREE.Vector3());
    arma.scale.setScalar((pers.altLocal * 0.3) / Math.max(tam.x, tam.y, tam.z, 0.001));
    // presa no corpo, no punho da pose de mira (o braço do modelo não tem ponta de mão para prender)
    arma.position.set(-pers.altLocal * 0.2, pers.altLocal * 0.4, pers.altLocal * 0.33);
    arma.visible = false;
    pers.obj.add(arma);
    pers.arma = arma;
  }
  let bandido = null;
  function prepararAbordagem() {
    if (gltfPessoas["character-raider"]) {
      bandido = montarPersonagem(gltfPessoas["character-raider"], 17.5);
      bandido.obj.visible = false; scene.add(bandido.obj);
      armar(bandido);
    }
    if (gltfPessoas["character-soldier"]) {
      policial = montarPersonagem(gltfPessoas["character-soldier"], 18);
      // farda azul de PM: troca só os tons de verde da textura por azul-marinho
      policial.obj.traverse(o => {
        if (!o.isMesh || !o.material.map || !o.material.map.image) return;
        const img = o.material.map.image, c = document.createElement("canvas");
        c.width = img.width; c.height = img.height;
        const g = c.getContext("2d"); g.drawImage(img, 0, 0);
        const d = g.getImageData(0, 0, c.width, c.height), px = d.data;
        for (let i = 0; i < px.length; i += 4) {
          const r = px[i], gr = px[i + 1], b = px[i + 2];
          if (gr > r * 1.05 && gr > b * 1.15) { // verde/oliva
            const l = (r + gr + b) / 3;
            px[i] = l * 0.35; px[i + 1] = l * 0.5; px[i + 2] = Math.min(255, l * 1.25);
          }
        }
        g.putImageData(d, 0, 0);
        const t = new THREE.CanvasTexture(c);
        t.flipY = o.material.map.flipY; t.encoding = THREE.LinearEncoding;
        o.material.map = t; o.material.needsUpdate = true;
      });
      policial.obj.visible = false; scene.add(policial.obj);
      armar(policial);
    }
  }
  function posicionarEnvolvido(q) {
    Object.values(envolvidos).forEach(e => (e.obj.visible = false));
    if (bandido) bandido.obj.visible = false;
    envolvido = null;
    if (q.altoRisco && bandido) {
      envolvido = bandido;
      bandido.armado = true;
    } else {
      const nomes = PESSOAS.filter(n => gltfPessoas[n]);
      if (!nomes.length) return;
      const nome = nomes[idx % nomes.length];
      if (!envolvidos[nome]) { envolvidos[nome] = montarPersonagem(gltfPessoas[nome], 17); scene.add(envolvidos[nome].obj); }
      envolvido = envolvidos[nome];
    }
    // fica na calçada ao lado do ponto da ocorrência, olhando para a rua
    const naX = q.x % STEP === 0, naY = q.y % STEP === 0;
    const ox = naX ? 52 : 0, oy = naY ? 52 : 0;
    const sx = q.x + ox > LAND_W + 150 ? -1 : 1, sy = q.y + oy > WORLD_H - 60 ? -1 : 1;
    colocar(envolvido, q.x + ox * sx, q.y + oy * sy);
    olharPara(envolvido, q.x, q.y);
    envolvido.acao(q.altoRisco ? "holding-right-shoot" : "idle");
    envolvido.obj.visible = true;
  }
  // "isolar a área": carro de trânsito perto da cena vai para uma rua longe
  function isolarArea() {
    for (const c of transito) {
      if (Math.hypot(c.x - car.x, c.y - car.y) > 260) continue;
      let de, para, t = 0;
      do {
        de = [NOS_X[Math.floor(Math.random() * NOS_X.length)], NOS_Y[Math.floor(Math.random() * NOS_Y.length)]];
        const vs = vizinhos(de); para = vs[Math.floor(Math.random() * vs.length)];
      } while (Math.hypot(no(...de).x - car.x, no(...de).y - car.y) < 600 && ++t < 30);
      const a = no(...de), b = no(...para), d = dir(a, b), r = direita(d);
      Object.assign(c, { de, para, pontos: [], x: (a.x + b.x) / 2 + r.x * FAIXA, y: (a.y + b.y) / 2 + r.y * FAIXA, a: Math.atan2(d.y, d.x), v: 0, espera: 0, fantasma: 0, rodando: 0 });
      proximoTrecho(c);
    }
  }
  function chegarNaOcorrencia() {
    isolarArea();
    const seg = (performance.now() - inicioOcorrencia) / 1000;
    atual.bonus = seg < 25 ? 50 : seg < 40 ? 25 : 0;
    pausado = true; car.v = 0;
    Object.keys(keys).forEach(k => (keys[k] = false));
    document.querySelectorAll(".pad button.on").forEach(b => b.classList.remove("on"));
    if (!policial || !envolvido) { abrirOcorrencia(); return; }
    // sai pela porta do motorista (lado esquerdo) e anda até perto do envolvido
    const lx = Math.cos(car.a - Math.PI / 2), ly = Math.sin(car.a - Math.PI / 2);
    const sx = car.x + lx * 22, sy = car.y + ly * 22;
    const d = Math.hypot(envolvido.x - sx, envolvido.y - sy) || 1;
    // no alto risco o policial para mais longe, de arma em punho
    const dist = atual.altoRisco ? 48 : 15;
    const para = { x: envolvido.x - (envolvido.x - sx) / d * dist, y: envolvido.y - (envolvido.y - sy) / d * dist };
    policial.armado = !!atual.altoRisco;
    colocar(policial, sx, sy);
    olharPara(policial, para.x, para.y);
    policial.acao("walk");
    policial.obj.visible = true;
    pessoasCena.length = 0; pessoasCena.push(policial, envolvido);
    mostrarPad(false); marcador.visible = false; gps.visible = false;
    sireneLigada = false; sireneManual = null; $("sireneBtn").classList.remove("on");
    radio("Fênix 01", "QSL, central. Guarnição no local.", "Q S L, central. Guarnição no local.");
    cena = { fase: "andando", t: 0, para };
  }
  function atualizarCena(dt) {
    if (envolvido && envolvido.obj.visible) envolvido.mixer.update(dt);
    if (!cena || !policial) return;
    policial.mixer.update(dt);
    cena.t += dt;
    if (cena.fase === "andando") {
      const dx = cena.para.x - policial.x, dy = cena.para.y - policial.y, d = Math.hypot(dx, dy), passo = 58 * dt;
      if (d <= passo || cena.t > 4) {
        colocar(policial, cena.para.x, cena.para.y);
        olharPara(policial, envolvido.x, envolvido.y); olharPara(envolvido, policial.x, policial.y);
        if (atual.altoRisco) {
          policial.acao("holding-right-shoot"); envolvido.acao("holding-right-shoot");
          radio("Fênix 01", "Polícia! Larga a arma! Mão na cabeça!", "Polícia! Larga a arma! Mão na cabeça!");
        } else { policial.acao("interact-right"); envolvido.acao("emote-no"); }
        cena.fase = "conversa"; cena.t = 0;
      } else colocar(policial, policial.x + dx / d * passo, policial.y + dy / d * passo);
    } else if (cena.fase === "conversa" && cena.t > (atual && atual.altoRisco ? 1.6 : 0.9)) {
      cena.fase = "pergunta";
      if (!atual.altoRisco) { policial.acao("idle"); envolvido.acao("idle"); }
      abrirOcorrencia();
    } else if (cena.fase === "rendicao" && cena.t > 2.6) {
      cena.fase = "fim"; seguir();
    } else if (cena.fase === "confronto") atualizarConfronto(dt);
  }

  // ---------- Alto risco: rendição ou troca de tiro ----------
  function desfechoAltoRisco() {
    atual.desfecho = true;
    if (atual.acertou) {
      // abordagem correta: o suspeito larga a arma e se rende
      envolvido.armado = false;
      envolvido.acao("crouch"); policial.acao("interact-right");
      xp += 50; atualizarHud();
      toast("Suspeito rendido e algemado!<small>Uso da força correto: +50 XP</small>", 2400);
      radio("Fênix 01", "QSL, central. Suspeito rendido e algemado. Sem feridos.", "Q S L, central. Suspeito rendido e algemado. Sem feridos.");
      somAcerto();
      cena.fase = "rendicao"; cena.t = 0;
    } else iniciarConfronto();
  }

  const barricada = new THREE.Group();
  (function () {
    const madeira = lambert(0x8a5a2b), mesa = new THREE.Mesh(caixa, madeira);
    mesa.scale.set(10, 13, 34); barricada.add(mesa);
    const tampa = new THREE.Mesh(caixa, lambert(0x6b4422)); tampa.scale.set(11, 1.5, 35); tampa.position.y = 13; barricada.add(tampa);
    barricada.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    barricada.visible = false; scene.add(barricada);
  })();
  const efeitos = []; // rastros de tiro e clarões, somem rapidinho
  const texClarao = (() => {
    const c = document.createElement("canvas"); c.width = c.height = 64;
    const g = c.getContext("2d"), gr = g.createRadialGradient(32, 32, 2, 32, 32, 30);
    gr.addColorStop(0, "rgba(255,255,220,1)"); gr.addColorStop(0.4, "rgba(255,200,60,.9)"); gr.addColorStop(1, "rgba(255,120,0,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();
  function somTiro(longe) {
    const a = audio(); if (!a || !somLigado) return;
    const n = Math.floor(a.sampleRate * 0.16), buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3);
    const src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
    src.buffer = buf; f.type = "lowpass"; f.frequency.value = longe ? 1400 : 3200; g.gain.value = longe ? 0.12 : 0.22;
    src.connect(f); f.connect(g); g.connect(a.destination); src.start();
    const o = a.createOscillator(), og = a.createGain(), t = a.currentTime;
    o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(40, t + 0.12);
    og.gain.setValueAtTime(longe ? 0.08 : 0.16, t); og.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    o.connect(og); og.connect(a.destination); o.start(t); o.stop(t + 0.15);
  }
  function disparar(de, alvo, acertou, abaixado) {
    const ux = alvo.x - de.x, uy = alvo.y - de.y, l = Math.hypot(ux, uy) || 1;
    const boca = new THREE.Vector3(de.x + ux / l * 8, abaixado ? 8 : 11.5, de.y + uy / l * 8);
    const erro = acertou ? 0 : 9;
    const fim = new THREE.Vector3(alvo.x + (Math.random() - 0.5) * erro * 2, 9 + (Math.random() - 0.3) * erro, alvo.y + (Math.random() - 0.5) * erro * 2);
    const geo = new THREE.BufferGeometry().setFromPoints([boca, fim]);
    const linha = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0xffe08a, transparent: true, opacity: 0.9 }));
    const clarao = new THREE.Sprite(new THREE.SpriteMaterial({ map: texClarao, transparent: true, depthWrite: false }));
    clarao.position.copy(boca); clarao.scale.setScalar(9);
    scene.add(linha, clarao);
    efeitos.push({ obj: linha, ttl: 0.07 }, { obj: clarao, ttl: 0.06 });
    somTiro(de !== policial);
  }
  function atualizarEfeitos(dt) {
    for (let i = efeitos.length - 1; i >= 0; i--) {
      const e = efeitos[i]; e.ttl -= dt;
      if (e.ttl <= 0) { scene.remove(e.obj); e.obj.geometry && e.obj.geometry.dispose(); e.obj.material.dispose(); efeitos.splice(i, 1); }
    }
  }

  let conf = null, abrigarPedido = false;
  function iniciarConfronto() {
    const b = envolvido, p = policial;
    const dx = b.x - car.x, dy = b.y - car.y, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
    // policial se abriga atrás da viatura; o suspeito recua para trás de uma barricada
    const base = { x: car.x - ux * 26, y: car.y - uy * 26 };
    colocar(p, base.x, base.y); olharPara(p, b.x, b.y);
    colocar(b, b.x + ux * 22, b.y + uy * 22); olharPara(b, car.x, car.y);
    barricada.position.set(b.x - ux * 13, 0, b.y - uy * 13);
    barricada.rotation.y = -Math.atan2(uy, ux);
    barricada.visible = true;
    conf = { ux, uy, base, lado: 0, vidaP: 100, vidaB: 100, abaixado: true, bEstado: "abrigado", bT: 1.4, cdP: 0, rajada: 0, fim: 0, venceu: false };
    p.acao("crouch"); b.acao("crouch");
    for (const q of pedestres) if (Math.hypot(q.x - car.x, q.y - car.y) < 240) q.escondido = true; // área isolada
    cena.fase = "confronto"; cena.t = 0;
    $("confronto").hidden = false; $("padTiro").hidden = false;
    $("padL").hidden = !temToque; $("padR").hidden = true;
    $("btnAbrigar").classList.add("on");
    atualizarBarras();
    radio("Central", "Troca de tiros! Fênix 01, abrigue-se e neutralize a ameaça.", "Atenção, Fênix zero um, troca de tiros! Abrigue-se.");
  }
  function atualizarBarras() {
    $("vidaP").style.width = Math.max(0, conf.vidaP) + "%";
    $("vidaB").style.width = Math.max(0, conf.vidaB) + "%";
  }
  function atualizarConfronto(dt) {
    const c = conf; if (!c) return;
    bandido && bandido.mixer.update(0); // (o mixer do envolvido já roda em atualizarCena)
    if (c.fim > 0) { c.fim -= dt; if (c.fim <= 0) terminarConfronto(); return; }
    const px = -c.uy, py = c.ux; // lateral (anda de lado atrás da viatura)
    let mv = 0;
    if (keys["arrowleft"] || keys["a"]) mv -= 1;
    if (keys["arrowright"] || keys["d"]) mv += 1;
    c.lado = Math.max(-26, Math.min(26, c.lado + mv * 45 * dt));
    colocar(policial, c.base.x + px * c.lado, c.base.y + py * c.lado);
    olharPara(policial, envolvido.x, envolvido.y);
    if (abrigarPedido) { abrigarPedido = false; c.abaixado = !c.abaixado; }
    // tiro do policial: mira automática; acerta bem quando o suspeito aparece
    c.cdP -= dt;
    const atirando = keys[" "] || keys["tiro"];
    if (atirando && c.cdP <= 0) {
      c.cdP = 0.32; c.abaixado = false;
      const exposto = c.bEstado === "atirando";
      const acertou = Math.random() < (exposto ? 0.62 : 0.08);
      disparar(policial, envolvido, acertou, false);
      if (acertou) { c.vidaB -= 34; envolvido.obj.position.y = 0; }
    }
    $("btnAbrigar").classList.toggle("on", c.abaixado);
    policial.acao(c.abaixado ? "crouch" : "holding-right-shoot");
    // suspeito: abriga, levanta e dispara uma rajada, abriga de novo
    c.bT -= dt;
    if (c.bEstado === "abrigado" && c.bT <= 0) { c.bEstado = "atirando"; c.bT = 1.5; c.rajada = 0.3; envolvido.acao("holding-right-shoot"); }
    else if (c.bEstado === "atirando") {
      c.rajada -= dt;
      if (c.rajada <= 0) {
        c.rajada = 0.45;
        const acerta = !c.abaixado && Math.random() < 0.38;
        disparar(envolvido, policial, acerta, false);
        if (acerta) { c.vidaP -= 17; const dn = $("dano"); dn.classList.remove("on"); void dn.offsetWidth; dn.classList.add("on"); }
      }
      if (c.bT <= 0) { c.bEstado = "abrigado"; c.bT = 1 + Math.random() * 1.3; envolvido.acao("crouch"); }
    }
    atualizarBarras();
    if (c.vidaB <= 0) {
      c.fim = 2.6; c.venceu = true;
      envolvido.armado = false; c.vidaB = 0; atualizarBarras();
      envolvido.acao("die", true); policial.acao("idle");
      xp += 60; atualizarHud();
      toast("Ameaça neutralizada!<small>+60 XP</small>", 2400);
      radio("Fênix 01", "QSL, central. Ameaça neutralizada. Solicito o SAMU no local.", "Q S L, central. Ameaça neutralizada. Solicito o SAMU no local.");
    } else if (c.vidaP <= 0) {
      c.fim = 2.6; c.venceu = false;
      policial.acao("die", true);
      toast("Você foi ferido!<small>A guarnição de apoio assumiu a ocorrência</small>", 2600);
      radio("Central", "Policial ferido! Apoio a caminho, Fênix 01.", "Policial ferido! Apoio a caminho.");
    }
  }
  function terminarConfronto() {
    const venceu = conf && conf.venceu;
    conf = null; barricada.visible = false;
    for (const q of pedestres) q.escondido = false;
    $("confronto").hidden = true; $("padTiro").hidden = true; $("dano").classList.remove("on");
    historico.push({ tipo: atual.tipo, materia: venceu ? "Troca de tiro: ameaça neutralizada" : "Troca de tiro: policial ferido", certo: venceu });
    cena.fase = "fim";
    seguir();
  }
  function encerrarCena() {
    if (policial) policial.obj.visible = false;
    cena = null; pessoasCena.length = 0;
  }
  function caminhoQuarteirao(i, j) {
    const x0 = i * STEP + 51, y0 = j * STEP + 51, x1 = (i + 1) * STEP - 51, y1 = (j + 1) * STEP - 51;
    return [{ x: x0, y: y0 }, { x: x1, y: y0 }, { x: x1, y: y1 }, { x: x0, y: y1 }];
  }
  function criarPedestres() {
    const nomes = PESSOAS.filter(n => gltfPessoas[n]);
    if (!nomes.length) return;
    const orla = [{ x: LAND_W + 85, y: 60 }, { x: LAND_W + 85, y: WORLD_H - 60 }];
    for (let k = 0; k < N_PEDESTRES; k++) {
      const g = gltfPessoas[nomes[k % nomes.length]];
      const obj = THREE.SkeletonUtils.clone(g.scene);
      obj.traverse(o => {
        if (!o.isMesh) return;
        const m = o.material, mat = new THREE.MeshLambertMaterial({ map: m.map || null, skinning: !!o.isSkinnedMesh });
        if (m.color) mat.color.copy(m.color);
        if (mat.map) mat.map.encoding = THREE.LinearEncoding;
        o.material = mat; o.castShadow = true; o.frustumCulled = false;
      });
      const caixaP = new THREE.Box3().setFromObject(obj), alt = caixaP.max.y - caixaP.min.y || 1;
      obj.scale.setScalar(17 / alt);
      const mixer = new THREE.AnimationMixer(obj);
      const clip = g.animations.find(a => a.name === "walk") || g.animations[0];
      let acAndar = null, acCair = null;
      if (clip) { acAndar = mixer.clipAction(clip); acAndar.play(); acAndar.time = Math.random() * clip.duration; }
      const clipCair = g.animations.find(a => a.name === "die");
      if (clipCair) { acCair = mixer.clipAction(clipCair); acCair.setLoop(THREE.LoopOnce); acCair.clampWhenFinished = true; }
      const naOrla = k % 4 === 0;
      let rota;
      if (naOrla) rota = orla;
      else {
        const i = Math.floor(Math.random() * COLS), j = Math.floor(Math.random() * ROWS);
        rota = caminhoQuarteirao(i, j);
      }
      const p = { obj, mixer, rota, seg: Math.floor(Math.random() * rota.length), t: Math.random(), v: 16 + Math.random() * 10,
        sentido: Math.random() < 0.5 ? 1 : -1, x: 0, y: 0, a: 0, r: 7, parado: 0, acAndar, acCair, morto: false, tMorto: 0 };
      if (naOrla) { p.seg = 0; p.sentido = 1; }
      posicionarPedestre(p, 0);
      scene.add(obj); pedestres.push(p);
    }
  }
  function posicionarPedestre(p, dt) {
    const n = p.rota.length, ida = p.rota.length === 2;
    const A = p.rota[p.seg % n], B = ida ? p.rota[(p.seg + 1) % n] : p.rota[(p.seg + (p.sentido > 0 ? 1 : n - 1)) % n];
    const L = Math.hypot(B.x - A.x, B.y - A.y) || 1;
    p.t += (p.v * dt) / L;
    if (p.t >= 1) { p.t = 0; p.seg = ida ? (p.seg + 1) % 2 : (p.seg + (p.sentido > 0 ? 1 : n - 1)) % n; return posicionarPedestre(p, 0); }
    p.x = A.x + (B.x - A.x) * p.t; p.y = A.y + (B.y - A.y) * p.t;
    p.a = Math.atan2(B.y - A.y, B.x - A.x);
    p.obj.position.set(p.x, 0, p.y);
    p.obj.rotation.y = -p.a + Math.PI / 2; // os personagens olham para +Z
  }
  function atualizarPedestres(dt) {
    for (const p of pedestres) {
      if (p.escondido) { p.obj.visible = false; continue; } // área isolada durante a troca de tiro
      const perto = Math.abs(p.x - car.x) < VIS && Math.abs(p.y - car.y) < VIS;
      p.obj.visible = perto;
      if (p.morto) {
        // caído no chão; depois de um tempo some e volta a andar em outro quarteirão
        p.tMorto += dt; p.mixer.update(dt);
        if (p.tMorto > 7) reviverPedestre(p);
        continue;
      }
      if (!perto) continue;
      // para se a viatura estiver encostando nele
      const parar = Math.hypot(car.x - p.x, car.y - p.y) < 34 && Math.abs(car.v) < 60;
      if (!parar) posicionarPedestre(p, dt);
      p.mixer.update(parar ? 0 : dt * (p.v / 20));
    }
  }

  function atropelar(p, vx, vy) {
    p.morto = true; p.tMorto = 0;
    // é arremessado um pouco na direção da batida
    colocarPedestre(p, p.x + vx * 0.12, p.y + vy * 0.12);
    p.obj.rotation.y = -Math.atan2(-vy, -vx) + Math.PI / 2;
    if (p.acCair) { p.acAndar && p.acAndar.stop(); p.acCair.reset().play(); }
    else p.obj.rotation.x = -Math.PI / 2;
    bip([180, 120], 0.12, "square", 0.06);
    if (!pausado) {
      xp = Math.max(0, xp - 25); atualizarHud();
      toast("Civil atropelado!<small>A Corregedoria anotou: −25 XP</small>", 2200);
    }
  }
  function reviverPedestre(p) {
    p.morto = false; p.obj.rotation.x = 0;
    if (p.acCair) p.acCair.stop();
    if (p.acAndar) p.acAndar.reset().play();
    if (p.rota.length !== 2) p.rota = caminhoQuarteirao(Math.floor(Math.random() * COLS), Math.floor(Math.random() * ROWS));
    p.seg = 0; p.t = Math.random();
    posicionarPedestre(p, 0);
  }
  const colocarPedestre = (p, x, y) => { p.x = x; p.y = y; p.obj.position.set(x, 0, y); };

  // Batidas: tudo se empurra em vez de travar (estilo jogo de mundo aberto)
  function resolverBatidas(dt) {
    const RV = 15, RC = 18; // raio da viatura e dos carros
    const vx = Math.cos(car.a) * car.v, vy = Math.sin(car.a) * car.v;
    const ox = car.x, oy = car.y; // se o empurrão jogar a viatura num prédio, desfaz
    for (const c of transito) {
      const dx = c.x - car.x, dy = c.y - car.y, d = Math.hypot(dx, dy) || 0.01, sob = RV + RC - d;
      if (sob <= 0) continue;
      const nx = dx / d, ny = dy / d;
      // a viatura é mais pesada quando vem rápido: o carro é jogado para o lado e roda
      const forca = Math.max(0, vx * nx + vy * ny);
      const kc = c.fantasma > 0 ? 0.5 : 0.75; // ultrapassando: os dois cedem
      c.x += nx * sob * kc; c.y += ny * sob * kc;
      car.x -= nx * sob * (1 - kc); car.y -= ny * sob * (1 - kc);
      if (forca > 60 && c.rodando <= 0) {
        c.rodando = 0.9; c.giroBatida = (Math.random() < 0.5 ? -1 : 1) * Math.min(7, forca / 40); c.v = 0;
        car.v *= 0.55;
        bip([140, 90], 0.1, "sawtooth", 0.07);
      } else car.v *= 0.9;
    }
    // carro com carro: separa para não ficarem grudados
    for (let i = 0; i < transito.length; i++) for (let j = i + 1; j < transito.length; j++) {
      const a = transito[i], b = transito[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 0.01, sob = 2 * RC - d;
      if (sob <= 0) continue;
      const nx = dx / d, ny = dy / d;
      a.x -= nx * sob / 2; a.y -= ny * sob / 2; b.x += nx * sob / 2; b.y += ny * sob / 2;
    }
    // pedestres: devagar só empurra a viatura para trás; rápido é atropelamento
    for (const p of pedestres) {
      if (p.morto || !p.obj.visible) continue;
      const dx = p.x - car.x, dy = p.y - car.y, d = Math.hypot(dx, dy) || 0.01, sob = RV + p.r - d;
      if (sob <= 0) continue;
      if (Math.abs(car.v) > 60) atropelar(p, vx, vy);
      else { car.x -= dx / d * sob; car.y -= dy / d * sob; car.v *= 0.5; }
    }
    if (bate(car.x, car.y)) { car.x = ox; car.y = oy; }
  }

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
    const alto = embaralhar(banco.filter(q => q.altoRisco)).slice(0, ALTO_RISCO_POR_PLANTAO);
    const mp = embaralhar(banco.filter(q => q.tema === "maria-da-penha")).slice(0, MARIA_DA_PENHA_POR_PLANTAO);
    const outras = embaralhar(banco.filter(q => q.area !== "RLM" && !q.altoRisco && q.tema !== "maria-da-penha"))
      .slice(0, POR_PLANTAO - rlm.length - alto.length - mp.length);
    // alto risco nunca é a primeira ocorrência (o jogador ainda está pegando o jeito)
    let escolhidas = embaralhar([...rlm, ...mp, ...outras, ...alto]);
    if (escolhidas[0].altoRisco) { const k = escolhidas.findIndex(q => !q.altoRisco); [escolhidas[0], escolhidas[k]] = [escolhidas[k], escolhidas[0]]; }
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
        alternativas: ordem.map(k => q.alternativas[k]), correta: ordem.indexOf(q.correta), bonus: undefined, acertou: undefined, desfecho: false };
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

  // ---------- Sirene, motor e rádio ----------
  // Tudo sintetizado na hora (sem arquivo de áudio): fica leve e não depende de download.
  let sirene = null, motor = null;
  let sireneLigada = false, sireneManual = null; // null = automática; true/false = o jogador escolheu
  function audio() {
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      if (ac.state === "suspended") ac.resume();
      return ac;
    } catch (e) { return null; }
  }
  function montarSirene() {
    const a = audio(); if (!a || sirene) return;
    // sobe e desce (wail): oscilador cuja frequência é puxada por um LFO lento
    const o = a.createOscillator(), lfo = a.createOscillator(), prof = a.createGain(), filtro = a.createBiquadFilter(), g = a.createGain();
    o.type = "sawtooth"; o.frequency.value = 950;
    lfo.type = "triangle"; lfo.frequency.value = 0.55; prof.gain.value = 420;
    lfo.connect(prof); prof.connect(o.frequency);
    filtro.type = "lowpass"; filtro.frequency.value = 2400;
    g.gain.value = 0;
    o.connect(filtro); filtro.connect(g); g.connect(a.destination);
    o.start(); lfo.start();
    sirene = { g };
  }
  function montarMotor() {
    const a = audio(); if (!a || motor) return;
    const o = a.createOscillator(), o2 = a.createOscillator(), filtro = a.createBiquadFilter(), g = a.createGain();
    o.type = "sawtooth"; o2.type = "square"; o.frequency.value = 45; o2.frequency.value = 22.5;
    filtro.type = "lowpass"; filtro.frequency.value = 380;
    g.gain.value = 0;
    o.connect(filtro); o2.connect(filtro); filtro.connect(g); g.connect(a.destination);
    o.start(); o2.start();
    motor = { o, o2, g, filtro };
  }
  function atualizarSom() {
    if (!ac) return;
    const t = ac.currentTime, ativo = somLigado && !pausado;
    const querSirene = sireneManual === null ? sireneLigada : sireneManual;
    if (sirene) sirene.g.gain.setTargetAtTime(ativo && querSirene ? 0.045 : 0, t, 0.08);
    if (motor) {
      const r = Math.min(1, Math.abs(car.v) / 360);
      motor.o.frequency.setTargetAtTime(45 + r * 95, t, 0.1);
      motor.o2.frequency.setTargetAtTime(22.5 + r * 47, t, 0.1);
      motor.filtro.frequency.setTargetAtTime(300 + r * 700, t, 0.1);
      motor.g.gain.setTargetAtTime(ativo ? 0.018 + r * 0.03 : 0, t, 0.1);
    }
  }
  function chiado(dur = 0.35) {
    const a = audio(); if (!a || !somLigado) return;
    const n = Math.floor(a.sampleRate * dur), buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
    s.buffer = buf; f.type = "bandpass"; f.frequency.value = 1700; f.Q.value = 0.8; g.gain.value = 0.07;
    s.connect(f); f.connect(g); g.connect(a.destination); s.start();
  }
  // voz do rádio: a voz em português do aparelho, com chiado e bipe antes
  let vozPT = null;
  function acharVoz() {
    if (!window.speechSynthesis) return;
    const vs = speechSynthesis.getVoices();
    vozPT = vs.find(v => /pt[-_]BR/i.test(v.lang)) || vs.find(v => /^pt/i.test(v.lang)) || null;
  }
  if (window.speechSynthesis) { acharVoz(); speechSynthesis.onvoiceschanged = acharVoz; }
  function radio(quem, texto, fala) {
    const box = $("radio");
    box.querySelector("b").textContent = quem;
    box.querySelector("span").textContent = texto;
    box.hidden = false;
    clearTimeout(radio._t); radio._t = setTimeout(() => (box.hidden = true), 6500);
    if (!somLigado) return;
    chiado(0.3); bip([1250], 0.07, "sine", 0.05);
    if (window.speechSynthesis && fala !== false) {
      setTimeout(() => {
        try {
          speechSynthesis.cancel();
          const u = new SpeechSynthesisUtterance(fala || texto);
          u.lang = "pt-BR"; if (vozPT) u.voice = vozPT;
          u.rate = 1.12; u.pitch = 0.85; u.volume = 0.9;
          u.onend = () => { chiado(0.18); };
          speechSynthesis.speak(u);
        } catch (e) {}
      }, 320);
    }
  }
  function alternarSirene() {
    const agora = sireneManual === null ? sireneLigada : sireneManual;
    sireneManual = !agora;
    $("sireneBtn").classList.toggle("on", sireneManual);
    montarSirene();
  }

  // ---------- Patentes ----------
  const rankDe = v => RANKS.reduce((r, k) => (v >= k.xp ? k : r), RANKS[0]);
  function atualizarHud() {
    const r = rankDe(xp), i = RANKS.indexOf(r), prox = RANKS[i + 1];
    $("rankName").textContent = r.nome;
    $("estrelas").innerHTML = "★".repeat(i + 1) + `<i>${"★".repeat(RANKS.length - i - 1)}</i>`;
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
    // destrava áudio e voz no toque do botão (o iPhone exige isso)
    audio();
    try { if (window.speechSynthesis) { const u = new SpeechSynthesisUtterance(" "); u.volume = 0; speechSynthesis.speak(u); } } catch (e) {}
    encerrarCena(); conf = null; barricada.visible = false; $("confronto").hidden = true; $("padTiro").hidden = true;
    fila = montarFila(); idx = 0; xp = 0; acertos = 0; historico = [];
    car.x = 1200; car.y = 1200; car.a = -Math.PI / 2; car.v = 0;
    inicio = performance.now();
    ["sStart", "sEnd"].forEach(s => $(s).classList.remove("on"));
    $("hud").hidden = false; $("mute").hidden = false; $("sireneBtn").hidden = false; $("hint").hidden = temToque;
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
    posicionarEnvolvido(atual);
    sireneLigada = true; sireneManual = null; $("sireneBtn").classList.add("on");
    montarSirene(); montarMotor();
    const cod = String(1000 + Math.floor(Math.random() * 9000));
    radio("Central", `Fênix 01, ocorrência ${cod}: ${atual.tipo.toLowerCase()} ${LOCAL[atual.bairro]}. Desloque.`,
      `Fênix zero um, ocorrência de ${atual.tipo.toLowerCase()}, ${LOCAL[atual.bairro]}. Desloque.`);
  }

  function abrirOcorrencia() {
    pausado = true; car.v = 0;
    Object.keys(keys).forEach(k => (keys[k] = false));
    document.querySelectorAll(".pad button.on").forEach(b => b.classList.remove("on"));
    const q = atual;
    travaAte = performance.now() + 800;
    if (q.bonus === undefined) { const seg = (performance.now() - inicioOcorrencia) / 1000; q.bonus = seg < 25 ? 50 : seg < 40 ? 25 : 0; }
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
    q.acertou = certo;
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
    if (atual && atual.altoRisco && !atual.desfecho && cena) { desfechoAltoRisco(); return; }
    encerrarCena(); mostrarPad(true);
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
    encerrarCena(); Object.values(envolvidos).forEach(e => (e.obj.visible = false)); if (bandido) bandido.obj.visible = false;
    conf = null; barricada.visible = false; $("confronto").hidden = true; $("padTiro").hidden = true;
    $("hud").hidden = true; $("mute").hidden = true; $("sireneBtn").hidden = true; $("radio").hidden = true; mostrarPad(false);
    sireneLigada = false; sireneManual = null;
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
  // espera os modelos 3D carregarem (no máximo 10 s) antes de liberar o início
  $("btnStart").disabled = true; $("btnStart").textContent = "Carregando a cidade...";
  let liberado = false;
  const liberar = () => { if (liberado) return; liberado = true; $("btnStart").disabled = false; $("btnStart").textContent = "Iniciar plantão"; };
  Promise.all([carregarModelos(), carregarPessoas()]).then(() => {
    try { aplicarModelos(); } catch (e) { console.warn(e); }
    try { criarTransito(); } catch (e) { console.warn(e); }
    try { criarPedestres(); } catch (e) { console.warn(e); }
    try { prepararAbordagem(); } catch (e) { console.warn(e); }
    liberar();
  });
  setTimeout(liberar, 10000);
  $("btnAgain").onclick = iniciar;
  $("btnNext").onclick = seguir;
  $("btnShare").onclick = compartilhar;
  $("leadForm").addEventListener("submit", salvarLead);
  $("mute").onclick = () => {
    somLigado = !somLigado; $("mute").textContent = somLigado ? "🔊" : "🔇";
    if (!somLigado && window.speechSynthesis) speechSynthesis.cancel();
  };
  $("sireneBtn").onclick = alternarSirene;
  // botões do confronto: ATIRAR (segurar) e ABRIGAR (tocar)
  (function () {
    const bt = $("btnAtirar");
    const on = e => { e.preventDefault(); keys["tiro"] = true; bt.classList.add("on"); try { bt.setPointerCapture(e.pointerId); } catch (_) {} };
    const off = () => { keys["tiro"] = false; bt.classList.remove("on"); };
    bt.addEventListener("pointerdown", on); bt.addEventListener("pointerup", off); bt.addEventListener("pointercancel", off); bt.addEventListener("lostpointercapture", off);
    bt.addEventListener("contextmenu", e => e.preventDefault());
    $("btnAbrigar").addEventListener("pointerdown", e => { e.preventDefault(); abrigarPedido = true; });
    addEventListener("keydown", e => { if (conf && (e.key === "c" || e.key === "C" || e.key === "Shift")) abrigarPedido = true; if (e.key === " ") e.preventDefault(); });
  })();
  addEventListener("keydown", e => { if (e.key.toLowerCase() === "h" && !pausado) alternarSirene(); });

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

    if (atual && Math.hypot(atual.x - car.x, atual.y - car.y) < 70) chegarNaOcorrencia();
  }

  // ---------- Câmera e desenho ----------
  let vw = 0, vh = 0;
  function redimensionar() {
    vw = innerWidth; vh = innerHeight;
    renderer.setSize(vw, vh, false);
    if (composer) { composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(vw, vh); }
    camera.aspect = vw / vh;
    camera.fov = vw < vh ? 72 : 60; // celular em pé enxerga um pouco mais dos lados
    camera.updateProjectionMatrix();
  }
  addEventListener("resize", redimensionar);

  const camPos = new THREE.Vector3(car.x - 100, 70, car.y);
  const olhar = new THREE.Vector3();
  let camAng = car.a;
  function atualizarCamera(dt) {
    if (conf && policial && envolvido) {
      const c = conf, alt = c.abaixado ? 30 : 36;
      const pos = new THREE.Vector3(policial.x - c.ux * 68 + -c.uy * 22, alt, policial.y - c.uy * 68 + c.ux * 22);
      camPos.lerp(pos, Math.min(1, dt * 5));
      camera.position.copy(camPos);
      camera.lookAt(envolvido.x, 10, envolvido.y);
      return;
    }
    if (cena && envolvido) {
      // câmera de cena: de lado, enquadrando viatura, policial e envolvido
      const mx = (car.x + envolvido.x) / 2, my = (car.y + envolvido.y) / 2;
      let px = -(envolvido.y - car.y), py = envolvido.x - car.x; const l = Math.hypot(px, py) || 1; px /= l; py /= l;
      if (atual && (px * (atual.x - envolvido.x) + py * (atual.y - envolvido.y)) < 0) { px = -px; py = -py; }
      if (camera.aspect < 1) {
        // celular em pé: por cima do ombro, atrás da viatura olhando para o envolvido
        const ux = envolvido.x - car.x, uy = envolvido.y - car.y, ul = Math.hypot(ux, uy) || 1;
        const pos = new THREE.Vector3(car.x - ux / ul * 70 + px * 28, 58, car.y - uy / ul * 70 + py * 28);
        camPos.lerp(pos, Math.min(1, dt * 3));
        camera.position.copy(camPos);
        camera.lookAt((car.x + envolvido.x * 2) / 3, 8, (car.y + envolvido.y * 2) / 3);
        return;
      }
      // tela deitada: de lado, com distância para caber todo mundo
      const meioH = Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect);
      const vao = Math.hypot(envolvido.x - car.x, envolvido.y - car.y) / 2 + 30;
      const dist = Math.max(95, vao / Math.tan(meioH));
      camPos.lerp(new THREE.Vector3(mx + px * dist, 30 + dist * 0.4, my + py * dist), Math.min(1, dt * 3));
      camera.position.copy(camPos);
      camera.lookAt(mx, 10, my);
      return;
    }
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
      gps.visible = dist > 140 && !cena;
      gps.position.set(car.x, 36 + Math.sin(t / 250) * 2, car.y);
      gps.rotation.y = -Math.atan2(dz, dx);
      const metros = Math.round(dist / 3) * 3;
      $("mission").innerHTML = `Ocorrência <b>${idx + 1}/${fila.length}</b> · ${atual.bairro}<div class="dist"></div>`;
      $("mission").querySelector(".dist").textContent = `${atual.tipo} · ${metros} m`;
    } else gps.visible = false;

    atualizarCamera(dt);
    // a sombra acompanha a viatura (só a área perto dela tem sombra, para ficar leve)
    sol.target.position.set(car.x, 0, car.y);
    sol.position.set(car.x + SOL_DIR.x * 700, SOL_DIR.y * 700, car.y + SOL_DIR.z * 700);
    atualizarCaprichado(t);
    if (composer) composer.render(); else renderer.render(scene, camera);
    minimapa();
  }

  // Radar: gira com a viatura (a frente sempre para cima), como nos jogos de mundo aberto
  const RAIO_RADAR = 650; // quanto do mundo cabe do centro até a borda
  function minimapa() {
    const W = mm.width, R = W / 2, esc = (R - 6) / RAIO_RADAR, giro = -car.a - Math.PI / 2;
    mctx.clearRect(0, 0, W, W);
    mctx.save();
    mctx.beginPath(); mctx.arc(R, R, R - 3, 0, Math.PI * 2); mctx.clip();
    mctx.fillStyle = "#16324f"; mctx.fillRect(0, 0, W, W);
    mctx.translate(R, R); mctx.rotate(giro); mctx.scale(esc, esc); mctx.translate(-car.x, -car.y);
    mctx.globalAlpha = 0.92; mctx.drawImage(map, 0, 0); mctx.globalAlpha = 1;
    mctx.fillStyle = "rgba(11,24,48,.28)"; mctx.fillRect(car.x - RAIO_RADAR * 1.5, car.y - RAIO_RADAR * 1.5, RAIO_RADAR * 3, RAIO_RADAR * 3);
    // trânsito
    mctx.fillStyle = "#e8edf5";
    for (const c of transito) { mctx.beginPath(); mctx.arc(c.x, c.y, 11, 0, Math.PI * 2); mctx.fill(); }
    mctx.restore();
    // ocorrência: ponto vermelho; se estiver longe, fica preso na borda
    if (atual && marcador.visible) {
      const dx = atual.x - car.x, dy = atual.y - car.y;
      const rx = (dx * Math.cos(giro) - dy * Math.sin(giro)) * esc, ry = (dx * Math.sin(giro) + dy * Math.cos(giro)) * esc;
      const d = Math.hypot(rx, ry), lim = R - 16, k = d > lim ? lim / d : 1;
      const px = R + rx * k, py = R + ry * k, pulso = 7 + Math.sin(performance.now() / 180) * 2;
      mctx.fillStyle = "#e5484d"; mctx.strokeStyle = "#fff"; mctx.lineWidth = 3;
      mctx.beginPath(); mctx.arc(px, py, pulso + (k < 1 ? 1 : 3), 0, Math.PI * 2); mctx.fill(); mctx.stroke();
      if (k < 1) { // seta apontando para fora
        const ang = Math.atan2(ry, rx);
        mctx.save(); mctx.translate(px, py); mctx.rotate(ang);
        mctx.beginPath(); mctx.moveTo(16, 0); mctx.lineTo(8, -6); mctx.lineTo(8, 6); mctx.closePath(); mctx.fillStyle = "#fff"; mctx.fill();
        mctx.restore();
      }
    }
    // viatura no centro, sempre para cima
    mctx.save(); mctx.translate(R, R);
    mctx.fillStyle = "#f2b632"; mctx.strokeStyle = "#0b1830"; mctx.lineWidth = 3;
    mctx.beginPath(); mctx.moveTo(0, -14); mctx.lineTo(10, 11); mctx.lineTo(0, 6); mctx.lineTo(-10, 11); mctx.closePath(); mctx.fill(); mctx.stroke();
    mctx.restore();
    // norte
    const nx = R + Math.sin(-giro) * 0 + (0 * Math.cos(giro) - (-1) * Math.sin(giro)) * (R - 18), ny = R + (0 * Math.sin(giro) + (-1) * Math.cos(giro)) * (R - 18);
    mctx.fillStyle = "#0b1830"; mctx.beginPath(); mctx.arc(nx, ny, 13, 0, Math.PI * 2); mctx.fill();
    mctx.fillStyle = "#fff"; mctx.font = "800 16px system-ui"; mctx.textAlign = "center"; mctx.textBaseline = "middle"; mctx.fillText("N", nx, ny + 1);
    // borda
    mctx.strokeStyle = "rgba(255,255,255,.85)"; mctx.lineWidth = 5; mctx.beginPath(); mctx.arc(R, R, R - 4, 0, Math.PI * 2); mctx.stroke();
  }

  // Qualidade automática: se o aparelho estiver lento, diminui a resolução
  let amostras = 0, soma = 0;
  // 1º baixa a resolução; se ainda estiver lento, desliga as sombras
  const QUALIDADE_FIXA = new URLSearchParams(location.search).has("alta");
  function ajustarQualidade(dt) {
    if (QUALIDADE_FIXA || pausado || (qualidade <= 0.75 && !renderer.shadowMap.enabled)) return;
    amostras++; soma += dt;
    if (amostras < 60) return;
    const media = soma / amostras; amostras = 0; soma = 0;
    if (media <= 1 / 40) return;
    if (qualidade > 1) {
      qualidade = 1;
      renderer.setPixelRatio(qualidade);
      redimensionar();
    } else if (renderer.shadowMap.enabled) {
      renderer.shadowMap.enabled = false; sol.castShadow = false;
      scene.traverse(o => { if (o.material) o.material.needsUpdate = true; });
      scene.fog.far = 1000; camera.far = 1300; camera.updateProjectionMatrix();
    } else {
      qualidade = 0.75;
      renderer.setPixelRatio(qualidade);
      redimensionar();
    }
  }

  let ultimo = performance.now();
  function loop(t) {
    const dt = Math.min(0.05, (t - ultimo) / 1000); ultimo = t;
    if (!pausado) atualizar(dt);
    atualizarTransito(dt); atualizarPedestres(dt); if (!pausado) resolverBatidas(dt); atualizarCena(dt); atualizarEfeitos(dt); atualizarSom(); // a cidade segue viva até com a pergunta aberta
    desenhar(t, dt);
    ajustarQualidade(dt);
    requestAnimationFrame(loop);
  }

  redimensionar();
  requestAnimationFrame(loop);
  window.__plantao = { scene, get policial() { return policial; }, get bandido() { return bandido; }, get conf() { return conf; }, get fila() { return fila; }, get idx() { return idx; }, get cena() { return cena; }, transito, pedestres, car, get atual() { return atual; }, get xp() { return xp; }, abrirOcorrencia, renderer, get qualidade() { return qualidade; } }; // para testes
})();
