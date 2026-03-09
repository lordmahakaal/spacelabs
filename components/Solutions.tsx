import { motion } from "framer-motion"

export default function Solutions() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-20 overflow-y-auto h-full">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold mb-8"
      >
        Solutions
      </motion.h2>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid md:grid-cols-2 gap-8"
      >
        <div className="bg-white/5 p-6 rounded-lg hover:bg-white/10 transition-colors">
          <h3 className="text-2xl font-bold mb-4">ScrapeGoat AI</h3>
          <p className="text-gray-300 mb-4">
            A powerful multi-agent, multi-modal AI platform available at <a href="https://scrapegoat.pro" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">scrapegoat.pro</a>. Features include:
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>Personal assistant capabilities</li>
            <li>Web scraping and data analysis</li>
            <li>Image and video generation</li>
            <li>Music generation and audio processing</li>
            <li>Coding assistance and research</li>
            <li>Advanced analysis capabilities</li>
            <li>Support for 15+ languages</li>
          </ul>
        </div>
        <div className="bg-white/5 p-6 rounded-lg hover:bg-white/10 transition-colors">
          <h3 className="text-2xl font-bold mb-4">ExCoder</h3>
          <p className="text-gray-300 mb-4">
            An intelligent code generation and development platform available at <a href="https://excoder.pro" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">excoder.pro</a>. Features include:
          </p>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            <li>AI-powered code generation and completion</li>
            <li>Multi-language programming support</li>
            <li>Intelligent debugging and optimization</li>
            <li>Developer productivity enhancement</li>
          </ul>
        </div>
        <div className="bg-white/5 p-6 rounded-lg hover:bg-white/10 transition-colors">
          <h3 className="text-2xl font-bold mb-4">Inference-as-a-Service</h3>
          <p className="text-gray-300 mb-4">
            On-demand access to AI models for various applications, leveraging open-source models from HuggingFace,
            Meta, and Mixtral.
          </p>
        </div>
        <div className="bg-white/5 p-6 rounded-lg hover:bg-white/10 transition-colors">
          <h3 className="text-2xl font-bold mb-4">Model Fine-Tuning</h3>
          <p className="text-gray-300 mb-4">
            Customization of models for specific industry needs, ensuring optimal performance for your unique use cases.
          </p>
        </div>
        <div className="bg-white/5 p-6 rounded-lg hover:bg-white/10 transition-colors">
          <h3 className="text-2xl font-bold mb-4">Training Dataset Services</h3>
          <p className="text-gray-300 mb-4">
            High-quality datasets for model training and validation, tailored to your specific requirements.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
