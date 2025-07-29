// Protected Results page – displays analysis results after resume matching
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import styles from "@/styles/Results.module.css";

export default function Results() {
  const router = useRouter();
  const [data, setData] = useState(null);

  // Protect route & load data on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    const stored = localStorage.getItem("matchResult");
    if (!stored) {
      // If user lands here directly w/out data, go back to match page
      router.replace("/match");
      return;
    }
    try {
      setData(JSON.parse(stored));
    } catch (err) {
      console.error("Failed to parse matchResult", err);
      router.replace("/match");
    }
  }, [router]);

  if (!data) {
    return (
      <main className={styles.centerScreen}>
        <p>Loading results…</p>
      </main>
    );
  }

  const { match, metadata } = data;
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Match Analysis Results</h1>

      <section className={styles.section}>
        <h2 className={styles.heading}>Overall Match Score</h2>
        <div className={styles.scoreWrapper}>
          <span className={styles.score}>{match.matchScore}%</span>
        </div>
      </section>

      {match.summary && (
        <section className={styles.section}>
          <h2 className={styles.heading}>Summary</h2>
          <p className={styles.paragraph}>{match.summary}</p>
        </section>
      )}

      <section className={styles.sectionTwoCol}>
        <div>
          <h3 className={styles.subHeading}>Strengths</h3>
          <ul className={styles.list}>
            {match.strengths?.map((s, i) => (
              <li key={i}>✅ {s}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className={styles.subHeading}>Areas to Improve</h3>
          <ul className={styles.list}>
            {match.improvements?.map((imp, i) => (
              <li key={i}>➡️ {imp}</li>
            ))}
          </ul>
        </div>
      </section>

      {match.missingSkills?.length > 0 && (
        <section className={styles.section}>
          <h3 className={styles.subHeading}>Missing Skills</h3>
          <ul className={styles.list}>
            {match.missingSkills.map((skill, i) => (
              <li key={i}>❌ {skill}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}