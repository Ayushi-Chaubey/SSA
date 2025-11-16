import React, { useState, useEffect } from "react";
import axios from "axios";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";


function App() {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [quiz, setQuiz] = useState("");
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(false);

  // ---------------------------
  // PROCESS NOTES (Summary + Quiz)
  // ---------------------------
  const handleProcess = async () => {
    if (!text.trim()) {
      alert("Please paste some notes first.");
      return;
    }

    setLoading(true);

    try {
      // 1. Call backend
      const res = await axios.post("http://localhost:5000/process", { text });

      if (!res.data.summary) throw new Error("No summary returned.");
      if (!res.data.quiz) throw new Error("No quiz returned.");

      setSummary(res.data.summary);
      setQuiz(res.data.quiz);

      // 2. Save to Firestore (safe)
      try {
        await addDoc(collection(db, "summaries"), {
          original: text,
          summary: res.data.summary,
          quiz: res.data.quiz,
          createdAt: serverTimestamp(),
        });
      } catch (firestoreError) {
        console.warn(
          "Firestore save failed, but processing succeeded.",
          firestoreError
        );
      }

      fetchSaved();
    } catch (err) {
      console.error("REAL BACKEND ERROR:", err);
      alert("Backend failed. Check server or API key.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // LOAD SAVED ITEMS FROM FIRESTORE
  // ---------------------------
  const fetchSaved = async () => {
    try {
      const snap = await getDocs(collection(db, "summaries"));
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // Sort by latest timestamp
      items.sort(
        (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)
      );

      setSaved(items);
    } catch (err) {
      console.error("Firestore read error", err);
    }
  };

  // Load saved summaries on page load
  useEffect(() => {
    fetchSaved();
  }, []);

  return (
    <div className="container">
      <div className="header">
        <h1>🧠 Smart Study Assistant</h1>
        <div className="small">Paste notes → Get Summary + Quiz</div>
      </div>

      <p className="small">Paste your lecture notes below:</p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste your notes here..."
      />

      <div>
        <button
          className="btn-primary"
          onClick={handleProcess}
          disabled={loading}
        >
          {loading ? "Processing..." : "Generate Summary & Quiz"}
        </button>

        <button className="btn-secondary" onClick={fetchSaved}>
          Refresh Saved
        </button>
      </div>

      {/* Summary */}
      <h3>📄 Summary</h3>
      <div className="result">{summary || "No summary yet."}</div>

      {/* Quiz */}
      <h3>📝 Quiz</h3>
      <div className="result quiz-box">
        {quiz
            ? quiz
                .replace(/\*\*/g, "")               // remove extra markdown
                .replace(/(\d+\.)/g, "\n$1")        // line break before each question
                .replace(/Answers:/i, "\n\n📌 Answers:") // make answers section cleaner
                .replace(/([a-d]\))/g, "$1 ")       // space after options
            : "No quiz yet."}
      </div>


      {/* Saved Entries */}
      <h3>💾 Saved Entries</h3>
      {saved.length === 0 && (
        <div className="small">No saved entries yet.</div>
      )}

      {saved.map((s) => (
        <div key={s.id} className="saved-item">
          <div className="small">
            <strong>Saved:</strong>{" "}
            {s.createdAt?.toDate
              ? s.createdAt.toDate().toLocaleString()
              : ""}
          </div>

          <div style={{ marginTop: 6 }}>
            <strong>Summary</strong>
            <div className="result">{s.summary}</div>
          </div>

          <div style={{ marginTop: 6 }}>
            <strong>Quiz</strong>
            <div className="result">{s.quiz}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default App;
