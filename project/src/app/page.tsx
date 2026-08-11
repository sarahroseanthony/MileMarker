export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 py-12">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="text-5xl font-black tracking-tight text-white mb-3">
            Mile<span className="text-orange-500">Marker</span>
          </h1>
          <p className="text-gray-400 text-lg leading-snug">
            Track your per-mile split times in real-time while you run.
          </p>
        </div>

        <div className="w-full flex flex-col gap-4">
          <button
            className="w-full bg-orange-500 hover:bg-orange-400 active:bg-orange-600 text-white font-bold text-xl py-5 rounded-2xl min-h-[64px] transition-colors"
            disabled
          >
            Start Run
          </button>

          <button
            className="w-full bg-gray-800 hover:bg-gray-700 active:bg-gray-900 text-white font-semibold text-lg py-4 rounded-2xl min-h-[56px] transition-colors"
            disabled
          >
            History
          </button>
        </div>

        <p className="text-gray-600 text-sm text-center">
          Record a split every time you complete a mile. Review your pace after each run.
        </p>
      </div>
    </main>
  );
}
