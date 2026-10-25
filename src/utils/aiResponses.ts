export const getSmartAssistantResponse = (prompt: string): string => {
  const lower = prompt.toLowerCase().trim();

  if (lower.includes('debounce') || lower.includes('typescript') || lower.includes('javascript')) {
    return `Here is a production-ready, type-safe debounce implementation in TypeScript:

\`\`\`typescript
export interface DebounceOptions {
  leading?: boolean;
  maxWait?: number;
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  waitMs: number,
  options: DebounceOptions = {}
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let maxTimeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastCallTime: number | null = null;

  const cancel = () => {
    if (timeoutId) clearTimeout(timeoutId);
    if (maxTimeoutId) clearTimeout(maxTimeoutId);
    timeoutId = null;
    maxTimeoutId = null;
    lastArgs = null;
    lastCallTime = null;
  };

  const debounced = (...args: Parameters<T>) => {
    lastArgs = args;
    const now = Date.now();
    const isFirstCall = lastCallTime === null;
    lastCallTime = now;

    if (isFirstCall && options.leading) {
      func(...args);
    }

    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      if (!options.leading || !isFirstCall) {
        func(...(lastArgs as Parameters<T>));
      }
      cancel();
    }, waitMs);

    if (options.maxWait && !maxTimeoutId) {
      maxTimeoutId = setTimeout(() => {
        func(...(lastArgs as Parameters<T>));
        cancel();
      }, options.maxWait);
    }
  };

  debounced.cancel = cancel;
  return debounced;
}
\`\`\`

### Key Architecture Details:
- **Type Safety**: Preserves original argument types with \`Parameters<T>\` and return signatures.
- **Teardown & Cleanup**: Exposes a \`.cancel()\` method ideal for React \`useEffect\` cleanup hooks.
- **Starvation Guard**: \`maxWait\` guarantees the function eventually executes even during intense rapid typing.`;
  }

  if (lower.includes('monolith') || lower.includes('microservice') || lower.includes('architecture')) {
    return `### Modular Monolith vs. Microservices Architecture

| Dimension | Modular Monolith | Microservices |
| :--- | :--- | :--- |
| **Team Size** | 1 to 30 engineers | 40+ engineers across multiple squads |
| **Operational Overhead** | Low (single CI/CD, single DB) | High (Kubernetes, service mesh, tracing) |
| **Data Consistency** | ACID DB transactions | Eventual consistency, Saga pattern |
| **Deployment Latency** | Instant local function calls | Network hops, serialization overhead |
| **Recommended Stage** | Early to Growth (Seed to Series A) | Scale-up with discrete domain teams |

#### Strategic Recommendation:
Start with a **Modular Monolith**. Enforce strict boundary enforcement between domain modules using private package boundaries. Extract individual compute bottlenecks into microservices only when team autonomy or divergent scaling profiles demand it.`;
  }

  if (lower.includes('index') || lower.includes('postgres') || lower.includes('sql') || lower.includes('database')) {
    return `### PostgreSQL Index Optimization: B-Trees & Composite Ordering

In PostgreSQL, composite B-Tree indexes follow the **Leftmost Prefix Rule**:

\`\`\`sql
-- High efficiency composite index definition
CREATE INDEX idx_orders_composite 
ON orders (organization_id, status, created_at DESC);

-- Query 1: HIGH PERFORMANCE (Uses all 3 columns)
SELECT * FROM orders 
WHERE organization_id = 'org_789' 
  AND status = 'completed' 
ORDER BY created_at DESC 
LIMIT 25;

-- Query 2: Range Filtering Rule
-- Place equality columns BEFORE range columns in index definition!
SELECT * FROM orders 
WHERE organization_id = 'org_789' 
  AND created_at >= NOW() - INTERVAL '14 days';
\`\`\`

#### Production Best Practices:
1. **Equality First, Range Second**: Always position equality columns (\`=\`) before range columns (\`>\`, \`<\`, \`BETWEEN\`).
2. **Covering Indexes (\`INCLUDE\`)**: Add secondary projection columns to the \`INCLUDE\` clause to eliminate expensive table heap lookups.
3. **Partial Indexes**: For skewed data (e.g. active jobs representing only 3% of the table), use \`WHERE status != 'archived'\` to save 90%+ index RAM.`;
  }

  if (lower.includes('pitch') || lower.includes('launch') || lower.includes('announcement') || lower.includes('copy') || lower.includes('email')) {
    return `### Product Launch Announcement

**Subject**: Introducing Gemini Studio: The Intelligent Developer Workspace

Hello Team,

Today, we are thrilled to announce **Gemini Studio**, built to accelerate your engineering workflow from prompt to production.

#### What’s New:
1. **Instant Context Processing**: Native multimodal support for code snippets, database schemas, and architectural diagrams.
2. **Deterministic Code Generation**: High-precision reasoning optimized for TypeScript, Python, and SQL queries.
3. **Low-Latency Streaming**: Token-by-token real-time output designed for high-focus development sessions.

Start exploring today and let us know your thoughts in our community channel!

Best regards,  
The Gemini Studio Team`;
  }

  if (lower.includes('kese ho') || lower.includes('kaise ho') || lower.includes('how are you')) {
    return `Main theek hoon! (I am doing well!)

Please note: **The AI model is not implemented yet**. This is a frontend UI prototype for the **Build with Gemini — AI Chatbot Challenge**. You can test features like prompt suggestions, code blocks, copy actions, conversation history, and the dark theme interface.`;
  }

  if (lower === 'hi' || lower === 'hello' || lower === 'hey') {
    return `Hello! Welcome to **Gemini Chat Studio**.

Please note: **The AI model is not implemented yet**. This is a frontend UI prototype for the **Build with Gemini — AI Chatbot Challenge**. Feel free to explore the suggested prompts to see how formatted responses, code highlighting, and conversation history work!`;
  }

  return `**Model is not implemented yet.**

This is a frontend UI prototype for the **Build with Gemini — AI Chatbot Challenge**.

You can explore the interface features:
- **Suggested Prompts**: Click any card on the welcome screen (e.g., *Debounce with TypeScript*, *Monolith vs Microservices*, or *PostgreSQL Index Optimization*) to view formatted markdown and code blocks.
- **Interactive UI**: Test conversation history, search, dark theme, code block copying, and message editing.`;
};
