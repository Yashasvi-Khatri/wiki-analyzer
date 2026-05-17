import { NextRequest, NextResponse } from "next/server";

const WIKI_API = "https://en.wikipedia.org/w/api.php";

const STOP_WORDS = new Set([
  "the","a","an","and","or","but","in","on","at","to","for","of","with",
  "by","from","is","was","are","were","be","been","being","have","has",
  "had","do","does","did","will","would","could","should","may","might",
  "shall","can","this","that","these","those","i","you","he","she","it",
  "we","they","what","which","who","when","where","why","how","all","each",
  "every","both","few","more","most","other","some","such","no","not","only",
  "same","so","than","too","very","just","as","its","his","her","their",
  "our","your","my","me","him","us","them","s","t","don","doesn","didn",
  "isn","aren","wasn","weren","won","hadn","hasn","haven","also","cite",
  "reference","http","https","www","com","org","retrieved","isbn","doi",
  "page","pages","website","link","edit","section","one","two","three",
  "new","first","second","time","year","years","many","used","use","using",
  "known","called","made","well","since","however","although","often",
  "later","early","based","including","between","during","after","before",
  "into","through","while","about","over","under","around","against"
]);

async function getPagesInCategory(category: string): Promise<string[]> {
  const cat = category.startsWith("Category:") ? category : `Category:${category}`;
  const pages: string[] = [];
  let cmcontinue: string | undefined;

  for (let i = 0; i < 3; i++) { // max 3 pages of results (1500 articles) to stay within timeout
    const params = new URLSearchParams({
      action: "query",
      format: "json",
      list: "categorymembers",
      cmtitle: cat,
      cmlimit: "20", // limit per batch to stay fast
      cmtype: "page",
      origin: "*",
      ...(cmcontinue ? { cmcontinue } : {}),
    });

    const res = await fetch(`${WIKI_API}?${params}`);
    const data = await res.json();

    if (data?.query?.categorymembers) {
      for (const m of data.query.categorymembers) pages.push(m.title);
    }

    if (data?.continue?.cmcontinue) {
      cmcontinue = data.continue.cmcontinue;
    } else break;
  }

  return pages.slice(0, 15); // cap at 15 articles for speed
}

async function getPageContent(title: string): Promise<string> {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    titles: title,
    prop: "extracts",
    explaintext: "true",
    exsectionformat: "plain",
    exintro: "true", // only intro for speed
    origin: "*",
  });

  const res = await fetch(`${WIKI_API}?${params}`);
  const data = await res.json();

  if (data?.query?.pages) {
    for (const id of Object.keys(data.query.pages)) {
      return data.query.pages[id]?.extract ?? "";
    }
  }
  return "";
}

function analyzeText(text: string): Map<string, number> {
  const freq = new Map<string, number>();
  const words = text
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/);

  for (const word of words) {
    if (word.length > 2 && !STOP_WORDS.has(word) && !/^\d+$/.test(word)) {
      freq.set(word, (freq.get(word) ?? 0) + 1);
    }
  }
  return freq;
}

export async function POST(req: NextRequest) {
  try {
    const { category } = await req.json();
    if (!category?.trim()) {
      return NextResponse.json({ error: "Category is required" }, { status: 400 });
    }

    const pages = await getPagesInCategory(category.trim());
    if (pages.length === 0) {
      return NextResponse.json({ error: `No pages found in category "${category}". Try a different name.` }, { status: 404 });
    }

    const totalFreq = new Map<string, number>();

    await Promise.all(
      pages.map(async (title) => {
        const content = await getPageContent(title);
        const freq = analyzeText(content);
        for (const [word, count] of freq) {
          totalFreq.set(word, (totalFreq.get(word) ?? 0) + count);
        }
      })
    );

    const topWords = [...totalFreq.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50)
      .map(([word, count]) => ({ word, count }));

    return NextResponse.json({ pages, topWords, totalWords: totalFreq.size });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 500 });
  }
}
