import { useState, useRef, useEffect } from "react";

/* ─── FONTES ─────────────────────────────────────────────────────────────── */
const FontLink = () => (
  <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&display=swap');
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#0d0d0d}
  input[type=range]{-webkit-appearance:none;width:100%;height:4px;border-radius:2px;outline:none;cursor:pointer}
  input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:20px;height:20px;border-radius:50%;cursor:pointer}
  @keyframes slideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  `}</style>
);

/* ─── TABELAS (NOVOS é recebido como prop tabelaNovos) ───────────────────── */

const USADOS = {
  "iPhone XR":       {"64GB":500,"128GB":700,"256GB":900},
  "iPhone 11":       {"64GB":700,"128GB":900,"256GB":1300},
  "iPhone 11 Pro":   {"64GB":1100,"256GB":1400},
  "iPhone 11 Pro Max":{"64GB":1300,"256GB":1500},
  "iPhone 12":       {"64GB":1000,"128GB":1300,"256GB":1500,"512GB":1800},
  "iPhone 12 Pro":   {"128GB":1500,"256GB":1700,"512GB":1800},
  "iPhone 12 Pro Max":{"128GB":1800,"256GB":2100,"512GB":2300},
  "iPhone 13":       {"128GB":1600,"256GB":1800,"512GB":2000},
  "iPhone 13 Pro":   {"128GB":2000,"256GB":2200,"512GB":2600,"1TB":2800},
  "iPhone 13 Pro Max":{"128GB":2300,"256GB":2500,"512GB":2700,"1TB":3100},
  "iPhone 14":       {"128GB":1900,"256GB":2200,"512GB":2500},
  "iPhone 14 Plus":  {"128GB":2200,"256GB":2500,"512GB":2900},
  "iPhone 14 Pro":   {"128GB":2300,"256GB":2500,"512GB":2700,"1TB":3000},
  "iPhone 14 Pro Max":{"128GB":2900,"256GB":3100,"512GB":3300,"1TB":3600},
  "iPhone 15":       {"128GB":2500,"256GB":2700,"512GB":2800},
  "iPhone 15 Plus":  {"128GB":2700,"256GB":2800,"512GB":2900},
  "iPhone 15 Pro":   {"128GB":3100,"256GB":3300,"512GB":3500,"1TB":3600},
  "iPhone 15 Pro Max":{"256GB":3800,"512GB":4100,"1TB":4400},
  "iPhone 16":       {"128GB":3300,"256GB":3300},
  "iPhone 16 Plus":  {"128GB":3600,"256GB":3800,"512GB":4000},
  "iPhone 16 Pro":   {"128GB":4300,"256GB":4500,"512GB":5000},
  "iPhone 16 Pro Max":{"256GB":5000,"512GB":5500,"1TB":6000},
  "iPhone 17":       {"256GB":4500,"512GB":4900},
  "iPhone 17 Air":   {"256GB":4700,"512GB":5100},
  "iPhone 17 Pro":   {"256GB":6700,"512GB":7500,"1TB":8000},
};

const BAT_DESC = {
  "iPhone 16":       {"128GB":3100},
  "iPhone 16 Plus":  {"128GB":3400,"256GB":3600,"512GB":3800},
  "iPhone 16 Pro":   {"128GB":4100,"256GB":4300,"512GB":4800},
  "iPhone 16 Pro Max":{"256GB":4800,"512GB":5300,"1TB":5800},
};

const GARANTIA_BONUS = {nao:0,ate3:0,"3a6":200,"6a9":300,mais9:400};

const GARANTIA_ELEGIVEL = ["iPhone 16","iPhone 16 Plus","iPhone 16 Pro","iPhone 16 Pro Max","iPhone 17","iPhone 17 Air","iPhone 17 Pro"];

const BLOQUEADOS = ["iPhone 6","iPhone 7","iPhone 7 Plus","iPhone 8","iPhone 8 Plus","iPhone X","iPhone XS","iPhone XS Max","iPhone 12 Mini","iPhone 13 Mini","iPhone SE"];

/* ─── HELPERS ─────────────────────────────────────────────────────────────── */
const fmtBR = n => n.toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2});
const fmtInt = n => Math.round(n).toLocaleString("pt-BR");

function calcResult(modeloNovo, memNovo, modeloUsado, memUsado, bateria, conds) {
  const novoData = NOVOS[modeloNovo]?.[memNovo];
  const usadoBase = USADOS[modeloUsado]?.[memUsado];
  if (!novoData || !usadoBase) return null;

  // Bateria
  let valorBase = usadoBase;
  const temBatDesc = BAT_DESC[modeloUsado]?.[memUsado] !== undefined;
  if (bateria < 95 && temBatDesc) {
    valorBase = BAT_DESC[modeloUsado][memUsado];
  }

  const descTela    = conds.tela    === "1" ? -100 : conds.tela    === "2" ? -250 : 0;
  const descLateral = conds.lateral === "1" ? -100 : conds.lateral === "2" ? -250 : 0;
  const descPeeling = conds.peeling === "leve" ? -200 : conds.peeling === "muito" ? -300 : 0;
  const bonusGar    = GARANTIA_ELEGIVEL.includes(modeloUsado) ? (GARANTIA_BONUS[conds.garantia] || 0) : 0;

  const avaliacao_final = valorBase + descTela + descLateral + descPeeling + bonusGar;
  const diferenca = novoData.pix - avaliacao_final;
  const pix = Math.round(diferenca / 100) * 100 - 3;

  const t12 = pix * 1.1313; const p12 = t12 / 12;
  const t18 = pix * 1.4174; const p18 = t18 / 18;
  const t21 = pix * 1.2186; const p21 = t21 / 21;

  return {
    novoData, avaliacao_final, diferenca,
    pix, t12, p12, t18, p18, t21, p21,
    breakdown: { valorBase, descTela, descLateral, descPeeling, bonusGar, bateria, temBatDesc }
  };
}

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const buf = reader.result;
      const bytes = new Uint8Array(buf);
      let bin = "";
      const CHUNK = 8192;
      for (let i = 0; i < bytes.length; i += CHUNK) {
        bin += String.fromCharCode(...bytes.subarray(i, Math.min(i + CHUNK, bytes.length)));
      }
      resolve(btoa(bin));
    };
    reader.onerror = () => reject(new Error("Erro ao ler arquivo"));
    reader.readAsArrayBuffer(file);
  });
}

/* ─── CORES / ESTILOS BASE ───────────────────────────────────────────────── */
const C = {
  bg: "#0d0d0d", card: "#161616", orange: "#FF6B00", orangeDim: "rgba(255,107,0,0.15)",
  border: "rgba(255,107,0,0.18)", text: "#f0f0f0", muted: "#888", faint: "#333",
};

const base = {
  fontFamily: "'Syne', -apple-system, sans-serif",
  background: C.bg, color: C.text, minHeight: "100vh",
};

function Card({ children, style = {} }) {
  return (
    <div style={{
      background: C.card, borderRadius: 16,
      border: `1px solid ${C.border}`,
      borderTop: `2px solid ${C.orange}`,
      padding: 20, marginBottom: 16, ...style
    }}>{children}</div>
  );
}

function Label({ children, style = {} }) {
  return <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "1.2px", marginBottom: 10, fontWeight: 600, ...style }}>{children}</div>;
}

function Chip({ active, children, onClick, color }) {
  return (
    <button onClick={onClick} style={{
      padding: "7px 14px", borderRadius: 20,
      border: active ? `1.5px solid ${color || C.orange}` : `1px solid ${C.faint}`,
      background: active ? `rgba(${color ? "255,107,0" : "255,107,0"},.15)` : "transparent",
      color: active ? (color || C.orange) : C.muted,
      fontSize: 13, cursor: "pointer", fontFamily: "inherit",
      transition: "all .15s", whiteSpace: "nowrap",
    }}>{children}</button>
  );
}

function Select({ value, onChange, options, placeholder }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)} style={{
      width: "100%", padding: "11px 14px", background: "#1a1a1a",
      border: `1px solid ${C.faint}`, borderRadius: 10, color: value ? C.text : C.muted,
      fontSize: 14, fontFamily: "inherit", outline: "none", cursor: "pointer",
    }}>
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

/* ─── MODAL CONDIÇÕES ────────────────────────────────────────────────────── */
function Modal({ conds, onChange, onClose, modeloUsado }) {
  const [local, setLocal] = useState({ ...conds });
  const eligible = GARANTIA_ELEGIVEL.includes(modeloUsado);

  const set = (k, v) => setLocal(p => ({ ...p, [k]: v }));

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      backdropFilter: "blur(6px)", background: "rgba(0,0,0,.7)",
      display: "flex", alignItems: "flex-end",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: "100%", maxWidth: 480, margin: "0 auto",
        background: "#1a1a1a", borderRadius: "24px 24px 0 0",
        padding: "0 20px 40px", animation: "slideUp .3s ease",
        maxHeight: "85vh", overflowY: "auto",
        border: `1px solid ${C.border}`, borderBottom: "none",
      }}>
        {/* Handle */}
        <div style={{ display: "flex", justifyContent: "center", padding: "14px 0 20px" }}>
          <div style={{ width: 40, height: 4, background: C.faint, borderRadius: 2 }} />
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 24 }}>Condições do aparelho</div>

        {/* Tela */}
        <CondGroup label="Arranhões na tela">
          {[["0","✅ Nenhum",null],["1","⚠️ 1 arranhão","#f59e0b"],["2","🔴 2 ou mais","#ef4444"]].map(([v,l,c])=>(
            <Chip key={v} active={local.tela===v} color={c} onClick={()=>set("tela",v)}>{l}</Chip>
          ))}
        </CondGroup>

        {/* Lateral */}
        <CondGroup label="Arranhões laterais">
          {[["0","✅ Nenhum",null],["1","⚠️ 1 arranhão","#f59e0b"],["2","🔴 2 ou mais","#ef4444"]].map(([v,l,c])=>(
            <Chip key={v} active={local.lateral===v} color={c} onClick={()=>set("lateral",v)}>{l}</Chip>
          ))}
        </CondGroup>

        {/* Peeling */}
        <CondGroup label="Descascado / amassado">
          {[["sem","✅ Sem",null],["leve","⚠️ Leve","#f59e0b"],["muito","🔴 Muito","#ef4444"]].map(([v,l,c])=>(
            <Chip key={v} active={local.peeling===v} color={c} onClick={()=>set("peeling",v)}>{l}</Chip>
          ))}
        </CondGroup>

        {/* Defeito */}
        <CondGroup label="Defeito / tela trincada">
          {[["nao","✅ Sem defeito",null],["sim","🚫 Tem defeito","#ef4444"]].map(([v,l,c])=>(
            <Chip key={v} active={local.defeito===v} color={c} onClick={()=>set("defeito",v)}>{l}</Chip>
          ))}
        </CondGroup>

        {/* Garantia — só elegíveis */}
        {eligible && (
          <CondGroup label="🍎 Garantia Apple ativa">
            {[["nao","❌ Fora"],["ate3","🍎 Até 3m"],["3a6","🍎 3–6m +200"],["6a9","🍎 6–9m +300"],["mais9","🍎 +9m +400"]].map(([v,l])=>(
              <Chip key={v} active={local.garantia===v} onClick={()=>set("garantia",v)}>{l}</Chip>
            ))}
          </CondGroup>
        )}

        <button onClick={() => { onChange(local); onClose(); }} style={{
          width: "100%", padding: "14px", marginTop: 8,
          background: `linear-gradient(135deg, ${C.orange}, #ff9500)`,
          border: "none", borderRadius: 12, color: "#fff",
          fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
          boxShadow: "0 4px 16px rgba(255,107,0,.4)",
        }}>Confirmar ✓</button>
      </div>
    </div>
  );
}

