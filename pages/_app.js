// If pages/_app.js already exists in kbus_me, merge these imports into it; global CSS is only
// allowed to be imported here in the Pages Router.
import 'bootstrap/dist/css/bootstrap.min.css';
import '@tabler/icons-webfont/dist/tabler-icons.min.css'; // or however you load Tabler icons
import '../styles/Map.css';

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
