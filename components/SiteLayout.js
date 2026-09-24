import Link from 'next/link';
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

// Shared header/footer/fonts/theme for the landing pages.
export default function SiteLayout({ children }) {
  return (
    <div className={`${styles.page} ${display.variable} ${body.variable}`}>
      <header className={styles.siteHeader}>
        <Link className={styles.logo} href="/">
          kbus<span>.me</span>
        </Link>
        <nav>
          <Link className={styles.navLink} href="/#how-it-works">How it works</Link>
          <Link className={styles.navLink} href="/#coverage">Coverage</Link>
          <Link className={styles.btnPrimary} href="/map">Open live map</Link>
        </nav>
      </header>

      <main>{children}</main>

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
  );
}