function CondGroup({ label, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <Label>{label}</Label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{children}</div>
    </div>
  );
}

/* ─── APP PRINCIPAL ──────────────────────────────────────────────────────── */
export default function App({ tabelaNovos }) {
  const NOVOS = tabelaNovos || {};
  // Produto novo
  const [modeloNovo, setModeloNovo] = useState("");
  const [memNovo, setMemNovo]       = useState("");
  // Usado
  const [modeloUsado, setModeloUsado] = useState("");
  const [memUsado, setMemUsado]       = useState("");
  const [bateria, setBateria]         = useState(100);
  // Condições
  const [conds, setConds] = useState({ tela:"0", lateral:"0", peeling:"sem", defeito:"nao", garantia:"nao" });
  const [modalOpen, setModalOpen] = useState(false);
  // IA
  const [iaLoading, setIaLoading] = useState(false);
  const [iaError, setIaError]     = useState("");
  const [imgPreview, setImgPreview] = useState(null);
  // Resultado
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef();

  const bloqueado = BLOQUEADOS.some(b => modeloUsado.toLowerCase().includes(b.toLowerCase()));
  const memNovoOpts  = modeloNovo ? Object.keys(NOVOS[modeloNovo] || {}) : [];
  const memUsadoOpts = modeloUsado ? Object.keys(USADOS[modeloUsado] || {}) : [];
  const temBatDesc   = BAT_DESC[modeloUsado] !== undefined;

  // Cor slider bateria
  const batColor = bateria >= 95 ? "#22c55e" : bateria >= 80 ? "#f59e0b" : "#ef4444";

  // Chips resumo condições
  const condChips = [];
  if (conds.tela !== "0") condChips.push({ label: conds.tela === "1" ? "Tela: 1 risco −100" : "Tela: 2+ −250", color: "#f59e0b" });
  if (conds.lateral !== "0") condChips.push({ label: conds.lateral === "1" ? "Lateral: 1 risco −100" : "Lateral: 2+ −250", color: "#f59e0b" });
  if (conds.peeling !== "sem") condChips.push({ label: conds.peeling === "leve" ? "Peeling leve −200" : "Peeling muito −300", color: "#f59e0b" });
  if (conds.defeito === "sim") condChips.push({ label: "⛔ Defeito", color: "#ef4444" });
  if (GARANTIA_ELEGIVEL.includes(modeloUsado) && conds.garantia !== "nao" && conds.garantia !== "ate3") {
    const bonus = { "3a6": "+200", "6a9": "+300", mais9: "+400" }[conds.garantia];
    condChips.push({ label: `Garantia Apple ${bonus}`, color: "#22c55e" });
  }

  const canCalc = modeloNovo && memNovo && modeloUsado && memUsado && !bloqueado && conds.defeito !== "sim";

  function calcular() {
    const r = calcResult(modeloNovo, memNovo, modeloUsado, memUsado, bateria, conds);
    setResult(r);
  }

  // Auto-calc on change
  useEffect(() => { if (canCalc) calcular(); else setResult(null); },
    [modeloNovo, memNovo, modeloUsado, memUsado, bateria, conds]);

  async function handleImage(file) {
    if (!file) return;
    setIaLoading(true); setIaError(""); setResult(null);
    setImgPreview(URL.createObjectURL(file));
    try {
      const b64 = await fileToBase64(file);
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 800,
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: file.type, data: b64 } },
              { type: "text", text: `Leia este print de formulário de troca de iPhone. Responda APENAS com JSON válido neste formato exato:
{"modeloUsado":"iPhone 14","memoriaUsada":"256GB","bateria":100,"modeloNovo":"iPhone 17 Pro","memoriaNova":"256GB","tela":0,"lateral":0,"descascado":0,"defeito":false}
tela/lateral: 0=nenhum,100=1 arranhão,250=2+. descascado: 0=sem,200=leve,300=muito. defeito: true/false. Se não encontrar algum campo, use o valor padrão/zero.` }
            ]
          }]
        })
      });
      const data = await resp.json();
      const text = data.content?.find(b => b.type === "text")?.text || "";
      const json = JSON.parse(text.replace(/```json|```/g, "").trim());

      // Preencher campos
      if (json.modeloNovo && NOVOS[json.modeloNovo]) setModeloNovo(json.modeloNovo);
      if (json.memoriaNova) setMemNovo(json.memoriaNova);
      if (json.modeloUsado && USADOS[json.modeloUsado]) setModeloUsado(json.modeloUsado);
      if (json.memoriaUsada) setMemUsado(json.memoriaUsada);
      if (json.bateria) setBateria(json.bateria);
      setConds({
        tela:     json.tela === 100 ? "1" : json.tela >= 250 ? "2" : "0",
        lateral:  json.lateral === 100 ? "1" : json.lateral >= 250 ? "2" : "0",
        peeling:  json.descascado === 200 ? "leve" : json.descascado >= 300 ? "muito" : "sem",
        defeito:  json.defeito ? "sim" : "nao",
        garantia: "nao",
      });
    } catch (e) {
      setIaError("Não foi possível ler o print. Preencha manualmente.");
    }
    setIaLoading(false);
  }

  const msgWpp = () => {
    if (!result) return "";
    const condDesc = [];
    if (conds.tela !== "0") condDesc.push(conds.tela === "1" ? "1 risco na tela" : "2+ riscos na tela");
    if (conds.lateral !== "0") condDesc.push(conds.tela === "1" ? "1 risco na lateral" : "2+ riscos na lateral");
    if (conds.peeling !== "sem") condDesc.push(conds.peeling === "leve" ? "peeling leve" : "peeling acentuado");
    const condicoes = condDesc.length ? condDesc.join(", ") : "boas condições";
    return `Olá! 😊 Segue o orçamento da sua troca:

*📱 ORÇAMENTO DE TROCA — TigrãoImports* 🐯
————————————————————

🆕 *Produto novo:*
${modeloNovo} ${memNovo}
🔒 Lacrado | 1 ano de garantia | Nota Fiscal

🔄 *Seu aparelho na troca:*
${modeloUsado} ${memUsado}
Bateria: ${bateria}% — ${condicoes}

*💰 Avaliação do seu aparelho: R$ ${fmtInt(result.avaliacao_final)}*

————————————————————
*Você paga apenas a diferença:*

*💵 R$ ${fmtInt(result.pix)}* à vista no PIX ✅
*💳 12x de R$ ${fmtBR(result.p12)}* (total: R$ ${fmtBR(result.t12)})
*💳 18x de R$ ${fmtBR(result.p18)}* (total: R$ ${fmtBR(result.t18)})
*💳 21x de R$ ${fmtBR(result.p21)}* (total: R$ ${fmtBR(result.t21)})

⏱ *Orçamento válido por apenas 24 horas.*
Qualquer dúvida, estou aqui! 🐯`;
  };

  const msgDefeito = `Olá! 😊 Agradecemos seu interesse em realizar a troca conosco! 🐯

Infelizmente, não conseguimos aceitar o aparelho na condição descrita. Aqui na TigrãoImports, trabalhamos com aparelhos em boas condições de funcionamento.

Para manter o nosso padrão de qualidade e garantir a melhor experiência para você e para todos os nossos clientes, não é possível realizar a troca neste caso.

Se você tiver outro aparelho em boas condições, ou se preferir comprar à vista ou parcelado, ficamos à disposição! 🙏`;

  return (
    <div style={base}>
      <FontLink />

      {/* HEADER */}
      <div style={{
        background: `linear-gradient(135deg, ${C.orange} 0%, #c44d00 100%)`,
        padding: "28px 20px 24px", position: "relative", overflow: "hidden",
      }}>
        {/* Listras diagonais */}
        <div style={{
          position: "absolute", inset: 0, opacity: .07,
          backgroundImage: "repeating-linear-gradient(45deg, #fff 0, #fff 2px, transparent 0, transparent 50%)",
          backgroundSize: "20px 20px",
        }} />
        {/* Tiger grande semitransparente */}
        <div style={{ position: "absolute", right: -10, top: -10, fontSize: 100, opacity: .12, userSelect: "none" }}>🐯</div>

        <div style={{ position: "relative" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(0,0,0,.25)", borderRadius: 20, padding: "4px 12px",
            fontSize: 11, fontWeight: 600, letterSpacing: ".5px", marginBottom: 10,
          }}>🐯 TigrãoImports · Uso Interno</div>
          <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.5px" }}>Calculadora de Troca</div>
          <div style={{ fontSize: 13, opacity: .8, marginTop: 4 }}>Calcule a diferença em segundos</div>
        </div>
      </div>

      <div style={{ padding: "20px 16px 80px", maxWidth: 480, margin: "0 auto" }}>

        {/* UPLOAD IA */}
        <Card>
          <Label>📸 Enviar print do cliente</Label>
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${iaLoading ? C.orange : C.faint}`,
              borderRadius: 12, padding: "24px 16px", textAlign: "center",
              cursor: "pointer", transition: "border-color .2s",
              background: imgPreview ? "transparent" : "#0d0d0d",
            }}
          >
            {iaLoading ? (
              <div style={{ color: C.orange }}>
                <div style={{ fontSize: 28, animation: "spin 1s linear infinite", display: "inline-block" }}>⏳</div>
                <div style={{ marginTop: 8, fontSize: 13 }}>Lendo print com IA...</div>
              </div>
            ) : imgPreview ? (
              <div>
                <img src={imgPreview} alt="preview" style={{ maxHeight: 120, borderRadius: 8, objectFit: "contain" }} />
                <div style={{ fontSize: 12, color: C.muted, marginTop: 8 }}>Toque para trocar</div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 36 }}>📱</div>
                <div style={{ fontSize: 14, color: C.muted, marginTop: 8 }}>Toque para enviar o print</div>
                <div style={{ fontSize: 11, color: C.faint, marginTop: 4 }}>A IA preenche tudo automaticamente</div>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
            onChange={e => handleImage(e.target.files[0])} />
          {iaError && <div style={{ color: "#ef4444", fontSize: 12, marginTop: 10 }}>⚠️ {iaError}</div>}
        </Card>

        {/* DIVIDER */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "4px 0 16px" }}>
          <div style={{ flex: 1, height: 1, background: C.faint }} />
          <span style={{ fontSize: 12, color: C.muted }}>ou preencha manualmente</span>
          <div style={{ flex: 1, height: 1, background: C.faint }} />
        </div>

        {/* PRODUTO NOVO */}
        <Card>
          <Label>🆕 Produto Novo</Label>
          <div style={{ display: "grid", gap: 10 }}>
            <Select value={modeloNovo} onChange={v => { setModeloNovo(v); setMemNovo(""); }} options={Object.keys(NOVOS)} placeholder="Selecione o modelo novo" />
            {modeloNovo && (
              <Select value={memNovo} onChange={setMemNovo} options={memNovoOpts} placeholder="Selecione a memória" />
            )}
          </div>
          {memNovo && NOVOS[modeloNovo]?.[memNovo] && (
            <div style={{
              marginTop: 14, padding: "14px 16px",
              background: C.orangeDim, border: `1px solid ${C.border}`,
              borderRadius: 12, display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8,
            }}>
              {[
                ["PIX", `R$ ${fmtInt(NOVOS[modeloNovo][memNovo].pix)}`, true],
                ["12x", `R$ ${fmtBR(NOVOS[modeloNovo][memNovo].p12)}`, false],
                ["18x", `R$ ${fmtBR(NOVOS[modeloNovo][memNovo].p18)}`, false],
                ["21x", `R$ ${fmtBR(NOVOS[modeloNovo][memNovo].p21)}`, false],
              ].map(([l, v, hl]) => (
                <div key={l} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: C.muted, marginBottom: 3 }}>{l}</div>
                  <div style={{ fontSize: hl ? 15 : 13, fontWeight: 700, color: hl ? C.orange : C.text, fontFamily: "monospace" }}>{v}</div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* APARELHO DO CLIENTE */}
        <Card>
          <Label>🔄 Aparelho do Cliente</Label>
          <div style={{ display: "grid", gap: 10 }}>
            <Select value={modeloUsado} onChange={v => { setModeloUsado(v); setMemUsado(""); }} options={Object.keys(USADOS)} placeholder="Selecione o modelo usado" />
            {modeloUsado && (
              <Select value={memUsado} onChange={setMemUsado} options={memUsadoOpts} placeholder="Selecione a memória" />
            )}
          </div>

          {bloqueado && (
            <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", borderRadius: 10, fontSize: 13, color: "#ef4444" }}>
              🚫 Modelo não aceito na troca
            </div>
          )}

          {memUsado && !bloqueado && (
            <>
              {/* Slider bateria */}
              <div style={{ marginTop: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <Label style={{ marginBottom: 0 }}>Saúde da bateria</Label>
                  <span style={{ fontSize: 15, fontWeight: 700, color: batColor, fontFamily: "monospace" }}>{bateria}%</span>
                </div>
                <input type="range" min={60} max={100} value={bateria} onChange={e => setBateria(Number(e.target.value))}
                  style={{
                    background: `linear-gradient(to right, ${batColor} ${(bateria - 60) / 40 * 100}%, ${C.faint} 0%)`,
                    accentColor: batColor,
                  }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: C.muted, marginTop: 4 }}>
                  <span>60%</span>
                  {bateria < 95 && temBatDesc && <span style={{ color: "#f59e0b" }}>⚠️ Desconto de bateria aplicado</span>}
                  {bateria < 95 && !temBatDesc && <span style={{ color: C.muted }}>Verificar caso a caso</span>}
                  <span>100%</span>
                </div>
              </div>

              {/* Botão condições */}
              <button onClick={() => setModalOpen(true)} style={{
                width: "100%", marginTop: 14, padding: "12px",
                background: "#1e1e1e", border: `1px solid ${C.faint}`,
                borderRadius: 10, color: C.text, fontSize: 14,
                cursor: "pointer", fontFamily: "inherit", display: "flex",
                alignItems: "center", justifyContent: "center", gap: 8,
              }}>
                📋 Avaliar condições
              </button>

              {/* Chips condições */}
              {condChips.length > 0 && (
                <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {condChips.map((c, i) => (
                    <span key={i} style={{
                      padding: "4px 10px", borderRadius: 20, fontSize: 12,
                      background: `${c.color}22`, border: `1px solid ${c.color}55`,
                      color: c.color,
                    }}>{c.label}</span>
                  ))}
                </div>
              )}

              {/* Defeito bloqueado */}
              {conds.defeito === "sim" && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ padding: "12px 14px", background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", borderRadius: 10, fontSize: 13, color: "#ef4444", marginBottom: 10 }}>
                    🚫 Aparelho com defeito não é aceito na troca.
                  </div>
                  <CopyBox text={msgDefeito} label="📋 Copiar mensagem de recusa" />
                </div>
              )}
            </>
          )}
        </Card>

        {/* RESULTADO */}
        {result && canCalc && (
          <div style={{ animation: "fadeUp .3s ease" }}>
            {/* Hero diferença */}
            <div style={{
              background: `linear-gradient(135deg, #1a0a00, #2a1000)`,
              border: `1.5px solid ${C.border}`,
              borderTop: `2px solid ${C.orange}`,
              borderRadius: 16, padding: "24px 20px", marginBottom: 16, textAlign: "center",
            }}>
              <div style={{ fontSize: 12, color: C.muted, letterSpacing: "1px", marginBottom: 8 }}>DIFERENÇA A PAGAR</div>
              <div style={{ fontSize: 44, fontWeight: 800, color: C.orange, fontFamily: "monospace", letterSpacing: "-1px" }}>
                R$ {fmtInt(result.pix)}
              </div>
              <div style={{ fontSize: 13, color: C.muted, marginTop: 6 }}>à vista no PIX</div>
            </div>

            {/* Breakdown */}
            <Card>
              <Label>Detalhamento</Label>
              {[
                ["Valor base do usado", result.breakdown.valorBase, false],
                ...(result.breakdown.descTela ? [["Arranhão tela", result.breakdown.descTela, true]] : []),
                ...(result.breakdown.descLateral ? [["Arranhão lateral", result.breakdown.descLateral, true]] : []),
                ...(result.breakdown.descPeeling ? [["Peeling/amassado", result.breakdown.descPeeling, true]] : []),
                ...(result.breakdown.bonusGar ? [["Bônus garantia Apple", result.breakdown.bonusGar, false]] : []),
                ["= Avaliação final", result.avaliacao_final, false],
                [`Produto novo (PIX)`, result.novoData.pix, false],
                ["= Diferença bruta", result.diferenca, false],
              ].map(([l, v, neg]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${C.faint}`, fontSize: 13 }}>
                  <span style={{ color: C.muted }}>{l}</span>
                  <span style={{ fontFamily: "monospace", fontWeight: 600, color: neg ? "#ef4444" : v > 0 && l.includes("Bônus") ? "#22c55e" : C.text }}>
                    {v >= 0 ? "R$ " : "−R$ "}{fmtInt(Math.abs(v))}
                  </span>
                </div>
              ))}
            </Card>

            {/* Grid pagamentos */}
            <Card>
              <Label>Formas de pagamento</Label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
                {[
                  ["PIX", fmtInt(result.pix), fmtInt(result.pix), true],
                  ["12x", fmtBR(result.p12), fmtBR(result.t12), false],
                  ["18x", fmtBR(result.p18), fmtBR(result.t18), false],
                  ["21x", fmtBR(result.p21), fmtBR(result.t21), false],
                ].map(([l, parc, total, hl]) => (
                  <div key={l} style={{
                    padding: "14px 12px", borderRadius: 12, textAlign: "center",
                    background: hl ? C.orangeDim : "#1a1a1a",
                    border: hl ? `1.5px solid ${C.orange}` : `1px solid ${C.faint}`,
                  }}>
                    <div style={{ fontSize: 11, color: C.muted, marginBottom: 4 }}>{l}</div>
                    <div style={{ fontSize: hl ? 20 : 16, fontWeight: 700, color: hl ? C.orange : C.text, fontFamily: "monospace" }}>R$ {parc}</div>
                    {l !== "PIX" && <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>total R$ {total}</div>}
                  </div>
                ))}
              </div>
            </Card>

            {/* Mensagem WhatsApp */}
            <Card>
              <Label>📲 Mensagem WhatsApp</Label>
              <pre style={{
                fontFamily: "inherit", fontSize: 12, lineHeight: 1.7, color: "#ccc",
                whiteSpace: "pre-wrap", wordBreak: "break-word",
                background: "#0d0d0d", borderRadius: 10, padding: 14,
                border: `1px solid ${C.faint}`, maxHeight: 220, overflowY: "auto",
              }}>{msgWpp()}</pre>
              <CopyBox text={msgWpp()} label="📋 Copiar mensagem" style={{ marginTop: 10 }} />
            </Card>

            <div style={{ textAlign: "center", fontSize: 12, color: C.muted, marginBottom: 16 }}>
              ⏱ Orçamento válido por 24 horas
            </div>

            {/* Novo orçamento */}
            <button onClick={() => {
              setModeloNovo(""); setMemNovo(""); setModeloUsado(""); setMemUsado("");
              setBateria(100); setConds({ tela:"0", lateral:"0", peeling:"sem", defeito:"nao", garantia:"nao" });
              setResult(null); setImgPreview(null); setIaError("");
            }} style={{
              width: "100%", padding: "13px",
              background: "transparent", border: `1px solid ${C.faint}`,
              borderRadius: 12, color: C.muted, fontSize: 14,
              cursor: "pointer", fontFamily: "inherit",
            }}>🔄 Novo orçamento</button>
          </div>
        )}
      </div>

      {modalOpen && (
        <Modal conds={conds} onChange={setConds} onClose={() => setModalOpen(false)} modeloUsado={modeloUsado} />
      )}
    </div>
  );
}

function CopyBox({ text, label, style = {} }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      style={{
        width: "100%", padding: "12px",
        background: copied ? "rgba(34,197,94,.1)" : "#1a1a1a",
        border: `1px solid ${copied ? "rgba(34,197,94,.4)" : "rgba(255,107,0,.3)"}`,
        borderRadius: 10, color: copied ? "#22c55e" : "#FF6B00",
        fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
        ...style
      }}>
      {copied ? "✓ Copiado!" : label}
    </button>
  );
}
