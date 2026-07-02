import React, { useState } from 'react';
import { BadgeCheck, BarChart3, ChevronRight, DollarSign, Globe2, Heart, MessageCircle, Play, Search, ShieldCheck, ShoppingBag, Upload, Users, X } from 'lucide-react';
import type { BackendTrack as Track } from '../services/beatshoreBackend';

export function HomeView({ play, current, tracks }: { play: (track: Track) => void; current: Track; tracks: Track[] }) {
  return <div className="content">
    <section className="hero"><div><span>YOUR PERSONAL SOUNDTRACK</span><h2>Flow without limits.</h2><p>Human-first discovery with transparent recommendations, artist-controlled releases and regional music that global platforms overlook.</p><button onClick={() => play(tracks[1] ?? tracks[0])}><Play /> Start ShoreFlow</button></div></section>
    <div className="advantage-grid">
      <Advantage icon={<ShieldCheck />} title="Authenticity Shield" text="Detect AI music, cloned vocals, manipulated audio and generated lyrics." />
      <Advantage icon={<DollarSign />} title="Fair-Pay Ledger" text="Show artists exactly how streams, downloads and tips become earnings." />
      <Advantage icon={<MessageCircle />} title="Live Music Rooms" text="Listen, chat and build private collaborative queues in real time." />
      <Advantage icon={<Globe2 />} title="Local-to-Global Radar" text="Discover Surinamese, Caribbean and independent talent by region." />
    </div>
    <Section title="Recently played"><div className="card-grid">{tracks.slice(0, 4).map((track) => <TrackCard key={track.id} track={track} play={play} active={current.id === track.id} />)}</div></Section>
    <Section title="Made for you"><TrackList title="" items={tracks.slice(1)} play={play} liked={[]} toggleLike={() => undefined} /></Section>
  </div>;
}

function Advantage({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <article className="advantage"><div>{icon}</div><b>{title}</b><span>{text}</span></article>;
}

export function ExploreView({ play, tracks }: { play: (track: Track) => void; tracks: Track[] }) {
  return <div className="content">
    <div className="chips">{['Pop', 'Hip-Hop', 'R&B', 'Rock', 'Afro', 'Chill', 'Soca', 'Dancehall', 'Sarnami', 'Suriname'].map((item) => <button key={item}>{item}</button>)}</div>
    <Section title="Explore by mood"><div className="mood-grid">{['Chill', 'Focus', 'Workout', 'Party'].map((mood, index) => <div className="mood" key={mood} style={{ backgroundImage: `linear-gradient(0deg,rgba(0,0,0,.75),transparent),url(${tracks[index % tracks.length]?.cover})` }}><b>{mood}</b></div>)}</div></Section>
    <Section title="Independent discoveries"><div className="card-grid">{tracks.map((track) => <TrackCard key={track.id} track={track} play={play} />)}</div></Section>
  </div>;
}

export function SearchView({ query, setQuery, items, play, liked, toggleLike }: { query: string; setQuery: (value: string) => void; items: Track[]; play: (track: Track) => void; liked: string[]; toggleLike: (id: string) => void }) {
  return <div className="content"><div className="search-box"><Search /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search songs, artists, lyrics, moods and regions..." /></div><TrackList title={query ? `Results for “${query}”` : 'Popular searches'} items={items} play={play} liked={liked} toggleLike={toggleLike} /></div>;
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="section"><div className="section-head"><h2>{title}</h2><button>View all <ChevronRight /></button></div>{children}</section>;
}

export function TrackCard({ track, play, active }: { track: Track; play: (track: Track) => void; active?: boolean }) {
  return <article className={`track-card ${active ? 'selected' : ''}`} onClick={() => play(track)}><div className="cover-wrap"><img src={track.cover} alt="" /><button><Play /></button></div><b>{track.title}</b><span>{track.artist} · {track.genre}</span></article>;
}

export function TrackList({ title, items, play, liked, toggleLike }: { title: string; items: Track[]; play: (track: Track) => void; liked: string[]; toggleLike: (id: string) => void }) {
  return <section className="track-list">{title && <h2>{title}</h2>}{items.length === 0 ? <div className="empty"><Heart /><h3>No saved songs yet</h3><p>Tap the heart on a track to add it here.</p></div> : items.map((track, index) => <div className="track-row" key={track.id}><span className="index">{index + 1}</span><img src={track.cover} alt="" /><div className="track-info"><b>{track.title}</b><span>{track.artist}</span></div><span className="genre">{track.genre}</span><button className="plain" onClick={() => toggleLike(track.id)}><Heart size={19} fill={liked.includes(track.id) ? 'currentColor' : 'none'} /></button><span>{track.duration}</span><button className="row-play" onClick={() => play(track)}><Play /></button></div>)}</section>;
}

export function Studio({ onUpload }: { onUpload: () => void }) {
  return <div className="content"><div className="studio-hero"><div><span>BEATSHORE FOR ARTISTS</span><h2>Turn your music into a global career.</h2><p>Upload releases, collaborate, understand your audience and receive transparent payouts.</p></div><button onClick={onUpload}><Upload /> Upload release</button></div><div className="stats-grid">{[['Total streams', '2.84M', '+18.4%'], ['Listeners', '486K', '+12.1%'], ['Followers', '92.7K', '+8.7%'], ['Estimated revenue', '$8,426', '+21.3%']].map((item) => <div className="stat" key={item[0]}><span>{item[0]}</span><strong>{item[1]}</strong><small>{item[2]} this month</small></div>)}</div><div className="studio-grid"><div className="panel"><h3>Performance</h3><div className="chart">{[38, 55, 44, 70, 62, 82, 75, 93, 88, 110, 102, 125].map((height, index) => <i key={index} style={{ height }} />)}</div></div><div className="panel"><h3>Creator tools</h3>{[[Upload, 'Upload & distribute'], [BarChart3, 'Stats & analytics'], [Users, 'Fan engagement'], [ShoppingBag, 'Merch store'], [BadgeCheck, 'Artist verification']].map(([Icon, label]: any) => <button className="tool" key={label}><Icon /><span>{label}</span><ChevronRight /></button>)}</div></div></div>;
}

export function UploadModal({ close }: { close: () => void }) {
  const [done, setDone] = useState(false);
  return <div className="modal-bg"><div className="modal"><button className="close" onClick={close}><X /></button>{done ? <div className="success"><BadgeCheck /><h2>Release submitted</h2><p>Your upload is queued for audio checks, metadata review and distribution.</p><button onClick={close}>Done</button></div> : <><h2>Upload a new release</h2><p>Distribute to BeatShore and connected music services.</p><label>Track title<input placeholder="Enter title" /></label><label>Artist name<input defaultValue="K.O.SONGS" /></label><label>Genre<select><option>Pop</option><option>R&B</option><option>Hip-Hop</option><option>World</option></select></label><div className="drop"><Upload /><b>Drop WAV or FLAC here</b><span>Lossless audio, up to 4 GB</span></div><button className="primary" onClick={() => setDone(true)}>Submit release</button></>}</div></div>;
}
