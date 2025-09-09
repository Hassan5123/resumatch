import "@/styles/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
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