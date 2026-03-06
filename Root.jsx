import { useState, useEffect } from "react";
import Calculadora from "./Calculadora.jsx";

/* ── Tabelas default (fallback se não houver nada salvo) ─────────────────── */
const NOVOS_DEFAULT = {
  "iPhone 13":        { "128GB": { pix:3597, p12:339, p18:238, p21:209 } },
  "iPhone 14":        { "128GB": { pix:3797, p12:357, p18:249, p21:220 } },
  "iPhone 15":        { "128GB": { pix:4497, p12:423, p18:297, p21:261 } },
  "iPhone 16":        { "128GB": { pix:4697, p12:442, p18:311, p21:273 }, "256GB": { pix:5197, p12:489, p18:344, p21:302 } },
  "iPhone 16 Plus":   { "128GB": { pix:5297, p12:499, p18:350, p21:308 } },
  "iPhone 17":        { "256GB": { pix:6297, p12:593, p18:416, p21:366 } },
  "iPhone 17 Air":    { "256GB": { pix:6497, p12:612, p18:459, p21:377 } },
  "iPhone 17 Pro":    { "256GB": { pix:8497, p12:800, p18:562, p21:494 }, "512GB": { pix:9497, p12:894, p18:628, p21:552 }, "1TB": { pix:10797, p12:1017, p18:714, p21:627 } },
  "iPhone 17 Pro Max":{ "256GB": { pix:8997, p12:847, p18:595, p21:523 }, "512GB": { pix:10497, p12:988, p18:694, p21:610 }, "1TB": { pix:11797, p12:1111, p18:780, p21:685 }, "2TB": { pix:13997, p12:1318, p18:925, p21:813 } },
};

const SK_NOVOS  = "tigrao_novos_v1";
const SK_USADOS = "tigrao_usados_v1";

async function storageGet(key, fallback) {
  try {
    const r = await window.storage.get(key);
    return r ? JSON.parse(r.value) : fallback;
  } catch { return fallback; }
}
async function storageSet(key, val) {
  try { await window.storage.set(key, JSON.stringify(val)); } catch {}
}

/* ── Estilos ─────────────────────────────────────────────────────────────── */
const C = { bg:"#f5f5f7", card:"#ffffff", orange:"#FF6B00", border:"rgba(255,107,0,0.18)", text:"#1a1a1a", muted:"#666", faint:"#e0e0e0" };

