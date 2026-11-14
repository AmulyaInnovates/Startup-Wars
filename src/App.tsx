import React, { useEffect, useRef, useState } from 'react';
import logo from './img/logo.jpg';
import alphaForge from './img/alphaforge.jpg';
import breakout from './img/breakout.jpg';
import ventureSpace from './img/venturespace.jpg';

// Paste the Unstop registration URL here when it exists. Until then the button shows a clear "coming soon" state.
const REGISTER_URL = 'https://unstop.com/o/7FHXcg3';
const WHATSAPP_URL = 'https://chat.whatsapp.com/E8WtB24JNorFGPiG7sFrkb';

const STAGES = [
    { n: '01', name: 'The Idea', text: 'Submit the problem, your solution, who it helps and what makes it different.' },
    { n: '02', name: 'The Blueprint', text: 'Shortlisted participants build on a common Startup Blueprint template from Alpha Forge.' },
    { n: '03', name: 'The Final Pitch', text: 'Finalists pitch online to judges, then take their questions.' },
    { n: '04', name: 'The Investor Room', text: 'Separate and optional, for selected startups. Subject to investor availability. Date to be announced.', tag: 'Optional' },
];

const DATES = [
    { d: '14', m: 'DEC', t: 'Registrations close', s: 'Idea submissions open' },
    { d: '17', m: 'DEC', t: 'Idea submission deadline', s: 'Last day to send your idea' },
    { d: '18-19', m: 'DEC', t: 'Shortlisting and Blueprint', s: 'Shortlisted teams build their Blueprint' },
    { d: '20', m: 'DEC', t: 'Online finale', s: 'Finalists pitch to the judges' },
];

const FACTS = [
    ['FREE', 'at every stage'],
    ['ONLINE', 'from anywhere'],
    ['1-2', 'members per entry'],
    ['SCHOOL + COLLEGE', 'students welcome'],
];

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

function daysTo(y: number, m: number, d: number) {
    // Calendar days from today (India time) to the given date.
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const a = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.round((Date.UTC(y, m - 1, d) - a) / 86400000);
}

function Register({ className = '' }: { className?: string }) {
    if (REGISTER_URL) return <a className={`btn btn-red ${className}`} href={REGISTER_URL} target="_blank" rel="noopener noreferrer"><span>Register on Unstop</span><i>&rarr;</i></a>;
    return <span className={`btn btn-red is-off ${className}`} role="button" aria-disabled="true"><span>Register on Unstop</span><em>Link coming soon</em></span>;
}

function Join({ className = '', dark = false }: { className?: string; dark?: boolean }) {
    return <a className={`btn ${dark ? 'btn-ghost-light' : 'btn-ghost'} ${className}`} href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"><span>Join the WhatsApp group</span><i>&rarr;</i></a>;
}

