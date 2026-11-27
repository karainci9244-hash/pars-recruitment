
import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import { PawPrint, UploadCloud, Users, Trophy, Crosshair, Search, Globe2, ImagePlus, ArrowUpDown, ExternalLink, ShieldCheck } from 'lucide-react';
import './style.css';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
const BUCKET = 'wpck-public';

const words = {
 de: {
  navHome:'Start', navPlayers:'Spieler', navStats:'Statistiken', navUpload:'Hochladen',
  eyebrow:'LAST Z: SURVIVAL SHOOTER', title:'WOLF PACK', subtitle:'UNITED WE HUNT. UNITED WE SURVIVE.',
  intro:'Ein Rudel. Ein Ziel. Stärke, Loyalität und Teamgeist.',
  join:'Spielerprofil hochladen', browse:'Spieler ansehen', members:'Rudel-Mitglieder',
  strength:'Gesamtstärke', count:'Mitglieder', kills:'Kills', empty:'Noch keine Spieler eingetragen. Sei der Erste im Rudel!',
  uploadTitle:'Werde Teil des Wolf Pack', uploadText:'Trage deine Spielerdaten ein und lade deine Screenshots hoch. Dein Profil erscheint nach dem Absenden öffentlich für alle.',
  player:'Spielername *', playerId:'Spieler-ID', server:'Server', power:'Stärke / Entwicklung', role:'Rolle im Rudel', killsField:'Kills', notes:'Zusätzliche Infos',
  screenshots:'Screenshots auswählen (JPG, PNG oder WEBP; max. 6 MB pro Bild)', send:'Profil veröffentlichen', sending:'Wird hochgeladen…',
  search:'Spieler suchen…', sort:'Sortieren', newest:'Neueste zuerst', nameSort:'Name A–Z', powerSort:'Stärke (Zahl)', success:'Dein Profil wurde veröffentlicht!', setup:'Die Website ist noch nicht mit Supabase verbunden. Bitte die beiden VITE-Werte in Cloudflare eintragen.',
  error:'Fehler beim Hochladen', noImages:'Keine Screenshots', image:'Bild', view:'Profil ansehen', publicNotice:'Öffentliche Seite: Eingereichte Namen, Angaben und Bilder sind für alle sichtbar.',
  required:'Bitte gib mindestens deinen Spielernamen an.', tooMany:'Bitte höchstens 6 Bilder auswählen.', fileTooBig:'Jedes Bild muss kleiner als 6 MB sein.'
 },
 en: {
  navHome:'Home', navPlayers:'Players', navStats:'Stats', navUpload:'Upload',
  eyebrow:'LAST Z: SURVIVAL SHOOTER', title:'WOLF PACK', subtitle:'UNITED WE HUNT. UNITED WE SURVIVE.',
  intro:'One pack. One goal. Strength, loyalty and teamwork.',
  join:'Upload player profile', browse:'View players', members:'Pack members',
  strength:'Total power', count:'Members', kills:'Kills', empty:'No players yet. Be the first in the pack!',
  uploadTitle:'Join the Wolf Pack', uploadText:'Enter your player details and upload screenshots. Your profile will be public as soon as you submit it.',
  player:'Player name *', playerId:'Player ID', server:'Server', power:'Power / Progress', role:'Pack role', killsField:'Kills', notes:'Additional info',
  screenshots:'Choose screenshots (JPG, PNG or WEBP; max 6 MB each)', send:'Publish profile', sending:'Uploading…',
  search:'Search players…', sort:'Sort', newest:'Newest first', nameSort:'Name A–Z', powerSort:'Power (number)', success:'Your profile has been published!', setup:'Supabase is not connected yet. Add both VITE values in Cloudflare.',
  error:'Upload error', noImages:'No screenshots', image:'Image', view:'View profile', publicNotice:'Public page: submitted names, details and images are visible to everyone.',
  required:'Please enter at least your player name.', tooMany:'Please select no more than 6 images.', fileTooBig:'Each image must be smaller than 6 MB.'
 },
 tr: {
  navHome:'Ana sayfa', navPlayers:'Oyuncular', navStats:'İstatistikler', navUpload:'Yükle',
  eyebrow:'LAST Z: SURVIVAL SHOOTER', title:'WOLF PACK', subtitle:'BİRLİKTE AVCIYIZ. BİRLİKTE HAYATTA KALIRIZ.',
  intro:'Tek sürü. Tek hedef. Güç, sadakat ve takım ruhu.',
  join:'Oyuncu profili yükle', browse:'Oyuncuları gör', members:'Sürü üyeleri',
  strength:'Toplam güç', count:'Üyeler', kills:'Leş', empty:'Henüz oyuncu yok. Sürüye ilk katılan sen ol!',
  uploadTitle:'Wolf Pack’e katıl', uploadText:'Oyuncu bilgilerini gir ve ekran görüntülerini yükle. Profilin gönderildikten hemen sonra herkese açık olur.',
  player:'Oyuncu adı *', playerId:'Oyuncu ID', server:'Sunucu', power:'Güç / Gelişim', role:'Sürüdeki rol', killsField:'Leş', notes:'Ek bilgiler',
  screenshots:'Ekran görüntüsü seç (JPG, PNG veya WEBP; her biri en fazla 6 MB)', send:'Profili yayınla', sending:'Yükleniyor…',
  search:'Oyuncu ara…', sort:'Sırala', newest:'En yeni', nameSort:'İsim A–Z', powerSort:'Güç (sayı)', success:'Profilin yayınlandı!', setup:'Supabase henüz bağlanmadı. Cloudflare’a iki VITE değerini ekle.',
  error:'Yükleme hatası', noImages:'Ekran görüntüsü yok', image:'Görsel', view:'Profili gör', publicNotice:'Herkese açık sayfa: Gönderilen adlar, bilgiler ve görseller herkes tarafından görülebilir.',
  required:'Lütfen en az oyuncu adını gir.', tooMany:'En fazla 6 görsel seçebilirsin.', fileTooBig:'Her görsel 6 MB’tan küçük olmalı.'
 }
};

