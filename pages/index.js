import Head from 'next/head';
import Link from 'next/link';
import Script from 'next/script';
import { Space_Grotesk, IBM_Plex_Sans } from 'next/font/google';
import styles from '../styles/Landing.module.css';

const display = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
});
const body = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
});

const GA_ID = 'G-JN13EH64RK';

// Same slugs as DISTRICT_CENTERS in MapPage.js (case matters: "Pathanamthitta").
const DISTRICTS = [
  { slug: 'thiruvananthapuram', label: 'Thiruvananthapuram' },
  { slug: 'kollam', label: 'Kollam' },
  { slug: 'Pathanamthitta', label: 'Pathanamthitta' },
  { slug: 'kottayam', label: 'Kottayam' },
  { slug: 'alappuzha', label: 'Alappuzha' },
  { slug: 'idukki', label: 'Idukki' },
  { slug: 'ernakulam', label: 'Ernakulam' },
  { slug: 'thrissur', label: 'Thrissur' },
  { slug: 'palakkad', label: 'Palakkad' },
  { slug: 'malappuram', label: 'Malappuram' },
  { slug: 'kozhikode', label: 'Kozhikode' },
  { slug: 'wayanad', label: 'Wayanad' },
  { slug: 'kannur', label: 'Kannur' },
  { slug: 'kasaragod', label: 'Kasaragod' },
];

const CORRIDOR = [
  { x: 20, name: 'Kannur' },
  { x: 104, name: 'Kozhikode' },
  { x: 188, name: 'Thrissur', live: '12 min' },
  { x: 272, name: 'Ernakulam' },
  { x: 356, name: 'Kottayam' },
  { x: 440, name: 'Thiruvananthapuram' },
];

const STEPS = [
  {
    title: 'Move the map to the stop',
    text: 'Move the map to the stop you want to track. The busses will list inside the circle.',
  },
  {
    title: 'Watch it move',
    text: "See the bus's live position on the map as it makes its way toward you.",
  },
  {
    title: 'Time your walk',
    text: 'Check the ETA at your stop and head out right before the bus does.',
  },
];

const svgProps = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
};

