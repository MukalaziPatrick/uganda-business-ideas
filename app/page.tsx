export default function Home() {
  return (
    <main className="p-10 max-w-5xl mx-auto">
      <section className="mb-10">
        <h1 className="text-4xl font-bold">
          Find the Best Business Ideas in Uganda 🇺🇬
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Discover profitable business ideas based on your budget, skills, and goals.
        </p>
      </section>

      <section className="mb-10">
        <input
          type="text"
          placeholder="Search business ideas (e.g. farming, small capital...)"
          className="w-full p-4 border rounded-lg"
        />
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Featured Ideas</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 border rounded-lg">
            <h3 className="text-xl font-bold">Liquid Soap Business</h3>
            <p className="text-gray-600 mt-2">
              Start with low capital and supply homes, schools, and offices.
            </p>
          </div>

          <div className="p-5 border rounded-lg">
            <h3 className="text-xl font-bold">Poultry Farming</h3>
            <p className="text-gray-600 mt-2">
              High demand business with strong long-term profits.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}