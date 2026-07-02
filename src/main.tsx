import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Home, Compass, Library, Search, Play, Pause, Heart, MoreHorizontal, Upload, BarChart3, Users, BadgeCheck, ShoppingBag, Radio, Mic2, Download, ListMusic, Settings, Bell, ChevronRight, Plus, X } from 'lucide-react';
import './styles.css';

type Track = { id:number; title:string; artist:string; genre:string; cover:string; duration:string; likes:number };
type View = 'home'|'explore'|'library'|'search'|'studio';

const tracks: Track[] = [
  {id:1,title:'Ocean Drive',artist:'Shore',genre:'Chill',cover:'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',duration:'3:56',likes:18420},
  {id:2,title:'Sunset Lover',artist:'Petit Biscuit',genre:'Electronic',cover:'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=80',duration:'3:58',likes:32910},
  {id:3,title:'Late Nights',artist:'Nova Lane',genre:'R&B',cover:'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',duration:'4:12',likes:12780},
  {id:4,title:'Island Vibes',artist:'Kaya Blue',genre:'Tropical',cover:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',duration:'3:31',likes:9804},
  {id:5,title:'Pain Into Power',artist:'Ari Stone',genre:'Hip-Hop',cover:'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=800&q=80',duration:'2:59',likes:20340}
];

function App(){
  const [view,setView]=useState<View>('home');
  const [current,setCurrent]=useState<Track>(tracks[0]);
  const [playing,setPlaying]=useState(false);
  const [liked,setLiked]=useState<number[]>([2]);
  const [query,setQuery]=useState('');
  const [showUpload,setShowUpload]=useState(false);
  const filtered=useMemo(()=>tracks.filter(t=>(t.title+' '+t.artist+' '+t.genre).toLowerCase().includes(query.toLowerCase())),[query]);
  const play=(t:Track)=>{setCurrent(t);setPlaying(true)};
  const toggleLike=(id:number)=>setLiked(v=>v.includes(id)?v.filter(x=>x!==id):[...v,id]);

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="wave">∿</span><strong>BeatShore</strong></div>
      <nav>
        <Nav icon={<Home/>} label="Home" active={view==='home'} onClick={()=>setView('home')}/>
        <Nav icon={<Compass/>} label="Explore" active={view==='explore'} onClick={()=>setView('explore')}/>
        <Nav icon={<Library/>} label="Library" active={view==='library'} onClick={()=>setView('library')}/>
        <Nav icon={<Search/>} label="Search" active={view==='search'} onClick={()=>setView('search')}/>
      </nav>
      <p className="section-label">YOUR MUSIC</p>
      <Nav icon={<Heart/>} label="Liked songs" onClick={()=>setView('library')}/>
      <Nav icon={<Download/>} label="Downloads" onClick={()=>setView('library')}/>
      <Nav icon={<ListMusic/>} label="Playlists" onClick={()=>setView('library')}/>
      <button className="studio-btn" onClick={()=>setView('studio')}><Mic2/> Creator Studio</button>
      <div className="profile"><div className="avatar">KO</div><div><b>K.O.SONGS</b><span>Verified creator</span></div><BadgeCheck size={18}/></div>
    </aside>

    <main>
      <header><div><h1>{titleFor(view)}</h1><p>Your sound. Your shore. Your success.</p></div><div className="header-actions"><button className="icon-btn"><Bell/></button><button className="upgrade">Go Premium</button></div></header>
      {view==='home' && <HomeView play={play} current={current}/>} 
      {view==='explore' && <ExploreView play={play}/>} 
      {view==='library' && <TrackList title="Your library" items={tracks.filter(t=>liked.includes(t.id))} play={play} liked={liked} toggleLike={toggleLike}/>} 
      {view==='search' && <SearchView query={query} setQuery={setQuery} items={filtered} play={play} liked={liked} toggleLike={toggleLike}/>} 
      {view==='studio' && <Studio onUpload={()=>setShowUpload(true)}/>} 
    </main>

    <aside className="right-panel">
      <h3>Now playing</h3>
      <img className="now-cover" src={current.cover}/>
      <div className="now-title"><div><h2>{current.title}</h2><p>{current.artist}</p></div><button className="plain" onClick={()=>toggleLike(current.id)}><Heart fill={liked.includes(current.id)?'currentColor':'none'}/></button></div>
      <div className="progress"><span style={{width:playing?'46%':'22%'}}/></div><div className="times"><span>1:42</span><span>{current.duration}</span></div>
      <div className="big-controls"><button>↶</button><button className="play-large" onClick={()=>setPlaying(!playing)}>{playing?<Pause/>:<Play/>}</button><button>↷</button></div>
      <h3>Up next</h3>{tracks.filter(t=>t.id!==current.id).slice(0,3).map(t=><div className="queue" key={t.id} onClick={()=>play(t)}><img src={t.cover}/><div><b>{t.title}</b><span>{t.artist}</span></div><MoreHorizontal/></div>)}
    </aside>

    <div className="bottom-player"><img src={current.cover}/><div className="meta"><b>{current.title}</b><span>{current.artist}</span></div><button className="plain" onClick={()=>toggleLike(current.id)}><Heart fill={liked.includes(current.id)?'currentColor':'none'}/></button><div className="mini-controls"><button>◀</button><button className="mini-play" onClick={()=>setPlaying(!playing)}>{playing?<Pause/>:<Play/>}</button><button>▶</button></div><div className="desktop-progress"><span style={{width:playing?'46%':'22%'}}/></div><span>{current.duration}</span></div>
    {showUpload&&<UploadModal close={()=>setShowUpload(false)}/>} 
  </div>
}

function Nav({icon,label,active,onClick}:{icon:React.ReactNode,label:string,active?:boolean,onClick:()=>void}){return <button className={'nav-item '+(active?'active':'')} onClick={onClick}>{icon}<span>{label}</span></button>}
function titleFor(v:View){return v==='home'?'Good morning, Shore!':v==='studio'?'Creator Studio':v[0].toUpperCase()+v.slice(1)}

function HomeView({play,current}:{play:(t:Track)=>void,current:Track}){return <div className="content"><section className="hero"><div><span>YOUR PERSONAL SOUNDTRACK</span><h2>Flow without limits.</h2><p>An endless mix of favorites, discoveries and independent voices from around the world.</p><button onClick={()=>play(tracks[1])}><Play/> Start Flow</button></div></section><Section title="Recently played"><div className="card-grid">{tracks.slice(0,4).map(t=><TrackCard key={t.id} track={t} play={play} active={current.id===t.id}/>)}</div></Section><Section title="Made for you"><TrackList title="" items={tracks.slice(1)} play={play} liked={[]} toggleLike={()=>{}}/></Section></div>}
function ExploreView({play}:{play:(t:Track)=>void}){return <div className="content"><div className="chips">{['Pop','Hip-Hop','R&B','Rock','Afro','Chill','Soca','Dancehall'].map(x=><button key={x}>{x}</button>)}</div><Section title="Explore by mood"><div className="mood-grid">{['Chill','Focus','Workout','Party'].map((m,i)=><div className="mood" key={m} style={{backgroundImage:`linear-gradient(0deg,rgba(0,0,0,.75),transparent),url(${tracks[i].cover})`}}><b>{m}</b></div>)}</div></Section><Section title="New releases"><div className="card-grid">{tracks.map(t=><TrackCard key={t.id} track={t} play={play}/>)}</div></Section></div>}
function SearchView({query,setQuery,items,play,liked,toggleLike}:{query:string,setQuery:(s:string)=>void,items:Track[],play:(t:Track)=>void,liked:number[],toggleLike:(id:number)=>void}){return <div className="content"><div className="search-box"><Search/><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search songs, artists, albums, podcasts..."/></div><TrackList title={query?`Results for “${query}”`:'Popular searches'} items={items} play={play} liked={liked} toggleLike={toggleLike}/></div>}
function Section({title,children}:{title:string,children:React.ReactNode}){return <section className="section"><div className="section-head"><h2>{title}</h2><button>View all <ChevronRight/></button></div>{children}</section>}
function TrackCard({track,play,active}:{track:Track,play:(t:Track)=>void,active?:boolean}){return <article className={'track-card '+(active?'selected':'')} onClick={()=>play(track)}><div className="cover-wrap"><img src={track.cover}/><button><Play/></button></div><b>{track.title}</b><span>{track.artist} · {track.genre}</span></article>}
function TrackList({title,items,play,liked,toggleLike}:{title:string,items:Track[],play:(t:Track)=>void,liked:number[],toggleLike:(id:number)=>void}){return <section className="track-list">{title&&<h2>{title}</h2>}{items.length===0?<div className="empty"><Heart/><h3>No saved songs yet</h3><p>Tap the heart on a track to add it here.</p></div>:items.map((t,i)=><div className="track-row" key={t.id}><span className="index">{i+1}</span><img src={t.cover}/><div className="track-info"><b>{t.title}</b><span>{t.artist}</span></div><span className="genre">{t.genre}</span><button className="plain" onClick={()=>toggleLike(t.id)}><Heart size={19} fill={liked.includes(t.id)?'currentColor':'none'}/></button><span>{t.duration}</span><button className="row-play" onClick={()=>play(t)}><Play/></button></div>)}</section>}

function Studio({onUpload}:{onUpload:()=>void}){return <div className="content"><div className="studio-hero"><div><span>BEATSHORE FOR ARTISTS</span><h2>Turn your music into a global career.</h2><p>Upload releases, collaborate, understand your audience and receive transparent payouts.</p></div><button onClick={onUpload}><Upload/> Upload release</button></div><div className="stats-grid">{[['Total streams','2.84M','+18.4%'],['Listeners','486K','+12.1%'],['Followers','92.7K','+8.7%'],['Estimated revenue','$8,426','+21.3%']].map(x=><div className="stat" key={x[0]}><span>{x[0]}</span><strong>{x[1]}</strong><small>{x[2]} this month</small></div>)}</div><div className="studio-grid"><div className="panel"><h3>Performance</h3><div className="chart">{[38,55,44,70,62,82,75,93,88,110,102,125].map((h,i)=><i key={i} style={{height:h}}/>)}</div></div><div className="panel"><h3>Creator tools</h3>{[[Upload,'Upload & distribute'],[BarChart3,'Stats & analytics'],[Users,'Fan engagement'],[ShoppingBag,'Merch store'],[BadgeCheck,'Artist verification']].map(([Icon,label]:any)=><button className="tool" key={label}><Icon/><span>{label}</span><ChevronRight/></button>)}</div></div></div>}
function UploadModal({close}:{close:()=>void}){const [done,setDone]=useState(false);return <div className="modal-bg"><div className="modal"><button className="close" onClick={close}><X/></button>{done?<div className="success"><BadgeCheck/><h2>Release submitted</h2><p>Your upload is queued for audio checks, metadata review and distribution.</p><button onClick={close}>Done</button></div>:<><h2>Upload a new release</h2><p>Distribute to BeatShore and connected music services.</p><label>Track title<input placeholder="Enter title"/></label><label>Artist name<input defaultValue="K.O.SONGS"/></label><label>Genre<select><option>Pop</option><option>R&B</option><option>Hip-Hop</option><option>World</option></select></label><div className="drop"><Upload/><b>Drop WAV or FLAC here</b><span>Lossless audio, up to 4 GB</span></div><button className="primary" onClick={()=>setDone(true)}>Submit release</button></>}</div></div>}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
