import { useEffect, useMemo, useState } from 'react';
import { BadgeCheck, Bell, Compass, Database, Download, Heart, Home, Library, ListMusic, LogIn, LogOut, Mic2, MoreHorizontal, Pause, Play, Search, Sparkles } from 'lucide-react';
import { AuthModal } from './components/AuthModal';
import { InnovationHub } from './components/InnovationHub';
import { ExploreView, HomeView, SearchView, Studio, TrackList, UploadModal } from './components/MusicViews';
import { demoTracks } from './data/demoTracks';
import { getCurrentUserEmail, listenForAuthChanges } from './services/auth';
import { checkBackend, loadPublishedTracks, recordPlay, subscribeToTrackChanges, type BackendState, type BackendTrack as Track } from './services/beatshoreBackend';

type View = 'home' | 'explore' | 'library' | 'search' | 'innovation' | 'studio';

export default function App() {
  const [view, setView] = useState<View>('home');
  const [catalog, setCatalog] = useState<Track[]>(demoTracks);
  const [current, setCurrent] = useState<Track>(demoTracks[0]);
  const [playing, setPlaying] = useState(false);
  const [liked, setLiked] = useState<string[]>(['demo-2']);
  const [query, setQuery] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [backendState, setBackendState] = useState<BackendState>('demo');
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const refresh = async () => {
      try {
        const state = await checkBackend();
        if (!mounted) return;
        setBackendState(state);
        if (state === 'connected') {
          const remoteTracks = await loadPublishedTracks();
          if (mounted && remoteTracks.length > 0) {
            setCatalog(remoteTracks);
            setCurrent((existing) => remoteTracks.find((track) => track.id === existing.id) ?? remoteTracks[0]);
          }
        }
      } catch {
        if (mounted) setBackendState('error');
      }
    };

    void refresh();
    void getCurrentUserEmail().then((email) => mounted && setUserEmail(email));
    const stopTracks = subscribeToTrackChanges(() => void refresh());
    const stopAuth = listenForAuthChanges(setUserEmail);

    return () => {
      mounted = false;
      stopTracks();
      stopAuth();
    };
  }, []);

  const filtered = useMemo(
    () => catalog.filter((track) => `${track.title} ${track.artist} ${track.genre}`.toLowerCase().includes(query.toLowerCase())),
    [catalog, query],
  );

  const play = (track: Track) => {
    setCurrent(track);
    setPlaying(true);
    if (!track.id.startsWith('demo-')) void recordPlay(track.id);
  };

  const toggleLike = (id: string) => setLiked((value) => value.includes(id) ? value.filter((item) => item !== id) : [...value, id]);

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="wave">∿</span><strong>BeatShore</strong></div>
      <nav>
        <Nav icon={<Home />} label="Home" active={view === 'home'} onClick={() => setView('home')} />
        <Nav icon={<Compass />} label="Explore" active={view === 'explore'} onClick={() => setView('explore')} />
        <Nav icon={<Library />} label="Library" active={view === 'library'} onClick={() => setView('library')} />
        <Nav icon={<Search />} label="Search" active={view === 'search'} onClick={() => setView('search')} />
        <Nav icon={<Sparkles />} label="ShoreAI" active={view === 'innovation'} onClick={() => setView('innovation')} />
      </nav>
      <p className="section-label">YOUR MUSIC</p>
      <Nav icon={<Heart />} label="Liked songs" onClick={() => setView('library')} />
      <Nav icon={<Download />} label="Downloads" onClick={() => setView('library')} />
      <Nav icon={<ListMusic />} label="Playlists" onClick={() => setView('library')} />
      <button className="studio-btn" onClick={() => setView('studio')}><Mic2 /> Creator Studio</button>
      <div className="profile"><div className="avatar">KO</div><div><b>K.O.SONGS</b><span>{userEmail ?? 'Verified creator'}</span></div><BadgeCheck size={18} /></div>
    </aside>

    <main>
      <header>
        <div><h1>{titleFor(view)}</h1><p>Your sound. Your shore. Your success.</p></div>
        <div className="header-actions">
          <BackendBadge state={backendState} />
          <button className="icon-btn"><Bell /></button>
          <button className="account-btn" onClick={() => setShowAuth(true)}>{userEmail ? <LogOut /> : <LogIn />}<span>{userEmail ? 'Account' : 'Connect'}</span></button>
        </div>
      </header>

      {view === 'home' && <HomeView play={play} current={current} tracks={catalog} />}
      {view === 'explore' && <ExploreView play={play} tracks={catalog} />}
      {view === 'library' && <TrackList title="Your library" items={catalog.filter((track) => liked.includes(track.id))} play={play} liked={liked} toggleLike={toggleLike} />}
      {view === 'search' && <SearchView query={query} setQuery={setQuery} items={filtered} play={play} liked={liked} toggleLike={toggleLike} />}
      {view === 'innovation' && <InnovationHub backendState={backendState} userEmail={userEmail} current={current} openAuth={() => setShowAuth(true)} />}
      {view === 'studio' && <Studio onUpload={() => setShowUpload(true)} />}
    </main>

    <aside className="right-panel">
      <h3>Now playing</h3>
      <img className="now-cover" src={current.cover} alt="" />
      <div className="now-title"><div><h2>{current.title}</h2><p>{current.artist}</p></div><button className="plain" onClick={() => toggleLike(current.id)}><Heart fill={liked.includes(current.id) ? 'currentColor' : 'none'} /></button></div>
      <div className="quality-row"><span>Hi-Fi FLAC</span><span>Authenticity checked</span></div>
      <div className="progress"><span style={{ width: playing ? '46%' : '22%' }} /></div><div className="times"><span>1:42</span><span>{current.duration}</span></div>
      <div className="big-controls"><button>↶</button><button className="play-large" onClick={() => setPlaying(!playing)}>{playing ? <Pause /> : <Play />}</button><button>↷</button></div>
      <h3>Up next</h3>{catalog.filter((track) => track.id !== current.id).slice(0, 3).map((track) => <div className="queue" key={track.id} onClick={() => play(track)}><img src={track.cover} alt="" /><div><b>{track.title}</b><span>{track.artist}</span></div><MoreHorizontal /></div>)}
    </aside>

    <div className="bottom-player"><img src={current.cover} alt="" /><div className="meta"><b>{current.title}</b><span>{current.artist}</span></div><button className="plain" onClick={() => toggleLike(current.id)}><Heart fill={liked.includes(current.id) ? 'currentColor' : 'none'} /></button><div className="mini-controls"><button>◀</button><button className="mini-play" onClick={() => setPlaying(!playing)}>{playing ? <Pause /> : <Play />}</button><button>▶</button></div><div className="desktop-progress"><span style={{ width: playing ? '46%' : '22%' }} /></div><span>{current.duration}</span></div>

    {showUpload && <UploadModal close={() => setShowUpload(false)} />}
    {showAuth && <AuthModal email={userEmail} close={() => setShowAuth(false)} />}
  </div>;
}

function Nav({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick: () => void }) {
  return <button className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>{icon}<span>{label}</span></button>;
}

function titleFor(view: View) {
  if (view === 'home') return 'Good morning, Shore!';
  if (view === 'studio') return 'Creator Studio';
  if (view === 'innovation') return 'ShoreAI Innovation Hub';
  return view[0].toUpperCase() + view.slice(1);
}

function BackendBadge({ state }: { state: BackendState }) {
  const label = state === 'connected' ? 'Backend live' : state === 'error' ? 'Backend error' : 'Demo mode';
  return <div className={`backend-badge ${state}`}><Database />{label}</div>;
}
