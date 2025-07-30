import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "@/utils/api";
import listStyles from "@/styles/History.module.css";
import detailStyles from "@/styles/HistoryDetail.module.css";

export default function History() {
  const router = useRouter();
  const { id } = router.query;

  const [matches, setMatches] = useState([]);
  const averageScore = matches.length ? (matches.reduce((sum, m) => sum + m.matchScore, 0) / matches.length).toFixed(1) : null;
  const [matchDetail, setMatchDetail] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch list or detail depending on query param
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        if (id) {
          // Fetch single match detail
          const res = await api.get(`/match/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setMatchDetail(res.data.match);
        } else {
          // Fetch all matches
          const res = await api.get("/match", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setMatches(res.data.matches);
        }
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load data. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, router]);


  // Handle download resume
  const handleDownloadResume = async () => {
    if (!matchDetail) return;
    try {
      const token = localStorage.getItem("token");
      const res = await api.get(`/resume/${matchDetail.resume.id}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: res.headers["content-type"] || "application/octet-stream" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = matchDetail.resume.originalName;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to download resume.");
    }
  };

  if (!id) {
    return (
      <main className={listStyles.container}>
        <div className={listStyles.header}>
          <h1 className={listStyles.title}>Your Match History</h1>
          {averageScore !== null && (
            <div className={listStyles.average}>Avg Score: {averageScore}%</div>
          )}
        </div>
        {loading && <p>Loading matches…</p>}
        {error && <p className={listStyles.error}>{error}</p>}
        {!loading && matches.length === 0 && <p>No matches found.</p>}

        <ul className={listStyles.matchList}>
          {matches.map((m) => (
            <li
              key={m.id}
              className={listStyles.card}
              onClick={() => router.push({ pathname: "/history", query: { id: m.id } })}
            >
              <div className={listStyles.cardHeader}>
                <span className={listStyles.score}>{m.matchScore}%</span>
                <span className={listStyles.date}>{new Date(m.createdAt).toLocaleDateString()}</span>
              </div>
              <p className={listStyles.resumeName}>{m.resume.originalName}</p>
              <p className={listStyles.preview}>{m.jobDescription}</p>
            </li>
          ))}
        </ul>
      </main>
    );
  }

  return (
    <main className={detailStyles.container}>
      <button className={detailStyles.backBtn} onClick={() => router.push("/history")}>← Back to History</button>

      {loading ? (
        <p>Loading match details…</p>
      ) : error ? (
        <p className={detailStyles.error}>{error}</p>
      ) : (
        matchDetail && (
          <>
            <h1 className={detailStyles.title}>Match Details</h1>

            <section className={detailStyles.section}>
              <h2 className={detailStyles.heading}>Overall Match Score</h2>
              <div className={detailStyles.scoreWrapper}>
                <span className={detailStyles.score}>{matchDetail.matchScore}%</span>
              </div>
            </section>

            {matchDetail.summary && (
              <section className={detailStyles.section}>
                <h3 className={detailStyles.subHeading}>Summary</h3>
                <p className={detailStyles.paragraph}>{matchDetail.summary}</p>
              </section>
            )}

            <section className={detailStyles.sectionTwoCol}>
              <div>
                <h3 className={detailStyles.subHeading}>Strengths</h3>
                <ul className={detailStyles.list}>
                  {matchDetail.strengths?.map((s, i) => (
                    <li key={i}>✅ {s}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className={detailStyles.subHeading}>Areas to Improve</h3>
                <ul className={detailStyles.list}>
                  {matchDetail.improvements?.map((imp, i) => (
                    <li key={i}>➡️ {imp}</li>
                  ))}
                </ul>
              </div>
            </section>

            {matchDetail.missingSkills?.length > 0 && (
              <section className={detailStyles.section}>
                <h3 className={detailStyles.subHeading}>Missing Skills</h3>
                <ul className={detailStyles.list}>
                  {matchDetail.missingSkills.map((skill, i) => (
                    <li key={i}>❌ {skill}</li>
                  ))}
                </ul>
              </section>
            )}

            <section className={detailStyles.section}>
              <h3 className={detailStyles.heading}>Job Description</h3>
              <pre className={detailStyles.jobDesc}>{matchDetail.jobDescription}</pre>
            </section>

            <section className={detailStyles.section}>
              <h3 className={detailStyles.heading}>Resume</h3>
              <div className={detailStyles.resumeControls}>
                <button className={detailStyles.buttonSecondary} onClick={handleDownloadResume}>
                  Download Resume
                </button>
              </div>
            </section>
          </>
        )
      )}
    </main>
  );
}