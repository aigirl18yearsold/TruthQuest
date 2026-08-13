import React, { useState } from "react";
import PhoneShell from "./components/ui/PhoneShell.jsx";
import Home from "./components/screens/Home.jsx";
import LinkEntry from "./components/screens/LinkEntry.jsx";
import PostReview from "./components/screens/PostReview.jsx";
import Investigate from "./components/screens/Investigate.jsx";
import Coach from "./components/screens/Coach.jsx";
import Results from "./components/screens/Results.jsx";
import { fetchPost, runAnalysis, getScorecard } from "./lib/api.js";
import { DEMO_POST, DEMO_ANALYSIS, DEMO_SCORE } from "./data/demoFixtures.js";

const CASE_LABELS = {
  link: "NEW CASE",
  post: "CASE FILE",
  investigate: "CASE FILE",
  coach: "CASE FILE",
  results: "CASE FILE",
};

export default function App() {
  const [screen, setScreen] = useState("home");
  const [post, setPost] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [decision, setDecision] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [scores, setScores] = useState(null);
  const [demoMode, setDemoMode] = useState(false);
  const [demoReason, setDemoReason] = useState(null);
  const [loading, setLoading] = useState(false);
  const [linkError, setLinkError] = useState(null);

  const resetCase = () => {
    setPost(null);
    setAnalysis(null);
    setDecision(null);
    setChatHistory([]);
    setScores(null);
    setLinkError(null);
    setDemoReason(null);
  };

  const handleLoadPost = async (url) => {
    setLoading(true);
    setLinkError(null);
    try {
      const p = await fetchPost(url);
      setPost(p);
      setDemoMode(false);
      setScreen("post");
    } catch (e) {
      setLinkError(e.message || "Couldn't load that link. Try the sample case instead?");
    } finally {
      setLoading(false);
    }
  };

  const handleUseDemo = () => {
    setPost(DEMO_POST);
    setDemoMode(true);
    setScreen("post");
  };

  const handleDecide = async (d) => {
    setDecision(d);
    setLoading(true);
    try {
      const result = demoMode ? await fakeDelay(DEMO_ANALYSIS) : await runAnalysis(post);
      setAnalysis(result);
      setScreen("investigate");
    } catch (e) {
      // Backend not deployed / no key yet — fall back to the sample analysis so the
      // demo still flows, but say exactly why instead of failing silently.
      setAnalysis({ ...DEMO_ANALYSIS });
      setDemoMode(true);
      setDemoReason(e.message || "live analysis unavailable");
      setScreen("investigate");
    } finally {
      setLoading(false);
    }
  };

  const handleGetScorecard = async () => {
    setLoading(true);
    try {
      const result = demoMode
        ? await fakeDelay(DEMO_SCORE)
        : await getScorecard({ post, analysis, decision, history: chatHistory });
      setScores(result);
    } catch (e) {
      setScores(DEMO_SCORE);
      setDemoMode(true);
      setDemoReason(e.message || "live scoring unavailable");
    } finally {
      setLoading(false);
      setScreen("results");
    }
  };

  const handleNext = () => {
    resetCase();
    setDemoMode(false);
    setScreen("link");
  };

  return (
    <PhoneShell screen={screen} caseLabel={CASE_LABELS[screen]}>
      {screen === "home" && <Home onStart={() => setScreen("link")} />}

      {screen === "link" && (
        <LinkEntry onLoad={handleLoadPost} onDemo={handleUseDemo} loading={loading} error={linkError} />
      )}

      {screen === "post" && post && (
        <PostReview post={post} demoMode={demoMode} loading={loading} onDecide={handleDecide} />
      )}

      {screen === "investigate" && analysis && (
        <Investigate analysis={analysis} demoMode={demoMode} demoReason={demoReason} onContinue={() => setScreen("coach")} />
      )}

      {screen === "coach" && analysis && (
        <Coach
          post={post}
          analysis={analysis}
          demoMode={demoMode}
          demoReason={demoReason}
          history={chatHistory}
          setHistory={setChatHistory}
          onContinue={handleGetScorecard}
        />
      )}

      {screen === "results" && scores && (
        <Results scores={scores} demoMode={demoMode} demoReason={demoReason} onNext={handleNext} onReplay={() => setScreen("home")} />
      )}
    </PhoneShell>
  );
}

function fakeDelay(value, ms = 600) {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}