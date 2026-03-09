import { motion } from "framer-motion"

export default function Industries() {
  const industries = [
    {
      title: "Healthcare",
      description: "Predictive analytics, medical imaging diagnostics, patient monitoring systems, drug discovery acceleration",
    },
    {
      title: "Education",
      description: "Personalized learning systems, automated content creation, NLP-based tutoring, skill assessment and development",
    },
    {
      title: "Agriculture",
      description: "AI-driven pest detection, crop monitoring, yield predictions, precision farming solutions",
    },
    {
      title: "Governance",
      description: "Citizen service automation, fraud detection, large-scale data analytics, policy optimization",
    },
    {
      title: "Finance",
      description: "Risk assessment, algorithmic trading, fraud detection, personalized financial advisory",
    },
    {
      title: "Manufacturing",
      description: "Predictive maintenance, quality control automation, supply chain optimization, production forecasting",
    },
    {
      title: "Retail & E-commerce",
      description: "Recommendation engines, customer behavior analysis, inventory management, demand forecasting",
    },
    {
      title: "Media & Entertainment",
      description: "Content creation, personalized recommendations, sentiment analysis, automated content moderation",
    },
  ]

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-20 overflow-y-auto h-full">
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold mb-4"
      >
        Industries
      </motion.h2>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white/5 p-6 rounded-lg mb-12"
      >
        <h3 className="text-2xl font-bold mb-4">Solving the Inference Crisis with Renewable Resources</h3>
        <p className="text-gray-300 leading-relaxed">
          The explosive growth of AI inference is creating an unprecedented energy crisis. Traditional data centers consume massive amounts of electricity, contributing significantly to carbon emissions. At Spacelabs, we're committed to revolutionizing this reality by transitioning all inference operations to renewable energy sources including solar, wind, and hydroelectric power. Our infrastructure is designed with green computing principles, ensuring that every inference request is processed sustainably without compromising performance. By combining cutting-edge AI technology with renewable energy, we're proving that advanced AI and environmental responsibility are not mutually exclusive—they're complementary.
        </p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid md:grid-cols-2 gap-8"
      >
        {industries.map((industry, index) => (
          <div key={industry.title} className="bg-white/5 p-6 rounded-lg hover:bg-white/10 transition-colors">
            <h3 className="text-2xl font-bold mb-4">{industry.title}</h3>
            <p className="text-gray-300">{industry.description}</p>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
