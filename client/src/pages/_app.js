// Import global CSS once so it affects all pages.
import "@/styles/globals.css";
// Inject shared layout (Navbar).
import Navbar from "@/components/Navbar";

export default function App({ Component, pageProps }) {
  return (
    <>
        {/* Shared navigation bar shown on every page */}
        <Navbar />
        {/* Actual page contents rendered here */}
        <Component {...pageProps} />
    </>
  );
}