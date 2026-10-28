import { useState } from "react";
import { Link } from "react-router-dom";
import { aiRequest, uploadResume } from "../lib/aiClient";

const sampleJobs = [
  { id: "1", title: "React dashboard", description: "Build a responsive dashboard with React and REST APIs", skills: ["React", "JavaScript"] },
  { id: "2", title: "Python backend", description: "Create scalable APIs and database queries", skills: ["Python", "SQL"] },
];

export default function AIWorkbench() {
  const [profile, setProfile] = useState("");
  const [jobsText, setJobsText] = useState(JSON.stringify(sampleJobs, null, 2));
  const [documents, setDocuments] = useState("");
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [active, setActive] = useState("match");

  function jobs() {
    const parsed = JSON.parse(jobsText);
    if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("Jobs must be a nonempty JSON array.");
    return parsed;
  }

  async function execute() {
    setBusy(true);
    setError("");
    setResult(null);
    try {
      let response;
      if (active === "match") response = await aiRequest("/match", { profile, jobs: jobs() });
      if (active === "analyze") response = await aiRequest("/analyze", { resume_text: profile, jobs: jobs() });
      if (active === "proposal") response = await aiRequest("/proposal", { profile, job: jobs()[0] });
      if (active === "ask") response = await aiRequest("/ask", { question, documents: documents.split(/\n---\n/).filter(Boolean) });
      setResult(response);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  async function onFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      setProfile(await uploadResume(file));
      setActive("analyze");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">AI Freelancer Workbench</h1>
            <p className="text-slate-600">Explore semantic matching, proposal drafting, resume insights, and document Q&amp;A.</p>
          </div>
          <Link className="underline text-blue-700" to="/freelancer">Back to marketplace</Link>
        </header>
        <p className="bg-amber-50 border border-amber-200 rounded p-3 text-sm">Experimental local-development tool. Avoid uploading confidential resumes or contracts. Generated proposals require review.</p>
        <nav className="flex flex-wrap gap-2" aria-label="AI tools">
          {["match", "analyze", "proposal", "ask"].map(tab => (
            <button key={tab} type="button" onClick={() => { setActive(tab); setResult(null); setError(""); }}
              className={`px-4 py-2 rounded border ${active === tab ? "bg-blue-700 text-white" : "bg-white"}`}>
              {({ match: "Job matching", analyze: "Resume insights", proposal: "Proposal draft", ask: "Document Q&A" })[tab]}
            </button>
          ))}
        </nav>
        <section className="bg-white shadow-sm rounded-xl p-5 space-y-4">
          {active !== "ask" ? (
            <>
              <label className="block font-medium" htmlFor="profile">Freelancer profile or resume text</label>
              <textarea id="profile" rows={5} value={profile} onChange={e => setProfile(e.target.value)} className="w-full border rounded p-3" placeholder="Describe your skills and past projects" />
              <label className="block font-medium" htmlFor="resume">Or extract a resume (PDF or TXT, max 2 MB)</label>
              <input id="resume" type="file" accept=".pdf,.txt,application/pdf,text/plain" onChange={onFile} />
              <label className="block font-medium" htmlFor="jobs">Jobs (JSON array)</label>
              <textarea id="jobs" rows={9} value={jobsText} onChange={e => setJobsText(e.target.value)} className="w-full border rounded p-3 font-mono text-sm" />
              {active === "proposal" && <p className="text-sm text-slate-600">Uses the first job in the list and requires a configured server-side LLM key.</p>}
            </>
          ) : (
            <>
              <label htmlFor="docs" className="block font-medium">Project or contract documents (separate documents with --- on its own line)</label>
              <textarea id="docs" rows={8} value={documents} onChange={e => setDocuments(e.target.value)} className="w-full border rounded p-3" />
              <label htmlFor="question" className="block font-medium">Question</label>
              <input id="question" value={question} onChange={e => setQuestion(e.target.value)} className="w-full border rounded p-3" />
            </>
          )}
          <button disabled={busy} type="button" onClick={execute} className="bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded">
            {busy ? "Working..." : "Run"}
          </button>
          {error && <p role="alert" className="text-red-700">{error}</p>}
        </section>
        {result && (
          <section className="bg-white shadow-sm rounded-xl p-5" aria-live="polite">
            <h2 className="font-semibold text-lg mb-3">Results</h2>
            {result.proposal && <p className="whitespace-pre-wrap">{result.proposal}</p>}
            {result.answer && <p className="whitespace-pre-wrap">{result.answer}</p>}
            <pre className="overflow-auto text-xs bg-slate-100 rounded p-4 mt-3">{JSON.stringify(result, null, 2)}</pre>
          </section>
        )}
      </div>
    </main>
  );
}
