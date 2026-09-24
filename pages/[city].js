import Head from 'next/head';
import Link from 'next/link';
import SiteLayout from '../components/SiteLayout';
import { CITIES, saveCity } from '../lib/cities';
import styles from '../styles/Landing.module.css';

// One static page per city: /wayanad, /kozhikode, ...
export function getStaticPaths() {
  return {
    paths: CITIES.map((d) => ({ params: { city: d.slug.toLowerCase() } })),
    fallback: false, // anything else at the site root is a 404
  };
}

export function getStaticProps({ params }) {
  const city = CITIES.find((d) => d.slug.toLowerCase() === params.city);
  if (!city) return { notFound: true };
  return { props: { city } };
}

const svgProps = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
};

export default function CityPage({ city }) {
  const { slug, label, stand } = city;
  const url = `https://kbus.me/${slug.toLowerCase()}`;
  const others = CITIES.filter((d) => d.slug !== slug);
  const openMap = () => saveCity(slug);

  const steps = [
    { title: `Open the ${label} map`, text: `The map opens centred on ${stand}.` },
    {
      title: 'Move it to your stop',
      text: 'Drag the map so the circle covers your stop. Buses inside it show up on the map.',
    },
    { title: 'Tap a bus', text: 'Tap a bus label to see its route and every stop along the way.' },
  ];

  const features = [
    {
      accent: '#E07A3F',
      title: 'Live bus positions',
      text: `See where KSRTC buses around ${label} are right now, not where a timetable says they should be.`,
      icon: (
        <svg {...svgProps}>
          <polygon points="3 11 22 2 13 21 11 13 3 11" />
        </svg>
      ),
    },
    {
      accent: '#3F6B52',
      title: 'Full stop list',
      text: 'Tap any bus to see its route name, where it goes via, and each stop from origin to destination.',
      icon: (
        <svg {...svgProps}>
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <circle cx="3.5" cy="6" r="1" />
          <circle cx="3.5" cy="12" r="1" />
          <circle cx="3.5" cy="18" r="1" />
        </svg>
      ),
    },
    {
      accent: '#163F3D',
      title: 'Start where you are',
      text: 'Jump to your current location, or switch to any other city from the dropdown on the map.',
      icon: (
        <svg {...svgProps}>
          <circle cx="12" cy="12" r="3" />
          <circle cx="12" cy="12" r="9" />
          <line x1="12" y1="1" x2="12" y2="4" />
          <line x1="12" y1="20" x2="12" y2="23" />
        </svg>
      ),
    },
    {
      accent: '#C4622E',
      title: 'No app required',
      text: 'Opens in your phone’s browser. No account, no download, no booking flow.',
      icon: (
        <svg {...svgProps}>
          <rect x="5" y="2" width="14" height="20" rx="2" />
          <line x1="12" y1="18" x2="12.01" y2="18" />
        </svg>
      ),
    },
  ];

  return (
    <SiteLayout>
      <Head>
        <title>{`Live Bus Tracking in ${label} | KSRTC ${label} Buses – kbus.me`}</title>
        <meta
          name="description"
          content={`Track KSRTC buses live in ${label}. See buses near ${stand} and across the city on a real-time map.`}
        />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={`Live KSRTC Bus Tracking in ${label}`} />
        <meta property="og:description" content={`Real-time KSRTC bus tracking in ${label}, Kerala.`} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={url} />
      </Head>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={`${styles.heroInner} ${styles.wrap}`}>
          <div>
            <h1>Live KSRTC bus tracking in {label}.</h1>
            <p>
              See KSRTC buses around {stand} and across {label} city on a live map. Move the map
              to your stop and watch the buses come to you.
            </p>
            <div className={styles.heroCtas}>
              <Link className={styles.btnPrimary} href={`/map?city=${slug}`} onClick={openMap}>
                Open {label} live map
              </Link>
              <a className={styles.btnSecondary} href="#how-it-works">See how it works</a>
            </div>
          </div>

          <div className={styles.spineCard}>
            <div className={styles.label}>The {label} map opens centred on</div>
            <div className={styles.standName}>{stand}</div>
            <svg className={styles.spineSvg} viewBox="0 0 460 120" xmlns="http://www.w3.org/2000/svg">
              <circle cx="230" cy="60" r="50" fill="#E07A3F" fillOpacity="0.12" stroke="#888" strokeDasharray="4 4" />
              <circle cx="230" cy="60" r="7" fill="#E07A3F" />
              <line x1="230" y1="60" x2="280" y2="60" stroke="#888" strokeWidth="1" />
              <text x="288" y="64" className={`${styles.stopName} ${styles.live}`}>1 km search radius</text>
            </svg>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.statsInner}>
          <div className={styles.stat}><b>1 km</b><span>search circle around the map centre</span></div>
          <div className={styles.stat}><b>Free</b><span>no account, no app install</span></div>
          <div className={styles.stat}><b>Live</b><span>buses refresh when you move the map</span></div>
        </div>
      </div>

      {/* How it works */}
      <section className={`${styles.block} ${styles.wrap}`} id="how-it-works">
        <h2>Track your bus in {label}</h2>
        <p className={styles.lede}>Three steps from opening the page to knowing when to leave.</p>
        <div className={styles.steps}>
          {steps.map((step, i) => (
            <div className={styles.step} key={step.title}>
              <div className={styles.num}>{String(i + 1).padStart(2, '0')}</div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className={`${styles.block} ${styles.wrap}`}>
        <h2>What you get in {label}</h2>
        <p className={styles.lede}>Just the answer to &quot;where&apos;s my bus&quot;.</p>
        <div className={styles.features}>
          {features.map((f) => (
            <div className={styles.feature} key={f.title} style={{ '--accent': f.accent }}>
              {f.icon}
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Other cities */}
      <section className={`${styles.block} ${styles.wrap}`} id="coverage">
        <h2>Other cities</h2>
        <p className={styles.lede}>KSRTC live tracking across all 14 cities of Kerala.</p>
        <div className={styles.coverageGrid}>
          {others.map((d) => (
            <Link key={d.slug} href={`/${d.slug.toLowerCase()}`}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              {d.label}
            </Link>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section className={styles.ctaBanner}>
        <div className={styles.ctaBannerInner}>
          <div>
            <h2>Your {label} bus is already on the map.</h2>
            <p>Open the map and see what&apos;s moving near you.</p>
          </div>
          <Link className={styles.btnPrimary} href={`/map?city=${slug}`} onClick={openMap}>
            Open live map
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