export function App() {
    const root = useRef<HTMLDivElement>(null);
    const [days, setDays] = useState<number | null>(null);
    const [intro, setIntro] = useState<'on' | 'out' | 'gone'>('on');

    useEffect(() => {
        const el = root.current!;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        let done = false;
        const finish = () => {
            if (done) return; done = true;
            setIntro('out');
            el.classList.add('go');
            window.setTimeout(() => setIntro('gone'), 900);
        };
        // Wait for the real assets (fonts + logo), show the intro for at least 1.5s, never longer than 3.2s.
        const img = new Image(); img.src = logo;
        const ready = Promise.all([document.fonts ? document.fonts.ready : Promise.resolve(), img.decode ? img.decode().catch(() => {}) : Promise.resolve()]);
        const min = new Promise(r => window.setTimeout(r, 3600));
        Promise.all([ready, min]).then(finish);
        const cap = window.setTimeout(finish, 4500);
        const skip = () => finish();
        window.addEventListener('keydown', skip);
        return () => { window.clearTimeout(cap); window.removeEventListener('keydown', skip); };
    }, []);

    useEffect(() => {
        const el = root.current!;
        el.classList.add('js');
        setDays(daysTo(2026, 12, 14));
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduce) { setIntro('gone'); el.classList.add('go'); el.classList.add('still'); el.querySelectorAll('.rv').forEach(n => n.classList.add('in')); return; }

        const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.15 });
        el.querySelectorAll('.rv').forEach(n => io.observe(n));

        // The page lives in an auto-height frame, so it never scrolls itself: all scroll motion is driven by
        // IntersectionObserver ratios (measured against the visitor's real viewport).
        const steps = Array.from({ length: 51 }, (_, i) => i / 50);
        const ratios = new Map<Element, number>();
        const slab = el.querySelector<HTMLElement>('.slab');
        const hero = el.querySelector<HTMLElement>('.hero')!;
        const city = el.querySelector<HTMLElement>('.city')!;
        const stages = Array.from(el.querySelectorAll<HTMLElement>('.stage'));
        const sky = Array.from(el.querySelectorAll<HTMLElement>('.bar'));
        const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
        const rio = new IntersectionObserver(es => es.forEach(e => ratios.set(e.target, e.intersectionRatio)), { threshold: steps });
        [hero, city, ...stages].forEach(n => rio.observe(n));
        const onMove = (e: PointerEvent) => { pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2; pointer.ty = (e.clientY / Math.max(1, Math.min(window.innerHeight, 900)) - 0.5) * 2; };
        window.addEventListener('pointermove', onMove, { passive: true });
        let raf = 0;
        const tick = () => {
            pointer.x += (pointer.tx - pointer.x) * 0.08;
            pointer.y += (pointer.ty - pointer.y) * 0.08;
            const hp = 1 - (ratios.get(hero) ?? 1);
            if (slab) slab.style.transform = `rotateY(${pointer.x * 14 - 10 + hp * 40}deg) rotateX(${-pointer.y * 10 + 4 - hp * 18}deg) translateY(${hp * -50}px) translateZ(${hp * 60}px)`;
            stages.forEach((s, i) => {
                const own = ratios.get(s) ?? 1;
                const nxt = stages[i + 1] ? (ratios.get(stages[i + 1]) ?? 0) : 0;
                s.style.setProperty('--in', String(clamp(own * 1.4)));
                s.style.setProperty('--p', String(nxt));
            });
            const cp = ratios.get(city) ?? 0;
            sky.forEach((b, i) => b.style.setProperty('--h', String(0.3 + 0.7 * clamp(cp * 1.5 - (i % 6) * 0.04))));
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => { cancelAnimationFrame(raf); io.disconnect(); rio.disconnect(); window.removeEventListener('pointermove', onMove); };
    }, []);

    const statement = 'Every startup starts with a problem worth solving. Bring yours.'.split(' ');
    const heights = [46, 70, 38, 88, 56, 100, 64, 80, 42, 92, 58, 74, 50, 96, 66, 40, 84, 60];

    return <div className="sw" ref={root}>
        {intro !== 'gone' && <div className={`intro ${intro === 'out' ? 'is-out' : ''}`} role="presentation" onClick={() => { setIntro('out'); root.current?.classList.add('go'); window.setTimeout(() => setIntro('gone'), 900); }}>
            <div className="curtain cl" /><div className="curtain cr" />
            <div className="intro-core" aria-hidden="true">
                <div className="intro-words"><span>THINK.</span><span>BUILD.</span><span>PITCH.</span><span className="w">WIN.</span></div>
                <div className="intro-bar"><i /></div>
                <small>Tap to skip</small>
            </div>
        </div>}
        <header className="nav">
            <a className="nav-mark" href="#top" aria-label="STARTUP WARS">STARTUP <b>WARS</b></a>
            <a className="nav-join" href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">Join WhatsApp</a>
        </header>

        <section className="hero" id="top">
            <svg className="grain" aria-hidden="true"><filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" /><feColorMatrix values="0 0 0 0 .3  0 0 0 0 .22  0 0 0 0 .12  0 0 0 .9 0" /></filter><rect width="100%" height="100%" filter="url(#grain)" /></svg>
            <div className="ghost" aria-hidden="true">
                <span>THINK THINK THINK THINK</span><span>BUILD BUILD BUILD BUILD</span><span>PITCH PITCH PITCH PITCH</span><span>WIN WIN WIN WIN</span>
            </div>
            <div className="hero-in">
                <div className="stage3d">
                    <div className="slab">
                        {Array.from({ length: 9 }).map((_, i) => <div key={i} className="layer" style={{ transform: `translateZ(${-(i + 1) * 3}px)` }} />)}
                        <img className="face" src={logo} alt="STARTUP WARS. Think. Build. Pitch. Win." width="1072" height="1072" />
                        <div className="sheen" />
                    </div>
                    <div className="floor" />
                </div>
                <div className="hero-copy">
                    <p className="kicker">Free online startup competition</p>
                    <h1>An idea is <span>enough</span> to begin.</h1>
                    <p className="lede">Turn a problem you care about into a startup concept. Pitch it to judges.</p>
                    <div className="cta"><Register /><Join /></div>
                    <p className="meta">Registrations close 14 December 2026 &middot; Online finale 20 December 2026</p>
                </div>
            </div>
            <div className="scroll-cue" aria-hidden="true"><i /></div>
        </section>

        <div className="marq" aria-hidden="true"><div className="marq-track">{Array.from({ length: 3 }).map((_, k) => <span key={k}>THINK <b>&#9733;</b> BUILD <b>&#9733;</b> PITCH <b>&#9733;</b> WIN <b>&#9733;</b> FREE AT EVERY STAGE <b>&#9733;</b> FULLY ONLINE <b>&#9733;</b> </span>)}</div></div>

        <section className="about">
            <p className="state">{statement.map((w, i) => <span key={i} className="rv word" style={{ transitionDelay: `${i * 35}ms` }}>{w}</span>)}</p>
            <div className="facts">
                {FACTS.map(([a, b], i) => <div key={a} className="fact rv" style={{ transitionDelay: `${i * 90}ms` }}><strong>{a}</strong><span>{b}</span></div>)}
            </div>
            <ul className="not rv"><li>Not a coding hackathon</li><li>No finished product needed</li><li>No existing startup needed</li></ul>
        </section>

        <section className="journey">
            <div className="sec-head rv"><p className="kicker light">The journey</p><h2>Four stages. One stage.</h2></div>
            <div className="stack">
                {STAGES.map((s, i) => <article key={s.n} className="stage" style={{ top: `calc(84px + ${i * 16}px)` } as React.CSSProperties}>
                    <div className="stage-in">
                        <span className="stage-n">{s.n}</span>
                        <div><h3>{s.name}{s.tag ? <em>{s.tag}</em> : null}</h3><p>{s.text}</p></div>
                    </div>
                </article>)}
            </div>
        </section>

        <section className="dates">
            <div className="sec-head rv"><p className="kicker">Key dates</p><h2>Mark the calendar.</h2></div>
            <div className="count rv">
                <strong>{days === null ? '--' : days > 0 ? days : 0}</strong>
                <span>{days !== null && days > 0 ? 'days until registrations close and idea submissions open on 14 December' : 'Registrations close 14 December 2026'}</span>
            </div>
            <ol className="tiles">
                {DATES.map((x, i) => <li key={x.t} className="tile rv" style={{ transitionDelay: `${i * 110}ms` }}>
                    <div className="tile-card">
                        <div className="tile-date"><b>{x.d}</b><span>{x.m} 2026</span></div>
                        <div className="tile-txt"><h3>{x.t}</h3><p>{x.s}</p></div>
                    </div>
                </li>)}
            </ol>
        </section>

        <section className="room">
            <div className="city" aria-hidden="true">{heights.map((h, i) => <div key={i} className="bar" style={{ '--base': h } as React.CSSProperties} />)}</div>
            <div className="room-in rv">
                <p className="kicker light">Optional &middot; Stage four</p>
                <h2>The Investor Room</h2>
                <p>For selected startups.<br />Subject to investor availability.<br />Date to be announced.</p>
                <p className="fine">Participation does not guarantee funding.</p>
            </div>
        </section>

        <section className="partners">
            <div className="sec-head rv"><p className="kicker">Behind the competition</p><h2>Who is behind it.</h2></div>
            <div className="plates">
                {[['Organised by', 'Alpha Forge', alphaForge, 160], ['Organising Partner', 'The Breakout School', breakout, 200], ['Investment Partner', 'Venture Space', ventureSpace, 149]].map(([r, n, img, w], i) => <div key={n as string} className="plate rv" style={{ transitionDelay: `${i * 110}ms` }}>
                    <span>{r as string}</span>
                    <div className="plate-logo"><img src={img as string} alt={`${n} logo`} style={{ width: w as number }} /></div>
                    <strong>{n as string}</strong>
                </div>)}
            </div>
        </section>

        <section className="finale">
            <div className="finale-in rv">
                <h2>Bring your idea.<br />Take it beyond the drawing board.</h2>
                <p>Free at every stage.<br />Solo or with one partner.</p>
                <div className="cta center"><Register /><Join dark /></div>
            </div>
        </section>

        <footer className="foot">
            <span>STARTUP WARS &middot; Think. Build. Pitch. Win.</span>
            <span>Organised by Alpha Forge &middot; Participation in the Investor Room does not guarantee funding.</span>
        </footer>
    </div>;
}
