import { useState, useEffect } from "react";
import Calculadora from "./Calculadora.jsx";

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

const USADOS_DEFAULT = {
  "iPhone XR":        { "64GB":500,  "128GB":700,  "256GB":900 },
  "iPhone 11":        { "64GB":700,  "128GB":900,  "256GB":1300 },
  "iPhone 11 Pro":    { "64GB":1100, "256GB":1400 },
  "iPhone 11 Pro Max":{ "64GB":1300, "256GB":1500 },
  "iPhone 12":        { "64GB":1000, "128GB":1300, "256GB":1500, "512GB":1800 },
  "iPhone 12 Pro":    { "128GB":1500,"256GB":1700, "512GB":1800 },
  "iPhone 12 Pro Max":{ "128GB":1800,"256GB":2100, "512GB":2300 },
  "iPhone 13":        { "128GB":1600,"256GB":1800, "512GB":2000 },
  "iPhone 13 Pro":    { "128GB":2000,"256GB":2200, "512GB":2600, "1TB":2800 },
  "iPhone 13 Pro Max":{ "128GB":2300,"256GB":2500, "512GB":2700, "1TB":3100 },
  "iPhone 14":        { "128GB":1900,"256GB":2200, "512GB":2500 },
  "iPhone 14 Plus":   { "128GB":2200,"256GB":2500, "512GB":2900 },
  "iPhone 14 Pro":    { "128GB":2300,"256GB":2500, "512GB":2700, "1TB":3000 },
  "iPhone 14 Pro Max":{ "128GB":2900,"256GB":3100, "512GB":3300, "1TB":3600 },
  "iPhone 15":        { "128GB":2500,"256GB":2700, "512GB":2800 },
  "iPhone 15 Plus":   { "128GB":2700,"256GB":2800, "512GB":2900 },
  "iPhone 15 Pro":    { "128GB":3100,"256GB":3300, "512GB":3500, "1TB":3600 },
  "iPhone 15 Pro Max":{ "256GB":3800,"512GB":4100, "1TB":4400 },
  "iPhone 16":        { "128GB":3300,"256GB":3300 },
  "iPhone 16 Plus":   { "128GB":3600,"256GB":3800, "512GB":4000 },
  "iPhone 16 Pro":    { "128GB":4300,"256GB":4500, "512GB":5000 },
  "iPhone 16 Pro Max":{ "256GB":5000,"512GB":5500, "1TB":6000 },
  "iPhone 17":        { "256GB":4500,"512GB":4900 },
  "iPhone 17 Air":    { "256GB":4700,"512GB":5100 },
  "iPhone 17 Pro":    { "256GB":6700,"512GB":7500, "1TB":8000 },
};

const SK_NOVOS  = "tigrao_novos_v1";
const SK_USADOS = "tigrao_usados_v2";

async function storageGet(key, fallback) {
  try { const r = await window.storage.get(key); return r ? JSON.parse(r.value) : fallback; }
  catch { return fallback; }
}
async function storageSet(key, val) {
  try { await window.storage.set(key, JSON.stringify(val)); } catch {}
}