function App() {
 const [lang,setLang] = useState('de');
 const t = words[lang];
 const [players,setPlayers] = useState([]);
 const [loading,setLoading] = useState(true);
 const [busy,setBusy] = useState(false);
 const [message,setMessage] = useState('');
 const [query,setQuery] = useState('');
 const [sort,setSort] = useState('new');
 const [form,setForm] = useState({player_name:'',player_id:'',server:'',power:'',kills:'',alliance_role:'',notes:''});
 const [files,setFiles] = useState([]);
 const [selected,setSelected] = useState(null);

 async function loadPlayers() {
  if (!supabase) { setLoading(false); return; }
  const {data,error} = await supabase.from('wpck_players').select('*').order('created_at',{ascending:false});
  if (!error) setPlayers(data || []);
  setLoading(false);
 }
 useEffect(() => {
  loadPlayers();
  if (!supabase) return;
  const channel = supabase.channel('wpck-live-players').on('postgres_changes',{event:'*',schema:'public',table:'wpck_players'},loadPlayers).subscribe();
  return () => { supabase.removeChannel(channel); };
 }, []);

 const filtered = useMemo(() => {
  let list = players.filter(p => [p.player_name,p.player_id,p.server,p.alliance_role].join(' ').toLowerCase().includes(query.toLowerCase()));
  if (sort==='name') list.sort((a,b)=>a.player_name.localeCompare(b.player_name));
  if (sort==='power') list.sort((a,b)=>(parseFloat(b.power)||0)-(parseFloat(a.power)||0));
  return list;
 },[players,query,sort]);

 async function submit(e) {
  e.preventDefault(); setMessage('');
  if (!form.player_name.trim()) { setMessage(t.required); return; }
  if (!supabase) { setMessage(t.setup); return; }
  if (files.length>6) { setMessage(t.tooMany); return; }
  if (files.some(f=>f.size>6*1024*1024)) { setMessage(t.fileTooBig); return; }
  setBusy(true);
  try {
   const paths=[];
   for (const file of files) {
    if (!['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('Only JPG, PNG and WEBP images are allowed.');
    const safe = file.name.replace(/[^a-zA-Z0-9._-]/g,'_');
    const path = `${Date.now()}-${crypto.randomUUID()}-${safe}`;
    const {error:upError} = await supabase.storage.from(BUCKET).upload(path,file,{contentType:file.type,upsert:false});
    if (upError) throw upError;
    paths.push(path);
   }
   const {error:dbError} = await supabase.from('wpck_players').insert({...form,player_name:form.player_name.trim(),image_paths:paths});
   if (dbError) throw dbError;
   setForm({player_name:'',player_id:'',server:'',power:'',kills:'',alliance_role:'',notes:''});
   setFiles([]); e.target.reset(); setMessage(t.success); await loadPlayers();
  } catch(err) { setMessage(`${t.error}: ${err.message}`); }
  finally { setBusy(false); }
 }

 const publicUrl = path => supabase?.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
 const totalKills = players.reduce((n,p)=>n+(parseFloat(String(p.kills||'').replace(/[^\d.]/g,''))||0),0);
 const totalPower = players.reduce((n,p)=>n+(parseFloat(String(p.power||'').replace(/[^\d.]/g,''))||0),0);

 return <div className="site">
  <header className="topbar">
   <a className="brand" href="#home"><span className="brand-mark"><PawPrint/></span><span><b>WOLF PACK</b><small>WPCK · LAST Z</small></span></a>
   <nav><a href="#home">{t.navHome}</a><a href="#players">{t.navPlayers}</a><a href="#stats">{t.navStats}</a><a href="#upload">{t.navUpload}</a></nav>
   <div className="language"><Globe2 size={16}/><select value={lang} onChange={e=>setLang(e.target.value)} aria-label="Language"><option value="de">Deutsch</option><option value="en">English</option><option value="tr">Türkçe</option></select></div>
  </header>
  <section className="hero" id="home">
   <div className="hero-shade"></div><div className="hero-content">
    <div className="eyebrow">{t.eyebrow}</div><div className="wolf-symbol">🐺</div>
    <h1>{t.title}<span>WPCK</span></h1><h2>{t.subtitle}</h2><p>{t.intro}</p>
    <div className="hero-actions"><a className="btn gold" href="#upload"><UploadCloud size={17}/>{t.join}</a><a className="btn outline" href="#players"><Users size={17}/>{t.browse}</a></div>
   </div>
  </section>
  <section className="statsbar" id="stats">
   <div className="stat"><Users/><small>{t.count}</small><b>{players.length}</b></div>
   <div className="stat"><Trophy/><small>{t.strength}</small><b>{totalPower ? totalPower.toLocaleString() : '—'}</b></div>
   <div className="stat"><Crosshair/><small>{t.kills}</small><b>{totalKills ? totalKills.toLocaleString() : '—'}</b></div>
  </section>
  <main>
   <section className="section" id="players">
    <div className="section-head"><div><span className="eyebrow">THE PACK</span><h2>{t.members}</h2></div><span className="count">{players.length} WPCK</span></div>
    <div className="toolbar"><label className="search"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={t.search}/></label><label className="sort"><ArrowUpDown size={16}/><select value={sort} onChange={e=>setSort(e.target.value)} aria-label={t.sort}><option value="new">{t.newest}</option><option value="name">{t.nameSort}</option><option value="power">{t.powerSort}</option></select></label></div>
    {loading ? <p className="empty">Loading…</p> : filtered.length===0 ? <p className="empty">{t.empty}</p> : <div className="player-grid">{filtered.map(p=><article className="player-card" key={p.id}>
     <div className="player-banner"><span>WPCK</span><PawPrint/></div><div className="player-body"><h3>{p.player_name}</h3><div className="meta">{p.server ? `Server ${p.server}` : 'WOLF PACK'}{p.alliance_role ? ` · ${p.alliance_role}` : ''}</div>
      <div className="player-stats"><div><small>POWER</small><b>{p.power||'—'}</b></div><div><small>KILLS</small><b>{p.kills||'—'}</b></div><div><small>ID</small><b>{p.player_id||'—'}</b></div></div>
      {p.notes&&<p className="notes">{p.notes}</p>}
      {p.image_paths?.length>0&&<div className="thumbs">{p.image_paths.map(path=><button key={path} onClick={()=>setSelected(publicUrl(path))}><img src={publicUrl(path)} alt={`${p.player_name} screenshot`}/></button>)}</div>}
     </div></article>)}</div>}
   </section>
   <section className="section upload-section" id="upload">
    <div className="section-head"><div><span className="eyebrow">JOIN THE PACK</span><h2>{t.uploadTitle}</h2><p>{t.uploadText}</p></div><UploadCloud className="section-icon"/></div>
    <form className="upload-form" onSubmit={submit}>
     <label>{t.player}<input required maxLength="40" value={form.player_name} onChange={e=>setForm({...form,player_name:e.target.value})} placeholder="WolfPlayer"/></label>
     <label>{t.playerId}<input maxLength="60" value={form.player_id} onChange={e=>setForm({...form,player_id:e.target.value})}/></label>
     <label>{t.server}<input maxLength="30" value={form.server} onChange={e=>setForm({...form,server:e.target.value})}/></label>
     <label>{t.power}<input value={form.power} onChange={e=>setForm({...form,power:e.target.value})} placeholder="z. B. 250M"/></label>
     <label>{t.killsField}<input value={form.kills} onChange={e=>setForm({...form,kills:e.target.value})}/></label>
     <label>{t.role}<input value={form.alliance_role} onChange={e=>setForm({...form,alliance_role:e.target.value})}/></label>
     <label className="full">{t.notes}<textarea maxLength="500" rows="3" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></label>
     <label className="file-label full"><ImagePlus/><span>{t.screenshots}</span><input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={e=>setFiles(Array.from(e.target.files||[]))}/><small>{files.length ? `${files.length} file(s) selected` : t.noImages}</small></label>
     <button className="btn gold submit full" disabled={busy}>{busy?t.sending:t.send}</button>
    </form>
    {message&&<div className="message" role="status">{message}</div>}
    <p className="public-warning"><ShieldCheck size={16}/>{t.publicNotice}</p>
   </section>
  </main>
  <footer><b>WOLF PACK · WPCK</b><span>LAST Z: SURVIVAL SHOOTER</span><span>STRENGTH · LOYALTY · TEAMWORK</span></footer>
  {selected&&<div className="lightbox" onClick={()=>setSelected(null)}><button aria-label="Close">×</button><img src={selected} alt="Player screenshot"/></div>}
 </div>;
}
createRoot(document.getElementById('root')).render(<App/>);
