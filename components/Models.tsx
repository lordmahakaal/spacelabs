import { motion } from "framer-motion"

/**
 * Promotional models section.
 *
 * Figures come from the published model cards and configs:
 *   https://huggingface.co/scrapegoat/Scrapegoat-Tiny-Coder
 *   https://huggingface.co/scrapegoat/butterfly-tipping-point-50B
 *
 * No benchmark scores are shown because neither card publishes numeric results,
 * so any comparison table here would be invented. ScrapeGoat Pro Max and
 * ScrapeGoat SuperCoder are unreleased and carry no published specifications
 * beyond the sizes below.
 */

const HF_TINY_CODER = "https://huggingface.co/scrapegoat/Scrapegoat-Tiny-Coder"
const HF_BUTTERFLY = "https://huggingface.co/scrapegoat/butterfly-tipping-point-50B"
const GITHUB_BUTTERFLY = "https://github.com/scrapegoat/butterfly-tipping-point"

const card = "bg-white/5 p-6 rounded-lg hover:bg-white/10 transition-colors"

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-white/5 py-2 last:border-0">
      <dt className="text-sm text-gray-400 shrink-0">{label}</dt>
      <dd className="text-sm text-gray-200 text-right">{value}</dd>
    </div>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-wide text-gray-300">
      {children}
    </span>
  )
}

function LaunchingSoon({ name, params }: { name: string; params: string }) {
  return (
    <div className={`${card} border border-dashed border-white/15`}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 className="text-2xl font-bold">{name}</h3>
        <Badge>Launching soon</Badge>
      </div>
      <p className="text-gray-300 mb-4">{params}</p>
      <dl>
        <Spec label="Parameters" value={params.replace("T parameters", "T")} />
        <Spec label="Context window" value="1M tokens, extendible" />
        <Spec label="Status" value="In training" />
      </dl>
    </div>
  )
}

/**
 * The shared idea behind both released models, drawn inline rather than
 * hotlinking an image: two attention streams run in parallel at every layer and
 * a learned gate blends them per token.
 */
function DualTrackDiagram() {
  return (
    <svg
      viewBox="0 0 720 260"
      className="w-full h-auto"
      role="img"
      aria-label="Diagram: two parallel attention tracks, Track A and Track B, blended by a learned gate into a single output"
    >
      <defs>
        <linearGradient id="trackA" x1="0" x2="1">
          <stop offset="0%" stopColor="#00FF9D" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#00FF9D" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="trackB" x1="0" x2="1">
          <stop offset="0%" stopColor="#8B7BFF" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#8B7BFF" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      <text x="360" y="24" textAnchor="middle" fill="#9CA3AF" fontSize="13">
        Input tokens
      </text>
      <line x1="360" y1="32" x2="360" y2="52" stroke="#4B5563" strokeWidth="1.5" />

      <rect x="120" y="52" width="200" height="58" rx="8" fill="url(#trackA)" stroke="#00FF9D" strokeOpacity="0.5" />
      <text x="220" y="76" textAnchor="middle" fill="#00FF9D" fontSize="13" fontWeight="600">
        Track A
      </text>
      <text x="220" y="95" textAnchor="middle" fill="#9CA3AF" fontSize="11">
        Linear / recurrent
      </text>

      <rect x="400" y="52" width="200" height="58" rx="8" fill="url(#trackB)" stroke="#8B7BFF" strokeOpacity="0.5" />
      <text x="500" y="76" textAnchor="middle" fill="#8B7BFF" fontSize="13" fontWeight="600">
        Track B
      </text>
      <text x="500" y="95" textAnchor="middle" fill="#9CA3AF" fontSize="11">
        Full attention
      </text>

      <path d="M220 110 L220 140 L340 140 L340 158" fill="none" stroke="#00FF9D" strokeOpacity="0.4" strokeWidth="1.5" />
      <path d="M500 110 L500 140 L380 140 L380 158" fill="none" stroke="#8B7BFF" strokeOpacity="0.4" strokeWidth="1.5" />

      <rect x="270" y="158" width="180" height="48" rx="8" fill="#FFFFFF" fillOpacity="0.06" stroke="#FFFFFF" strokeOpacity="0.25" />
      <text x="360" y="178" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="600">
        Learned gate
      </text>
      <text x="360" y="194" textAnchor="middle" fill="#9CA3AF" fontSize="10">
        blends per token
      </text>

      <line x1="360" y1="206" x2="360" y2="228" stroke="#4B5563" strokeWidth="1.5" />
      <text x="360" y="248" textAnchor="middle" fill="#9CA3AF" fontSize="13">
        Output
      </text>

      <text x="220" y="248" textAnchor="middle" fill="#6B7280" fontSize="10">
        O(1) per token
      </text>
      <text x="500" y="248" textAnchor="middle" fill="#6B7280" fontSize="10">
        long-range context
      </text>
    </svg>
  )
}

