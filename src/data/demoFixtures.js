export const DEMO_POST = {
  platform: "twitter",
  author: "ScienceDaily.Now",
  handle: "@sciencedaily_now",
  avatar: null,
  text: "🚨 BREAKING: Scientists prove that students who use their phones for 10 minutes before an exam score 50% higher! 😱📈",
  image: null,
  permalink: "https://example.com/demo-post",
  verified: true,
  source: "demo",
};

export const DEMO_ANALYSIS = {
  clues: [
    { id: "publisher", question: "Who published it?", finding: "“ScienceDaily.Now” isn't affiliated with any real research institution — the checkmark is a paid verification badge, not a credibility marker." },
    { id: "source", question: "Is there an original source?", finding: "No link, study name, or journal is cited anywhere in the post or its replies." },
    { id: "evidence", question: "Is evidence provided?", finding: "The post shows only a stock photo of a student holding a phone — no data, chart, or sample size." },
    { id: "statistic", question: "Is the statistic or central claim supported?", finding: "“50% higher” has no baseline. Higher than what? Measured how? Tested on how many students?" },
    { id: "language", question: "Is the language emotionally manipulative?", finding: "Words like “BREAKING” and the shocked-face emoji are built to trigger urgency and surprise, not to inform." },
    { id: "crosscheck", question: "Can other reliable sources confirm it?", finding: "A search of major science outlets and fact-checking sites turns up nothing else on this claim." },
  ],
  verdict: "misleading",
  confidence: 88,
  summary: "This post makes a strong statistical claim but never names the study behind it. Before trusting a number like “50% higher,” look for the original research and see whether independent, reliable outlets report the same finding.",
  sources: [],
};

export const DEMO_CHAT_REPLIES = [
  "That's the right instinct — a specific number like “50% higher” should always make you ask “compared to what, exactly?” I searched for the original study and couldn't find one anywhere, which is itself a red flag.",
  "Good catch. Accounts that look official (checkmarks, science-y names) aren't automatically credible — badges can be purchased. What matters is whether they cite where the claim comes from.",
  "Exactly — urgency words like “BREAKING” and shocked-face emoji are a manipulation pattern, not a reporting style. Real findings don't usually need to shout.",
];

export const DEMO_SCORE = {
  sourceChecking: 82,
  evidenceEvaluation: 75,
  manipulationDetection: 88,
  summary: "You caught the missing source quickly and didn't let the confident tone override your judgment. Next time, try naming exactly what evidence WOULD change your mind — it sharpens the check even further.",
};