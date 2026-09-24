import Head from 'next/head';
import dynamic from 'next/dynamic';

// The map, Google Maps loader and bottom sheet are browser-only, so skip SSR.
const MapPage = dynamic(() => import('../components/MapPage'), {
  ssr: false,
  loading: () => <div id="map-wrapper" />,
});

export default function Map() {
  return (
    <>
      <Head>
        <title>Nearby buses</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <MapPage />
    </>
  );
}