const FEATURES = [
  {
    accent: '#E07A3F',
    title: 'Live GPS tracking',
    text: "Positions come straight from KSRTC's own GPS feed, refreshed continually — not a fixed timetable guess.",
    icon: (
      <svg {...svgProps}>
        <polygon points="3 11 22 2 13 21 11 13 3 11" />
      </svg>
    ),
  },
  {
    accent: '#3F6B52',
    title: 'Route & stop search',
    text: 'Look up any KSRTC route or stop by name, in Malayalam or English, and see every bus running on it right now.',
    icon: (
      <svg {...svgProps}>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
  },
  {
    accent: '#163F3D',
    title: 'Arrival estimates that adjust',
    text: 'ETAs update as the bus moves, accounting for traffic and stop delays along the way.',
    icon: (
      <svg {...svgProps}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    accent: '#C4622E',
    title: 'No app required',
    text: 'Opens straight in the browser. Built to stay usable on a slow connection, not just on 4G.',
    icon: (
      <svg {...svgProps}>
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </svg>
    ),
  },
];

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'KSRTC Live Bus Tracking',
  url: 'https://kbus.me/',
  applicationCategory: 'TravelApplication',
  operatingSystem: 'Any',
};

// Runs in <head> before the body is parsed, so returning users are sent to
// /map without ever seeing this page.
const REDIRECT_SCRIPT = `(function () {
  try {
    if (localStorage.getItem('selectedDistrict')) {
      window.location.replace('/map');
    }
  } catch (e) {}
})();`;

function saveDistrict(slug) {
  try {
    localStorage.setItem('selectedDistrict', JSON.stringify({ slug }));
  } catch {
    // localStorage unavailable — navigation still proceeds
  }
}

export default function Home() {
  return (
    <>
      <Head>
        <title>Kerala KSRTC Live Bus Tracking | Track Buses in Real Time</title>
        <meta
          name="description"
          content="Track KSRTC buses live across Kerala. Real-time bus locations, routes, and schedules for Kerala State Road Transport Corporation."
        />
        <link rel="canonical" href="https://kbus.me/" />
        <meta property="og:title" content="Kerala KSRTC Live Bus Tracking" />
        <meta property="og:description" content="Real-time KSRTC bus tracking across Kerala." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://kbus.me/" />
        <script key="redirect" dangerouslySetInnerHTML={{ __html: REDIRECT_SCRIPT }} />
        <script
          key="ld-json"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
      </Head>

      {/* Google tag (gtag.js) */}
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="gtag-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
      </Script>

      <div className={`${styles.page} ${display.variable} ${body.variable}`}>
        <header className={styles.siteHeader}>
          <Link className={styles.logo} href="/">
            kbus<span>.me</span>
          </Link>
          <nav>
            <a className={styles.navLink} href="#how-it-works">How it works</a>
            <a className={styles.navLink} href="#coverage">Coverage</a>
            <Link className={styles.btnPrimary} href="/map">Open live map</Link>
          </nav>
        </header>

        <main>
          {/* Hero */}
          <section className={styles.hero}>
            <div className={`${styles.heroInner} ${styles.wrap}`}>
              <div>
                <h1>Know exactly when your KSRTC bus will arrive.</h1>
                <p>
                  Live GPS positions for KSRTC buses across Kerala. Search a route, watch it move on
                  the map, and time your walk to the stop instead of guessing.
                </p>
                <div className={styles.heroCtas}>
                  <Link className={styles.btnPrimary} href="/map">Open live map</Link>
                  <a className={styles.btnSecondary} href="#how-it-works">See how it works</a>
                </div>
              </div>

              <div className={styles.spineCard}>
                <div className={styles.label}>Thiruvananthapuram – Kannur corridor, right now</div>
                <svg className={styles.spineSvg} viewBox="0 0 460 120" xmlns="http://www.w3.org/2000/svg">
                  <line x1="20" y1="30" x2="440" y2="30" stroke="#D9DDD1" strokeWidth="2" />
                  {CORRIDOR.map((stop) => (
                    <g key={stop.name}>
                      <circle
                        cx={stop.x}
                        cy="30"
                        r={stop.live ? 7 : 4.5}
                        fill={stop.live ? '#E07A3F' : '#0D2B2A'}
                      />
                      {stop.live && (
                        <text x={stop.x} y="14" textAnchor="middle" className={`${styles.stopName} ${styles.live}`}>
                          {stop.live}
                        </text>
                      )}
                      <text
                        x={stop.x}
                        y="54"
                        textAnchor="middle"
                        className={stop.live ? `${styles.stopName} ${styles.live}` : styles.stopName}
                      >
                        {stop.name}
                      </text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>
          </section>

          {/* Stats */}
          <div className={styles.stats}>
            <div className={styles.statsInner}>
              <div className={styles.stat}><b>14</b><span>districts covered</span></div>
              <div className={styles.stat}><b>30s</b><span>position refresh</span></div>
              <div className={styles.stat}><b>1000+</b><span>stops mapped</span></div>
            </div>
          </div>

          {/* How it works */}
          <section className={`${styles.block} ${styles.wrap}`} id="how-it-works">
            <h2>Three steps, no app install</h2>
            <p className={styles.lede}>
              Open it in your phone&apos;s browser and it works the same as an app would.
            </p>
            <div className={styles.steps}>
              {STEPS.map((step, i) => (
                <div className={styles.step} key={step.title}>
                  <div className={styles.num}>{String(i + 1).padStart(2, '0')}</div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Coverage */}
          <section className={`${styles.block} ${styles.wrap}`} id="coverage">
            <h2>Covering every district KSRTC serves</h2>
            <p className={styles.lede}>Pick a district to see its live routes and depots.</p>
            <div className={styles.coverageGrid}>
              {DISTRICTS.map((d) => (
                <Link key={d.slug} href={`/map?district=${d.slug}`} onClick={() => saveDistrict(d.slug)}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  {d.label}
                </Link>
              ))}
            </div>
          </section>

          {/* Features */}
          <section className={`${styles.block} ${styles.wrap}`}>
            <h2>Built around what commuters actually need</h2>
            <p className={styles.lede}>
              No account, no booking flow — just the answer to &quot;where&apos;s my bus&quot;.
            </p>
            <div className={styles.features}>
              {FEATURES.map((f) => (
                <div className={styles.feature} key={f.title} style={{ '--accent': f.accent }}>
                  {f.icon}
                  <h3>{f.title}</h3>
                  <p>{f.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA banner */}
          <section className={styles.ctaBanner}>
            <div className={styles.ctaBannerInner}>
              <div>
                <h2>Your bus is already on the map.</h2>
                <p>Search your route and see it moving in real time.</p>
              </div>
              <Link className={styles.btnPrimary} href="/map">Open live map</Link>
            </div>
          </section>
        </main>

        <footer className={styles.footer}>
          <div className={styles.footerInner}>
            <p>
              kbus.me is an independent live bus tracking service for Kerala KSRTC routes. It is not
              officially affiliated with, or endorsed by, Kerala State Road Transport Corporation.
            </p>
            <div className={styles.footerLinks}>
              <Link href="/map">Live map</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