const S = {
  page:     { minHeight:"100vh", background:C.bg, fontFamily:"'Syne',-apple-system,sans-serif", color:C.text },
  tabBar:   { display:"flex", background:"#f5f5f7", borderBottom:`1px solid ${C.faint}`, position:"sticky", top:0, zIndex:20 },
  tab:      a => ({ flex:1, padding:"14px 0", background:"transparent", border:"none", borderBottom: a?`2px solid ${C.orange}`:"2px solid transparent", color: a?C.orange:C.muted, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit", transition:"all .15s" }),
  card:     { background:C.card, borderRadius:14, border:`1px solid ${C.faint}`, borderTop:`2px solid ${C.orange}`, padding:16, marginBottom:12 },
  lbl:      { fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:"1px", marginBottom:8, fontWeight:600 },
  input:    { width:"100%", padding:"10px 12px", background:"#f5f5f7", border:`1px solid ${C.faint}`, borderRadius:10, color:C.text, fontSize:13, fontFamily:"inherit", outline:"none", boxSizing:"border-box" },
  btnOr:    { width:"100%", padding:"13px", background:`linear-gradient(135deg,${C.orange},#ff9500)`, border:"none", borderRadius:11, color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit", boxShadow:"0 4px 14px rgba(255,107,0,.3)" },
  btnSm:    { padding:"7px 13px", background:"#f0f0f0", border:`1px solid ${C.faint}`, borderRadius:8, color:C.muted, fontSize:12, cursor:"pointer", fontFamily:"inherit" },
  btnDel:   { padding:"7px 10px", background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.25)", borderRadius:8, color:"#ef4444", fontSize:12, cursor:"pointer", fontFamily:"inherit" },
};

/* ══════════════════════════════════════════════════════════════════════════ */
export default function Root() {
  const [tab, setTab]       = useState("calc");
  const [novos, setNovos]   = useState(null);
  const [saved, setSaved]   = useState(false);

  useEffect(() => {
    storageGet(SK_NOVOS, NOVOS_DEFAULT).then(setNovos);
  }, []);

  const saveNovos = (data) => {
    setNovos(data);
    storageSet(SK_NOVOS, data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!novos) return <div style={{ ...S.page, display:"flex", alignItems:"center", justifyContent:"center", color:C.muted }}>Carregando...</div>;

  return (
    <div style={S.page}>
      <div style={S.tabBar}>
        <button style={S.tab(tab==="calc")}   onClick={()=>setTab("calc")}>🐯 Calculadora</button>
        <button style={S.tab(tab==="precos")} onClick={()=>setTab("precos")}>💰 Preços</button>
      </div>

      {tab === "calc"
        ? <Calculadora tabelaNovos={novos} />
        : <TabPrecos novos={novos} onSave={saveNovos} saved={saved} />
      }
    </div>
  );
}

/* ── Aba Preços ──────────────────────────────────────────────────────────── */
function TabPrecos({ novos, onSave, saved }) {
  const [data, setData]         = useState(() => JSON.parse(JSON.stringify(novos)));
  const [editMod, setEditMod]   = useState(null); // { modelo, mem }
  const [editVals, setEditVals] = useState({});
  const [novoMod, setNovoMod]   = useState("");
  const [novoMem, setNovoMem]   = useState("");
  const [novoPix, setNovoPix]   = useState("");

  const calcParcelas = (pix) => {
    const p = Number(pix);
    return {
      pix: p,
      p12: Math.ceil((p * 1.1313) / 12),
      p18: Math.ceil((p * 1.4174) / 18),
      p21: Math.ceil((p * 1.2186) / 21),
    };
  };

  const startEdit = (modelo, mem) => {
    setEditMod(`${modelo}||${mem}`);
    setEditVals({ ...data[modelo][mem] });
  };

  const saveEdit = (modelo, mem) => {
    const updated = JSON.parse(JSON.stringify(data));
    updated[modelo][mem] = {
      pix: Number(editVals.pix),
      p12: Number(editVals.p12),
      p18: Number(editVals.p18),
      p21: Number(editVals.p21),
    };
    setData(updated);
    setEditMod(null);
  };

  const autoCalc = (pix) => {
    const c = calcParcelas(pix);
    setEditVals({ pix: c.pix, p12: c.p12, p18: c.p18, p21: c.p21 });
  };

  const deleteMem = (modelo, mem) => {
    const updated = JSON.parse(JSON.stringify(data));
    delete updated[modelo][mem];
    if (Object.keys(updated[modelo]).length === 0) delete updated[modelo];
    setData(updated);
  };

  const addVariacao = () => {
    if (!novoMod.trim() || !novoMem.trim() || !novoPix) return;
    const c = calcParcelas(novoPix);
    const updated = JSON.parse(JSON.stringify(data));
    if (!updated[novoMod]) updated[novoMod] = {};
    updated[novoMod][novoMem] = c;
    setData(updated);
    setNovoMem(""); setNovoPix("");
  };

  const fmtInt = n => Math.round(n).toLocaleString("pt-BR");

  return (
    <div style={{ padding:"16px 16px 80px", maxWidth:480, margin:"0 auto" }}>

      {/* Salvar */}
      <button onClick={() => onSave(data)} style={{ ...S.btnOr, marginBottom:16, background: saved ? "rgba(34,197,94,.15)" : undefined, border: saved ? "1px solid rgba(34,197,94,.4)" : "none", color: saved ? "#22c55e" : "#fff", boxShadow: saved ? "none" : undefined }}>
        {saved ? "✓ Salvo com sucesso!" : "💾 Salvar alterações"}
      </button>

      <div style={{ fontSize:12, color:C.muted, marginBottom:16, padding:"10px 12px", background:"#f5f5f7", borderRadius:10, border:`1px solid ${C.faint}` }}>
        💡 Edite os preços abaixo e clique em <strong style={{color:C.text}}>Salvar alterações</strong>. A calculadora atualiza na hora.
      </div>

      {/* Lista de modelos */}
      {Object.entries(data).map(([modelo, mems]) => (
        <div key={modelo} style={S.card}>
          <div style={{ fontSize:14, fontWeight:700, marginBottom:12, color:C.text }}>{modelo}</div>

          {Object.entries(mems).map(([mem, vals]) => {
            const key = `${modelo}||${mem}`;
            const isEditing = editMod === key;

            return (
              <div key={mem} style={{ marginBottom: isEditing ? 14 : 8 }}>
                {isEditing ? (
                  <div style={{ background:"#f5f5f7", borderRadius:10, padding:12, border:`1px solid ${C.orange}` }}>
                    <div style={{ fontWeight:700, marginBottom:10, color:C.orange }}>{mem}</div>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
                      <div>
                        <div style={S.lbl}>PIX (R$)</div>
                        <input style={S.input} value={editVals.pix} inputMode="numeric"
                          onChange={e => setEditVals(p=>({...p,pix:e.target.value}))}
                          onBlur={e => autoCalc(e.target.value)} />
                        <div style={{fontSize:10,color:C.muted,marginTop:3}}>Parcelas recalculadas ao sair</div>
                      </div>
                      {[["p12","12x"],["p18","18x"],["p21","21x"]].map(([k,l])=>(
                        <div key={k}>
                          <div style={S.lbl}>{l} (R$)</div>
                          <input style={S.input} value={editVals[k]} inputMode="numeric"
                            onChange={e => setEditVals(p=>({...p,[k]:e.target.value}))} />
                        </div>
                      ))}
                    </div>
                    <div style={{ display:"flex", gap:8 }}>
                      <button onClick={() => saveEdit(modelo, mem)} style={{ ...S.btnOr, padding:"9px" }}>✓ Confirmar</button>
                      <button onClick={() => setEditMod(null)} style={{ ...S.btnSm, flex:1 }}>Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 10px", background:"#f5f5f7", borderRadius:10 }}>
                    <div>
                      <span style={{ fontSize:13, fontWeight:600, color:C.text }}>{mem}</span>
                      <span style={{ fontSize:13, color:C.orange, marginLeft:10, fontFamily:"monospace" }}>R$ {fmtInt(vals.pix)}</span>
                      <span style={{ fontSize:11, color:C.muted, marginLeft:8 }}>12x {fmtInt(vals.p12)} · 18x {fmtInt(vals.p18)} · 21x {fmtInt(vals.p21)}</span>
                    </div>
                    <div style={{ display:"flex", gap:6 }}>
                      <button style={S.btnSm} onClick={() => startEdit(modelo, mem)}>✏️</button>
                      <button style={S.btnDel} onClick={() => deleteMem(modelo, mem)}>🗑</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Adicionar memória ao modelo existente */}
          {novoMod === modelo ? (
            <div style={{ marginTop:8, display:"grid", gridTemplateColumns:"1fr 1fr 44px", gap:8, alignItems:"end" }}>
              <div>
                <div style={S.lbl}>Memória</div>
                <input style={S.input} value={novoMem} onChange={e=>setNovoMem(e.target.value)} placeholder="ex: 512GB" />
              </div>
              <div>
                <div style={S.lbl}>PIX R$</div>
                <input style={S.input} value={novoPix} onChange={e=>setNovoPix(e.target.value.replace(/\D/g,""))} placeholder="9997" inputMode="numeric" />
              </div>
              <button onClick={addVariacao} style={{ padding:"10px 0", background:`linear-gradient(135deg,${C.orange},#ff9500)`, border:"none", borderRadius:10, color:"#fff", fontSize:18, cursor:"pointer" }}>+</button>
            </div>
          ) : (
            <button onClick={() => { setNovoMod(modelo); setNovoMem(""); setNovoPix(""); }}
              style={{ ...S.btnSm, marginTop:8, width:"100%", textAlign:"center" }}>+ Adicionar variação</button>
          )}
        </div>
      ))}

      {/* Novo modelo */}
      <div style={S.card}>
        <div style={{ ...S.lbl, marginBottom:12 }}>➕ Novo modelo</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
          <div>
            <div style={S.lbl}>Modelo</div>
            <input style={S.input} value={novoMod} onChange={e=>setNovoMod(e.target.value)} placeholder="ex: iPhone 18" />
          </div>
          <div>
            <div style={S.lbl}>Memória</div>
            <input style={S.input} value={novoMem} onChange={e=>setNovoMem(e.target.value)} placeholder="ex: 128GB" />
          </div>
        </div>
        <div style={{ marginBottom:8 }}>
          <div style={S.lbl}>Preço PIX R$</div>
          <input style={S.input} value={novoPix} onChange={e=>setNovoPix(e.target.value.replace(/\D/g,""))} placeholder="4997" inputMode="numeric" />
          <div style={{ fontSize:11, color:C.muted, marginTop:4 }}>12x/18x/21x calculadas automaticamente</div>
        </div>
        <button onClick={addVariacao} style={{ ...S.btnOr, marginTop:4 }}>+ Adicionar produto</button>
      </div>

    </div>
  );
}
