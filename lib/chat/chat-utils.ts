import { ChatMessage, ProviderMessage, SupportedLang, MatchRef, AppRole } from "@/types/chat.types";

const SUPPORTED: SupportedLang[] = ["html", "jsx", "js", "css"];

export function normalizeForProvider(
  msgs: Array<ChatMessage | ProviderMessage>
): ProviderMessage[] {
  const ALLOWED: any[] = ["user", "assistant", "system"];
  return msgs
    .map((m) => {
      const role = ALLOWED.includes(m.role as AppRole)
        ? (m.role as AppRole)
        : "user";
      const content =
        (m as ChatMessage).content ?? (m as ProviderMessage).content ?? "";
      const roleContext =
        (m as ChatMessage).activeRole ??
        (m as ProviderMessage).roleContext ??
        undefined;

      return {
        role,
        content: typeof content === "string" ? content : String(content ?? ""),
        roleContext,
      } as ProviderMessage;
    })
    .filter((m) => m.content.trim().length > 0);
}

export function extractFirstCodeBlock(markdown: string): { lang: SupportedLang | null; code: string | null } {
  const match = markdown.match(/```(\w+)\n([\s\S]*?)```/);
  if (!match) return { lang: null, code: null };
  const lang = match[1]?.toLowerCase();
  const code = match[2] ?? null;
  if (!code) return { lang: null, code: null };

  const language =
    lang === "javascript" ? "js" :
      lang === "tsx" ? "jsx" :
        (SUPPORTED.includes(lang as SupportedLang) ? (lang as SupportedLang) : null);

  return { lang: language, code };
}

export function buildSrcDoc(lang: SupportedLang, code: string): string {
  if (lang === "html") {
    return code;
  }

  if (lang === "jsx") {
    return `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width,initial-scale=1"/>
    <style>
      html,body,#root { height: 100%; margin: 0; padding: 0; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script type="text/babel">
      ${code}
      const rootEl = document.getElementById('root');
      try {
        if (typeof App === 'function') {
          const r = ReactDOM.createRoot(rootEl);
          r.render(React.createElement(App));
        }
      } catch (e) { console.error(e); }
    </script>
  </body>
</html>`;
  }

  if (lang === "js") {
    return `
<!doctype html>
<html>
  <head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
  <body>
    <div id="app"></div>
    <script>
    ${code}
    </script>
  </body>
</html>`;
  }

  return `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
    <style>${code}</style>
  </head>
  <body>
    <div class="preview-target">CSS preview area</div>
  </body>
</html>`;
}

export function findAllMatchesInMessages(messages: ChatMessage[], query: string): MatchRef[] {
  const q = query.trim();
  if (!q) return [];
  const lowerQ = q.toLowerCase();
  const results: MatchRef[] = [];

  for (const m of messages) {
    const id = m._id || m.id || "";
    if (!id || !m.content) continue;
    const text = m.content;
    const lowerText = text.toLowerCase();

    let from = 0;
    let occ = 0;
    while (true) {
      const idx = lowerText.indexOf(lowerQ, from);
      if (idx === -1) break;
      results.push({
        messageId: id,
        start: idx,
        end: idx + lowerQ.length,
        occurrenceInMessage: occ,
      });
      occ += 1;
      from = idx + (lowerQ.length || 1);
    }
  }
  return results;
}

export function wantsCodeFromText(text: string) {
  if (!text) return false;
  return /\b(code|implement|function|class|script|please provide|paste|full code|complete code|exact code|copyable code|run this|runable|runnable)\b/i.test(text);
}

export function systemInstructionForRole(storeKey: string, forceCode: boolean) {
  const base = `You are acting as the ${storeKey.toUpperCase()} assistant for a developer user. Reply concisely and in a developer-friendly format.`;
  const codeReq = ` When the user requests code or the active role is 'cto', provide runnable, copy-pasteable code blocks (use triple backticks with language tag). Do not add long preamble. If code is present, include only essential explanation after the code (one or two short sentences).`;
  return forceCode || storeKey === "cto" ? base + codeReq : base;
}