export default function Models() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-10 md:py-16 overflow-y-auto h-full min-h-0 overscroll-contain">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold mb-8"
      >
        Models
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-8"
      >
        <div className={card}>
          <h3 className="text-2xl font-bold mb-4">Dual-Track Parallel Architecture</h3>
          <p className="text-gray-300 mb-6">
            Every model in the ScrapeGoat family runs two attention streams in parallel at each layer and blends
            them with a learned gate, the same way the corpus callosum connects the two hemispheres. Track A is
            linear or recurrent attention: fixed-size state, O(1) per token, fast for sequential and local
            context. Track B is full attention: quadratic, precise, for long-range reasoning across the whole
            context. The gate decides per token how much each track contributes, so the model can spend
            computation where it matters instead of paying full attention everywhere.
          </p>
          <DualTrackDiagram />
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className={card}>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h3 className="text-2xl font-bold">ScrapeGoat-Tiny-Coder</h3>
              <Badge>Available</Badge>
            </div>
            <p className="text-gray-300 mb-4">
              Our sparse dual-track MoE for code and agentic work. Track A runs KDA, a recurrent attention with
              diagonal gating derived from Kimi Delta Attention, tuned for state-aware code generation. Track B
              runs grouped-query attention for holistic system design. 81 layers, a 262K context window, and 704
              experts with 8 active per token, routed by a hyperparameter-free Quantile Balancing algorithm that
              equalises expert load without an auxiliary loss. A Mixture-of-Memories layer keeps four memory
              states with learned routing, two active per token.
            </p>
            <dl className="mb-4">
              <Spec label="Parameters" value="~825B total, sparse MoE" />
              <Spec label="Layers" value="81" />
              <Spec label="Track A" value="KDA, 32 heads, 512 experts" />
              <Spec label="Track B" value="GQA, 64 heads, 192 experts" />
              <Spec label="Experts per token" value="8 of 704" />
              <Spec label="Context window" value="262,144 tokens" />
              <Spec label="Routing" value="Quantile Balancing, Mixture-of-Memories" />
              <Spec label="Tokenizer" value="248,320 token tiktoken BPE" />
              <Spec label="License" value="Apache 2.0" />
            </dl>
            <a
              href={HF_TINY_CODER}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              Model card on Hugging Face &rarr;
            </a>
          </div>

          <div className={card}>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h3 className="text-2xl font-bold">Butterfly Tipping Point 50B</h3>
              <Badge>Available</Badge>
            </div>
            <p className="text-gray-300 mb-4">
              The dense 50B member of the family, and the clearest statement of the architecture. Track A, the
              Butterfly Effect, is a Gated DeltaNet: linear-complexity recurrent attention with a fixed-size
              state per head, so streaming context costs no KV cache growth. Track B, the Tipping Point, is full
              grouped-query attention with a 6:1 query-to-KV ratio. Both tracks run at every layer on a 3:1
              alternation, 48 linear layers and 16 full-attention layers. The inter-track gate is initialised
              with quantile balancing, which keeps both tracks contributing roughly 35 to 65 percent instead of
              collapsing to hard all-A or all-B routing. Served in FP8 on SGLang behind an OpenAI-compatible API.
            </p>
            <dl className="mb-4">
              <Spec label="Parameters" value="~50B" />
              <Spec label="Layers" value="64" />
              <Spec label="Track A" value="Gated DeltaNet, 16 key / 48 value heads" />
              <Spec label="Track B" value="GQA, 24 heads, 4 KV heads" />
              <Spec label="Layer mix" value="48 linear + 16 full attention" />
              <Spec label="Context window" value="262,144 tokens" />
              <Spec label="Serving" value="FP8 on SGLang, OpenAI-compatible" />
              <Spec label="License" value="Apache 2.0" />
            </dl>
            <div className="flex flex-wrap gap-4">
              <a
                href={HF_BUTTERFLY}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300"
              >
                Model card &rarr;
              </a>
              <a
                href={GITHUB_BUTTERFLY}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300"
              >
                Reference implementation &rarr;
              </a>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <LaunchingSoon name="ScrapeGoat Pro Max" params="2.8T parameters" />
          <LaunchingSoon name="ScrapeGoat SuperCoder" params="4.4T parameters" />
        </div>

        <div className={card}>
          <h3 className="text-2xl font-bold mb-4">Training the next generation</h3>
          <p className="text-gray-300 mb-4">
            ScrapeGoat Pro Max and ScrapeGoat SuperCoder extend the context window to 1M tokens, with room to go
            further. The training and compute required at that scale is the largest we have attempted, and we are
            looking for investors who want to see frontier open models stay open and reachable. If that is you,
            get in touch.
          </p>
          <a href="mailto:connect@spacelabs.pro" className="text-blue-400 hover:text-blue-300">
            connect@spacelabs.pro &rarr;
          </a>
        </div>

        <p className="text-sm text-gray-500">
          Model architecture and specifications are published under Apache 2.0. No benchmark scores are listed
          here because none have been published for these models yet.
        </p>
      </motion.div>
    </div>
  )
}
