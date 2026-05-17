"use client";

import { useState } from "react";

interface WordFreq {
  word: string;
  count: number;
}

interface AnalysisResult {
  pages: string[];
  topWords: WordFreq[];
  totalWords: number;
}

const EXAMPLE_CATEGORIES = [
  "Artificial intelligence",
  "Ancient Rome",
  "Quantum mechanics",
  "Jazz music",
  "Climate change",
];

export default function Home() {
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");

  async function handleAnalyze() {
    if (!category.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unknown error");
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const maxCount = result?.topWords[0]?.count ?? 1;

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white font-['DM_Sans',sans-serif]">
      {/* Grid background */}
      <div
        className="fixed inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Glow */}
      <div className="fixed top-[-200px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-indigo-300 mb-6 tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Wikipedia Analyzer
          </div>
          <h1
            className="text-5xl md:text-6xl font-black tracking-tight mb-4 leading-none"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Wiki
            <span className="text-indigo-400">Lens</span>
          </h1>
          <p className="text-white/40 text-lg max-w-md mx-auto leading-relaxed">
            Enter any Wikipedia category and instantly visualize the most
            significant words across all its articles.
          </p>
        </div>

        {/* Search card */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 mb-4 backdrop-blur-sm">
          <label className="block text-xs uppercase tracking-widest text-white/30 mb-3">
            Wikipedia Category
          </label>
          <div className="flex gap-3">
            <input
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all text-sm"
              placeholder="e.g. Artificial intelligence"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
              disabled={loading}
            />
            <button
              onClick={handleAnalyze}
              disabled={loading || !category.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-white/5 disabled:text-white/20 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 whitespace-nowrap flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Analyzing…
                </>
              ) : (
                "Analyze →"
              )}
            </button>
          </div>

          {/* Examples */}
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="text-xs text-white/20 mr-1 self-center">Try:</span>
            {EXAMPLE_CATEGORIES.map((ex) => (
              <button
                key={ex}
                onClick={() => setCategory(ex)}
                className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-3 py-1 text-white/50 hover:text-white/80 transition-all"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-4 text-red-400 text-sm mb-6">
            ⚠ {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3 mt-8 animate-pulse">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-28 h-3 bg-white/5 rounded" />
                <div
                  className="h-3 bg-white/5 rounded"
                  style={{ width: `${Math.random() * 60 + 20}%` }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="mt-6 space-y-6">
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Articles scanned", value: result.pages.length },
                { label: "Unique words found", value: result.totalWords.toLocaleString() },
                { label: "Top word count", value: result.topWords[0]?.count ?? 0 },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-center"
                >
                  <div className="text-2xl font-black text-indigo-300">{s.value}</div>
                  <div className="text-xs text-white/30 mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Word frequency chart */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
              <h2 className="text-sm uppercase tracking-widest text-white/30 mb-6">
                Word Frequency — Top 50
              </h2>
              <div className="space-y-2">
                {result.topWords.map(({ word, count }, i) => {
                  const pct = (count / maxCount) * 100;
                  const hue = Math.round(250 - (i / result.topWords.length) * 60);
                  return (
                    <div key={word} className="flex items-center gap-3 group">
                      <span className="text-xs text-white/20 w-5 text-right tabular-nums">{i + 1}</span>
                      <span className="text-sm text-white/70 w-28 truncate group-hover:text-white transition-colors">
                        {word}
                      </span>
                      <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${pct}%`,
                            background: `hsl(${hue}, 70%, 60%)`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-white/30 w-10 text-right tabular-nums">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Articles scanned */}
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
              <h2 className="text-sm uppercase tracking-widest text-white/30 mb-4">
                Articles Scanned
              </h2>
              <div className="flex flex-wrap gap-2">
                {result.pages.map((p) => (
                  <a
                    key={p}
                    href={`https://en.wikipedia.org/wiki/${encodeURIComponent(p)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs bg-white/5 hover:bg-indigo-500/20 border border-white/10 hover:border-indigo-500/40 rounded-full px-3 py-1.5 text-white/50 hover:text-indigo-300 transition-all"
                  >
                    {p}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-8 text-xs text-white/15">
        Powered by the free Wikipedia MediaWiki API ·
      </div>
    </main>
  );
}
