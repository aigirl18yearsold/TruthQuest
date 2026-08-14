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
  link: "NEW CASE",
  post: "CASE FILE",
  investigate: "CASE FILE",
  coach: "CASE FILE",
  results: "CASE FILE",
};

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

  // Forward navigation: remembers where we came from so the back button works.
  const goTo = (next) => {
    setNavStack((s) => [...s, screen]);
    setScreen(next);
  };

  // Used for resets ("start over", "next challenge") — clears history rather than pushing to it.
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

  const handleDecide = async (d) => {
    setDecision(d);
    setLoading(true);
    try {
      const result = demoMode ? await fakeDelay(DEMO_ANALYSIS) : await runAnalysis(post);
      setAnalysis(result);
      goTo("investigate");
    } catch (e) {
      // Backend not reachable — fall back to the sample case so the experience
      // still flows smoothly. Details go to the console for debugging, never the UI.
      console.error("Analysis failed, showing sample case:", e);
      setAnalysis({ ...DEMO_ANALYSIS });
      setDemoMode(true);
      goTo("investigate");
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
      console.error("Scoring failed, showing sample scorecard:", e);
      setScores(DEMO_SCORE);
      setDemoMode(true);
    } finally {
      setLoading(false);
      goTo("results");
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
        <PostReview post={post} demoMode={demoMode} loading={loading} onDecide={handleDecide} />
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
        />
      )}

      {screen === "results" && scores && (
        <Results scores={scores} demoMode={demoMode} onNext={handleNext} onReplay={handleStartOver} />
      )}
    </PhoneShell>
  );
}

function fakeDelay(value, ms = 600) {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}