const C = { bg:"#f5f5f7", card:"#ffffff", orange:"#FF6B00", border:"rgba(255,107,0,0.18)", text:"#1a1a1a", muted:"#666", faint:"#e0e0e0" };
const S = {
  page:   { minHeight:"100vh", background:C.bg, fontFamily:"'Syne',-apple-system,sans-serif", color:C.text },
  tabBar: { display:"flex", background:"#fff", borderBottom:`1px solid ${C.faint}`, position:"sticky", top:0, zIndex:20 },
  tab:    a => ({ flex:1, padding:"14px 0", background:"transparent", border:"none", borderBottom: a?`2px solid ${C.orange}`:"2px solid transparent", color: a?C.orange:C.muted, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit", transition:"all .15s" }),
  card:   { background:C.card, borderRadius:14, border:`1px solid ${C.faint}`, borderTop:`2px solid ${C.orange}`, padding:16, marginBottom:12 },
  lbl:    { fontSize:11, color:C.muted, textTransform:"uppercase", letterSpacing:"1px", marginBottom:8, fontWeight:600 },
  input:  { width:"100%", padding:"10px 12px", background:"#f5f5f7", border:`1px solid ${C.faint}`, borderRadius:10, color:C.text, fontSize:13, fontFamily:"inherit", outline:"none", boxSizing:"border-box" },
  btnOr:  { width:"100%", padding:"13px", background:`linear-gradient(135deg,${C.orange},#ff9500)`, border:"none", borderRadius:11, color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit", boxShadow:"0 4px 14px rgba(255,107,0,.3)" },
  btnSm:  { padding:"7px 13px", background:"#f0f0f0", border:`1px solid ${C.faint}`, borderRadius:8, color:C.muted, fontSize:12, cursor:"pointer", fontFamily:"inherit" },
  btnDel: { padding:"7px 10px", background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.25)", borderRadius:8, color:"#ef4444", fontSize:12, cursor:"pointer", fontFamily:"inherit" },
};

export default function Root() {
  const [tab, setTab]       = useState("calc");
  const [subTab, setSubTab] = useState("novos");
  const [novos, setNovos]   = useState(null);
  const [usados, setUsados] = useState(null);
  const [savedNovos, setSavedNovos]   = useState(false);
  const [savedUsados, setSavedUsados] = useState(false);

  useEffect(() => {
    storageGet(SK_NOVOS,  NOVOS_DEFAULT).then(setNovos);
    storageGet(SK_USADOS, USADOS_DEFAULT).then(setUsados);
  }, []);

  const saveNovos = (data) => {
    setNovos(data); storageSet(SK_NOVOS, data);
    setSavedNovos(true); setTimeout(() => setSavedNovos(false), 2000);
  };
  const saveUsados = (data) => {
    setUsados(data); storageSet(SK_USADOS, data);
    setSavedUsados(true); setTimeout(() => setSavedUsados(false), 2000);
  };

  if (!novos || !usados) return <div style={{ ...S.page, display:"flex", alignItems:"center", justifyContent:"center", color:C.muted }}>Carregando...</div>;

  return (
    <div style={S.page}>
      <div style={S.tabBar}>
        <button style={S.tab(tab==="calc")}   onClick={()=>setTab("calc")}>🐯 Calculadora</button>
        <button style={S.tab(tab==="precos")} onClick={()=>setTab("precos")}>💰 Preços</button>
      </div>
      {tab === "calc"
        ? <Calculadora tabelaNovos={novos} tabelaUsados={usados} />
        : (
          <div>
            <div style={{ display:"flex", background:"#fff", borderBottom:`1px solid ${C.faint}` }}>
              <button style={{ ...S.tab(subTab==="novos"), fontSize:12 }} onClick={()=>setSubTab("novos")}>📱 Produtos Novos</button>
              <button style={{ ...S.tab(subTab==="usados"), fontSize:12 }} onClick={()=>setSubTab("usados")}>🔄 Avaliação Usados</button>
            </div>
            {subTab === "novos"
              ? <TabPrecos data={novos} onSave={saveNovos} saved={savedNovos} tipo="novos" />
              : <TabPrecos data={usados} onSave={saveUsados} saved={savedUsados} tipo="usados" />
            }
          </div>
        )
      }
    </div>
  );
}

function TabPrecos({ data: initialData, onSave, saved, tipo }) {
  const [data, setData]         = useState(() => JSON.parse(JSON.stringify(initialData)));
  const [editKey, setEditKey]   = useState(null);
  const [editVals, setEditVals] = useState({});
  const [novoMod, setNovoMod]   = useState("");
  const [novoMem, setNovoMem]   = useState("");
  const [novoPix, setNovoPix]   = useState("");
  const isNovos = tipo === "novos";
  const fmtInt = n => Math.round(n).toLocaleString("pt-BR");

  useEffect(() => { setData(JSON.parse(JSON.stringify(initialData))); }, [initialData]);

  const calcParcelas = (pix) => {
    const p = Number(pix);
    return { pix:p, p12:Math.ceil((p*1.1313)/12), p18:Math.ceil((p*1.4174)/18), p21:Math.ceil((p*1.2186)/21) };
  };

  const startEdit = (modelo, mem) => {
    setEditKey(`${modelo}||${mem}`);
    setEditVals(isNovos ? { ...data[modelo][mem] } : { val: data[modelo][mem] });
  };

  const saveEdit = (modelo, mem) => {
    const u = JSON.parse(JSON.stringify(data));
    u[modelo][mem] = isNovos
      ? { pix:Number(editVals.pix), p12:Number(editVals.p12), p18:Number(editVals.p18), p21:Number(editVals.p21) }
      : Number(editVals.val);
    setData(u); setEditKey(null);
  };

  const deleteMem = (modelo, mem) => {
    const u = JSON.parse(JSON.stringify(data));
    delete u[modelo][mem];
    if (Object.keys(u[modelo]).length === 0) delete u[modelo];
    setData(u);
  };

  const addVariacao = () => {
    if (!novoMod.trim() || !novoMem.trim() || !novoPix) return;
    const u = JSON.parse(JSON.stringify(data));
    if (!u[novoMod]) u[novoMod] = {};
    u[novoMod][novoMem] = isNovos ? calcParcelas(novoPix) : Number(novoPix);
    setData(u); setNovoMem(""); setNovoPix("");
  };

  return (
    <div style={{ padding:"16px 16px 80px", maxWidth:480, margin:"0 auto" }}>
      <button onClick={() => onSave(data)} style={{ ...S.btnOr, marginBottom:16,
        background: saved?"rgba(34,197,94,.15)":undefined, border: saved?"1px solid rgba(34,197,94,.4)":"none",
        color: saved?"#22c55e":"#fff", boxShadow: saved?"none":undefined }}>
        {saved ? "✓ Salvo!" : "💾 Salvar alterações"}
      </button>
      <div style={{ fontSize:12, color:C.muted, marginBottom:16, padding:"10px 12px", background:"#f5f5f7", borderRadius:10, border:`1px solid ${C.faint}` }}>
        {isNovos ? "💡 Preços de venda. Edite o PIX — parcelas calculadas automaticamente." : "💡 Valores de avaliação dos aparelhos usados na troca (bateria ≥95%, sem defeitos)."}
      </div>

      {Object.entries(data).map(([modelo, mems]) => (
        <div key={modelo} style={S.card}>
          <div style={{ fontSize:14, fontWeight:700, marginBottom:12 }}>{modelo}</div>
          {Object.entries(mems).map(([mem, vals]) => {
            const key = `${modelo}||${mem}`;
            const isEditing = editKey === key;
            return (
              <div key={mem} style={{ marginBottom: isEditing?14:8 }}>
                {isEditing ? (
                  <div style={{ background:"#f5f5f7", borderRadius:10, padding:12, border:`1px solid ${C.orange}` }}>
                    <div style={{ fontWeight:700, marginBottom:10, color:C.orange }}>{mem}</div>
                    {isNovos ? (
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
                        <div>
                          <div style={S.lbl}>PIX (R$)</div>
                          <input style={S.input} value={editVals.pix} inputMode="numeric"
                            onChange={e=>setEditVals(p=>({...p,pix:e.target.value}))}
                            onBlur={e=>calcParcelas(e.target.value) && setEditVals(calcParcelas(e.target.value))} />
                          <div style={{fontSize:10,color:C.muted,marginTop:3}}>Parcelas recalculadas ao sair</div>
                        </div>
                        {[["p12","12x"],["p18","18x"],["p21","21x"]].map(([k,l])=>(
                          <div key={k}>
                            <div style={S.lbl}>{l} (R$)</div>
                            <input style={S.input} value={editVals[k]} inputMode="numeric"
                              onChange={e=>setEditVals(p=>({...p,[k]:e.target.value}))} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ marginBottom:8 }}>
                        <div style={S.lbl}>Valor de avaliação (R$)</div>
                        <input style={S.input} value={editVals.val} inputMode="numeric"
                          onChange={e=>setEditVals({val:e.target.value})} />
                      </div>
                    )}
                    <div style={{ display:"flex", gap:8 }}>
                      <button onClick={()=>saveEdit(modelo,mem)} style={{ ...S.btnOr, padding:"9px" }}>✓ Confirmar</button>
                      <button onClick={()=>setEditKey(null)} style={{ ...S.btnSm, flex:1 }}>Cancelar</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 10px", background:"#f5f5f7", borderRadius:10 }}>
                    <div>
                      <span style={{ fontSize:13, fontWeight:600 }}>{mem}</span>
                      <span style={{ fontSize:13, color:C.orange, marginLeft:10, fontFamily:"monospace" }}>
                        R$ {fmtInt(isNovos ? vals.pix : vals)}
                      </span>
                      {isNovos && <span style={{ fontSize:11, color:C.muted, marginLeft:8 }}>12x {fmtInt(vals.p12)} · 18x {fmtInt(vals.p18)} · 21x {fmtInt(vals.p21)}</span>}
                    </div>
                    <div style={{ display:"flex", gap:6 }}>
                      <button style={S.btnSm} onClick={()=>startEdit(modelo,mem)}>✏️</button>
                      <button style={S.btnDel} onClick={()=>deleteMem(modelo,mem)}>🗑</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          {novoMod === modelo ? (
            <div style={{ marginTop:8, display:"grid", gridTemplateColumns:"1fr 1fr 44px", gap:8, alignItems:"end" }}>
              <div><div style={S.lbl}>Memória</div><input style={S.input} value={novoMem} onChange={e=>setNovoMem(e.target.value)} placeholder="ex: 512GB" /></div>
              <div><div style={S.lbl}>{isNovos?"PIX R$":"Valor R$"}</div><input style={S.input} value={novoPix} onChange={e=>setNovoPix(e.target.value.replace(/\D/g,""))} placeholder="9997" inputMode="numeric" /></div>
              <button onClick={addVariacao} style={{ padding:"10px 0", background:`linear-gradient(135deg,${C.orange},#ff9500)`, border:"none", borderRadius:10, color:"#fff", fontSize:18, cursor:"pointer" }}>+</button>
            </div>
          ) : (
            <button onClick={()=>{setNovoMod(modelo);setNovoMem("");setNovoPix("");}} style={{ ...S.btnSm, marginTop:8, width:"100%", textAlign:"center" }}>+ Adicionar variação</button>
          )}
        </div>
      ))}

      <div style={S.card}>
        <div style={{ ...S.lbl, marginBottom:12 }}>➕ Novo modelo</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
          <div><div style={S.lbl}>Modelo</div><input style={S.input} value={novoMod} onChange={e=>setNovoMod(e.target.value)} placeholder="ex: iPhone 18" /></div>
          <div><div style={S.lbl}>Memória</div><input style={S.input} value={novoMem} onChange={e=>setNovoMem(e.target.value)} placeholder="ex: 128GB" /></div>
        </div>
        <div style={{ marginBottom:8 }}>
          <div style={S.lbl}>{isNovos?"Preço PIX R$":"Valor de avaliação R$"}</div>
          <input style={S.input} value={novoPix} onChange={e=>setNovoPix(e.target.value.replace(/\D/g,""))} placeholder="4997" inputMode="numeric" />
        </div>
        <button onClick={addVariacao} style={{ ...S.btnOr, marginTop:4 }}>+ Adicionar</button>
      </div>
    </div>
  );
}
