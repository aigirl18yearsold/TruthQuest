import React, { useState } from "react";
import PhoneShell from "./components/ui/PhoneShell.jsx";
import Home from "./components/screens/Home.jsx";
import LinkEntry from "./components/screens/LinkEntry.jsx";
import PostReview from "./components/screens/PostReview.jsx";
import Investigate from "./components/screens/Investigate.jsx";
import Coach from "./components/screens/Coach.jsx";
import Results from "./components/screens/Results.jsx";
import { fetchPost, runAnalysis, getScorecard, fileToPart } from "./lib/api.js";
import { DEMO_POST, DEMO_ANALYSIS, DEMO_SCORE } from "./data/demoFixtures.js";

const CASE_LABELS = {
  link: "New Case",
  post: "The Post",
  investigate: "Investigation",
  coach: "Scout",
  results: "Your Results",
}; 


function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Transient failures (a rate-limit blip, a dropped connection) often succeed a second later.
// One silent retry before we bother the player with an error is worth it; more than that just
// delays an honest "this isn't working right now" message.
async function withOneRetry(fn) {
  try {
    return await fn();
  } catch (e) {
    if (e.status === 400) throw e; // a validation error won't fix itself on retry
    console.warn("First attempt failed, retrying once:", e);
    await wait(1200);
    return fn();
  }
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [navStack, setNavStack] = useState([]);
  const [post, setPost] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [decision, setDecision] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [scores, setScores] = useState(null);
  const [demoMode, setDemoMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [linkError, setLinkError] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);
  const [scoreError, setScoreError] = useState(null);

  const goTo = (next) => {
    setNavStack((s) => [...s, screen]);
    setScreen(next);
  };

  const resetTo = (next) => {
    setNavStack([]);
    setScreen(next);
  };

  const goBack = () => {
    if (navStack.length === 0) return;
    const prev = navStack[navStack.length - 1];
    setNavStack((s) => s.slice(0, -1));
    setScreen(prev);
  };

  const resetCase = () => {
    setPost(null);
    setAnalysis(null);
    setDecision(null);
    setChatHistory([]);
    setScores(null);
    setLinkError(null);
    setAnalysisError(null);
    setScoreError(null);
  };

  const handleLoadPost = async (url) => {
    setLoading(true);
    setLinkError(null);
    try {
      const p = await fetchPost(url);
      setPost(p);
      setDemoMode(false);
      goTo("post");
    } catch (e) {
      setLinkError(e.message || "Couldn't load that link. Try the sample case instead?");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadMedia = async (file) => {
    setLoading(true);
    setLinkError(null);
    try {
      const part = await fileToPart(file);
      const mediaType = file.type.startsWith("audio/") ? "audio" : "video";
      setPost({
        platform: "upload",
        author: "Uploaded clip",
        handle: null,
        avatar: null,
        text: file.name,
        title: null,
        image: null,
        permalink: null,
        verified: false,
        source: "upload",
        mediaType,
        mediaFile: part,
      });
      setDemoMode(false);
      goTo("post");
    } catch (e) {
      setLinkError(e.message || "Couldn't read that file.");
    } finally {
      setLoading(false);
    }
  };

  const handleUseDemo = () => {
    setPost(DEMO_POST);
    setDemoMode(true);
    goTo("post");
  };

  // Demo mode is now ONLY ever true because the player chose "try the sample case" — a
  // real post's analysis failing never silently swaps in unrelated canned content anymore.
  const handleDecide = async (d) => {
    setDecision(d);
    setLoading(true);
    setAnalysisError(null);
    try {
      const result = demoMode
        ? await wait(500).then(() => DEMO_ANALYSIS)
        : await withOneRetry(() => runAnalysis(post));
      setAnalysis(result);
      goTo("investigate");
    } catch (e) {
      console.error("Analysis failed after retry:", e);
      setAnalysisError(
        e.status === 400
          ? e.message || "There's nothing here for Scout to investigate yet."
          : "Scout couldn't finish investigating this post just now — that's usually a temporary hiccup on the AI side. Give it another try."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGetScorecard = async () => {
    setLoading(true);
    setScoreError(null);
    try {
      const result = demoMode
        ? await wait(500).then(() => DEMO_SCORE)
        : await withOneRetry(() => getScorecard({ post, analysis, decision, history: chatHistory }));
      setScores(result);
      goTo("results");
    } catch (e) {
      console.error("Scoring failed after retry:", e);
      setScoreError("Scout couldn't put together your scorecard just now. Give it another try.");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    resetCase();
    setDemoMode(false);
    resetTo("link");
  };

  const handleStartOver = () => {
    resetCase();
    setDemoMode(false);
    resetTo("home");
  };

  return (
    <PhoneShell screen={screen} caseLabel={CASE_LABELS[screen]} canGoBack={navStack.length > 0} onBack={goBack}>
      {screen === "home" && <Home onStart={() => goTo("link")} />}

      {screen === "link" && (
        <LinkEntry
          onLoad={handleLoadPost}
          onUploadMedia={handleUploadMedia}
          onDemo={handleUseDemo}
          loading={loading}
          error={linkError}
        />
      )}

      {screen === "post" && post && (
        <PostReview
          post={post}
          demoMode={demoMode}
          loading={loading}
          error={analysisError}
          onDecide={handleDecide}
        />
      )}

      {screen === "investigate" && analysis && (
        <Investigate analysis={analysis} demoMode={demoMode} onContinue={() => goTo("coach")} />
      )}

      {screen === "coach" && analysis && (
        <Coach
          post={post}
          analysis={analysis}
          demoMode={demoMode}
          history={chatHistory}
          setHistory={setChatHistory}
          onContinue={handleGetScorecard}
          scoreLoading={loading}
          scoreError={scoreError}
        />
      )}

      {screen === "results" && scores && (
        <Results scores={scores} demoMode={demoMode} onNext={handleNext} onReplay={handleStartOver} />
      )}
    </PhoneShell>
  );
}