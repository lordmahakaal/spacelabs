import { motion } from "framer-motion"

export default function Technology() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-20 overflow-y-auto h-full">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold mb-8"
      >
        Technology
      </motion.h2>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-8"
      >
        <div className="bg-white/5 p-6 rounded-lg hover:bg-white/10 transition-colors">
          <h3 className="text-2xl font-bold mb-4">AI Framework & Autonomous Agents</h3>
          <p className="text-gray-300 mb-4">
            Our proprietary AI Framework, 'ScrapeGoat AI Tools Orchestrator Super Intelligent Agent', provides cutting-edge capabilities comparable to and sometimes surpassing models like OpenAI's ChatGPT. ScrapeGoat is now fully autonomous, powered by autonomous agents and a sophisticated AI operating system that enables independent decision-making and task execution without human intervention.
          </p>
        </div>
        <div className="bg-white/5 p-6 rounded-lg hover:bg-white/10 transition-colors">
          <h3 className="text-2xl font-bold mb-4">Advanced Model Architecture</h3>
          <p className="text-gray-300 mb-4">
            Our platform features a massive 1 trillion (1T) parameter model with a groundbreaking 1 million context window, enabling unprecedented understanding and generation capabilities. Additionally, we offer ScrapeGoat-Tiny-Brain local models optimized to run on CPU, providing privacy-preserving inference without requiring expensive GPU infrastructure.
          </p>
        </div>
        <div className="bg-white/5 p-6 rounded-lg hover:bg-white/10 transition-colors">
          <h3 className="text-2xl font-bold mb-4">ExCoder AI Development Platform</h3>
          <p className="text-gray-300 mb-4">
            Our sister platform <a href="https://excoder.pro" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">ExCoder</a> leverages autonomous agents and advanced AI capabilities to revolutionize software development, enabling intelligent code generation, debugging, and optimization at scale.
          </p>
        </div>
        <div className="bg-white/5 p-6 rounded-lg hover:bg-white/10 transition-colors">
          <h3 className="text-2xl font-bold mb-4">Infrastructure</h3>
          <p className="text-gray-300 mb-4">
            Deployment of 40 high-performance GPU servers to ensure scalable and efficient AI processing. Our infrastructure supports both cloud-based inference for maximum performance and edge-computing local models for privacy and minimal latency.
          </p>
        </div>
        <div className="bg-white/5 p-6 rounded-lg hover:bg-white/10 transition-colors">
          <h3 className="text-2xl font-bold mb-4">Partnerships</h3>
          <p className="text-gray-300 mb-4">
            Collaborations with HuggingFace, Meta, and Mixtral for seamless model integration and cutting-edge AI capabilities. Our partnership ecosystem enables access to the latest open-source models and autonomous agent frameworks.
          </p>
        </div>
        <div className="bg-white/5 p-6 rounded-lg hover:bg-white/10 transition-colors">
          <h3 className="text-2xl font-bold mb-4">Language Support & Voice</h3>
          <p className="text-gray-300 mb-4">
            Our platform supports 8 local languages and 7 international languages, with voice-enabled human-like behavior powered by autonomous agents. Voice cloning capabilities enable personalized communication while maintaining the autonomy and intelligence of our system.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
