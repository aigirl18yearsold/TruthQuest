export const DEMO_POST = {
  platform: "medium",
  author: "Nassim Nicholas Taleb",
  handle: "@nntaleb",
  avatar: null,
  text: "Believing that the book is just abstract information that can be merely held on a stick is an error we will call dimension overtrucation.",
  title: "The Book is a Book, not Disembodied Information",
  image: "https://miro.medium.com/v2/resize:fit:1200/0*gt4EQdDBdUvcfgtP.jpeg",
  publishedAt: "2026-08-11",
  permalink: "https://nntaleb.medium.com/the-book-is-a-book-not-disembodied-information-a3fa583b9e8a",
  verified: true,
  source: "opengraph",
};

export const DEMO_ANALYSIS = {
  clues: [
    { id: "publisher", question: "Who published it?", finding: "The author is Nassim Nicholas Taleb, a well-known scholar and statistician. The post is published on his verified Medium publication." },
    { id: "source", question: "Is there an original source or link?", finding: "Yes. The article originally appeared on Taleb's Substack and is cross-posted to Medium with a link back to the original publication." },
    { id: "evidence", question: "Is evidence provided?", finding: "The post is primarily philosophical/essayistic rather than empirical. It references Victor Hugo’s _Les Misérables_, a Russian scientist A.R. Luria, and Daniel Kahneman as supporting context." },
    { id: "statistic", question: "Is the statistic or central claim supported?", finding: "The central claim — that physical books create a different cognitive experience than digital text — is supported by anecdote and reasoning, not controlled experimental data." },
    { id: "language", question: "Is the language emotionally manipulative?", finding: "No. The tone is reflective and personal. Words like “horrified” express genuine reaction, not manufactured outrage." },
    { id: "crosscheck", question: "Can other reliable sources confirm it?", finding: "Taleb is a known public intellectual. The themes — embodied cognition, medium effects on memory — are consistent with established cognitive science and his prior work." },
  ],
  verdict: "credible",
  confidence: 82,
  summary: "This is a thoughtful essay from a known author, grounded in personal experience and connected to broader cognitive science ideas. It is credible as opinion/reflection, though it is not making a falsifiable empirical claim that can be proven true or false in a strict sense.",
  sources: [
    { title: "Original Substack post", url: "https://nntaleb.substack.com" }
  ],
};

export const DEMO_CHAT_REPLIES = [
  "Good observation. Taleb is a known public intellectual, and this post reads like personal essay, not clickbait. Still, ask yourself: is he making a testable claim, or just reflecting on experience?",
  "Nice. One key check here is separating 'credible author' from 'provable fact.' He cites Luria and Kahneman as supporting context — those are real references you could verify.",
  "Exactly. Emotional language here is mild and personal, not manipulative. The main thing to evaluate is whether an argument from personal experience is being presented as universal scientific fact — and in this case, it isn't.",
];

export const DEMO_SCORE = {
  sourceChecking: 88,
  evidenceEvaluation: 76,
  manipulationDetection: 92,
  summary: "You correctly identified a credible author and didn't overstate the evidence. You also noticed the difference between personal reflection and empirical proof. To sharpen further, try separating 'the author is credible' from 'the specific claim is proven.'",
};
