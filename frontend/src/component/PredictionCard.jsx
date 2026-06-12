const PredictionCard = ({ item }) => {
  return (
    <div className="bg-slate-800 p-5 rounded-xl shadow-lg">
      <h2 className="text-xl font-bold text-cyan-400">
        #{item.rank} {item.disease}
      </h2>

      <p className="mt-2">
        Probability:
        <span className="text-green-400 ml-2">
          {item.probability}%
        </span>
      </p>

      <p className="mt-1">
        Confidence:
        <span className="text-yellow-400 ml-2">
          {item.confidence}
        </span>
      </p>
    </div>
  )
}

export default PredictionCard