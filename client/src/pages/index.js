// (Landing Page) This file maps to the URL '/'
import Head from "next/head";
import Link from "next/link";
import styles from "@/styles/Landing.module.css";

export default function Landing() {
  return (
    <>
      <Head>
        <title>ResuMatch | AI Resume Matcher</title>
        <meta name="description" content="AI powered resume to job match analysis" />
      </Head>

      {/* ----- Hero Section ----- */}
      <section className={styles.hero}>
        <h1>
          Get Your Dream Job with <span>AI</span>
        </h1>
        <p>Upload resume, paste job description, get instant matching insights</p>
        <Link href="/signup" className={styles.ctaBtn}>
          Get Started&nbsp;-&nbsp;Free →
        </Link>
      </section>

      {/* ----- Feature cards ----- */}
      <section className={styles.features}>
        <div className={styles.card}>
          <div className={styles.cardIcon}>⬆️</div>
          <h3 className={styles.cardTitle}>Upload Resume</h3>
          <p className={styles.cardDesc}>
            Securely upload your resume in PDF or DOCX for instant analysis
          </p>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon}>🤖</div>
          <h3 className={styles.cardTitle}>AI Match Analysis</h3>
          <p className={styles.cardDesc}>
            Our advanced AI analyzes job requirements and matches them with your skills
          </p>
        </div>
        <div className={styles.card}>
          <div className={styles.cardIcon}>📊</div>
          <h3 className={styles.cardTitle}>Get Insights</h3>
          <p className={styles.cardDesc}>
            Receive detailed insights and recommendations to improve your application
          </p>
        </div>
      </section>
    </>
  );
}
