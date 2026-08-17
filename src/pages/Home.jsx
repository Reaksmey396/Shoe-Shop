import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();
  return (
    <main className="pt-[12px]">
      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-50 via-white to-blue-100">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
        {user && (
          <div className="mb-4">
            <p className="text-2xl font-semibold text-orange-600">
              Hi, {user.displayName || "there"} 👋
            </p>
          </div>
        )}
            <span className="inline-block bg-gray-900 text-white text-xs px-3 py-1 font-bold rounded-sm">
              Shoes into your Style
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-extrabold mt-6 text-gray-900 leading-tight">
              THE NEW ERA <br />
              OF KINETIC
            </h1>
            <p className="mt-6 text-gray-600 max-w-md">
              Engineered for the elite. Designed for the streets. Experience the perfect fusion
              of technical performance and high-fashion aesthetics.
            </p>
            <div className="mt-8 flex text-center flex-col sm:flex-row gap-4">
              <Link
                to="/services"
                className="bg-orange-600 text-white px-6 py-3 font-bold text-sm rounded-md hover:bg-orange-700"
              >
                SHOP NEW ARRIVALS
              </Link>
              <Link
                to="/contact"
                className="border border-gray-900 px-6 py-3 font-bold text-sm rounded-md hover:bg-gray-900 hover:text-white"
              >
                Contact Us
              </Link>
            </div>
          </div>

          <div className="lg:flex justify-center">
            <img
              src="https://i.pinimg.com/736x/f8/a7/2d/f8a72d8e197f4bf3dfb65a2e1e9fc076.jpg"
              alt="Red athletic shoe"
              className="w-full max-w-xl aspect-[4/3] object-cover rounded-lg shadow-2xl hover:scale-[1.02] transition duration-500"
            />
          </div>
        </div>
      </section>

      {/* Featured Collection */}
      <section className="bg-gray-50 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-extrabold">Featured Collection</h2>
              <p className="text-gray-500 mt-2">
                Curated selection of our most innovative designs.
              </p>
            </div>
            <Link to="/services" className="text-orange-600 text-sm font-bold hover:underline">
              Explore All
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white shadow-md rounded-lg overflow-hidden">
              <div className="relative">
                <span className="absolute top-4 left-4 bg-orange-600 text-white text-xs px-3 py-1 font-bold rounded-sm">
                  PREMIUM
                </span>
                <img
                  src="https://i.pinimg.com/1200x/18/04/e2/1804e2725910144b0ff2baff0b7d6815.jpg"
                  alt="Cloud Runner Pro-X"
                  className="w-full h-80 md:h-[500px] object-cover"
                />
              </div>
              <div className="p-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold">Cloud Runner Pro-X</h3>
                  <p className="text-gray-500">Ultimate comfort for the urban explorer.</p>
                </div>
                <p className="text-orange-600 font-bold text-xl mt-3">$280.00</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <img
                  src="https://i.pinimg.com/736x/35/3a/ac/353aac3d4763ef4ff62d33018b467c39.jpg"
                  alt="Carbon Elite shoe"
                  className="w-full h-56 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-bold">Carbon Elite</h3>
                  <p className="text-orange-600 font-bold">$210.00</p>
                </div>
              </div>

              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <img
                  src="https://i.pinimg.com/736x/24/95/95/249595efbbf7d3ebfc29dd4d1f6472d0.jpg"
                  alt="Static Classic shoe"
                  className="w-full h-56 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-bold">Static Classic</h3>
                  <p className="text-orange-600 font-bold">$185.00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Now */}
      <section className="bg-blue-50 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center gap-4 mb-10">
            <h2 className="text-3xl md:text-4xl font-extrabold">Trending Now</h2>
            <div className="flex gap-3">
              <button className="w-10 h-10 rounded-full border border-gray-400 hover:bg-white" aria-label="Previous">
                &larr;
              </button>
              <button className="w-10 h-10 rounded-full border border-gray-400 hover:bg-white" aria-label="Next">
                &rarr;
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "RETRO CULTURE",
                desc: "Classic vibes, modern comfort",
                img: "https://images.unsplash.com/photo-1543508282-6319a3e2621f",
              },
              {
                title: "TECH-WEAR",
                desc: "Advanced performance gear",
                img: "https://i.pinimg.com/736x/e4/f4/f3/e4f4f3e1b027aa58a6fe6fadbf7ba3c3.jpg",
              },
              {
                title: "MINIMALIST EDIT",
                desc: "Essential simplicity",
                img: "https://i.pinimg.com/736x/9f/4e/78/9f4e78194b66f8c8803cdeb4bf093a04.jpg",
              },
              {
                title: "SPEED FUSION",
                desc: "Built for the podium",
                img: "https://i.pinimg.com/736x/ea/2a/de/ea2ade52f16f19a54418c2e749338848.jpg",
              },
            ].map((item) => (
              <div key={item.title} className="bg-white p-4 shadow-md rounded-lg">
                <img
                  src={item.img}
                  alt={`${item.title} shoe`}
                  className="w-full h-56 object-cover rounded-md"
                />
                <h3 className="font-bold mt-4">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quality Section */}
      <section className="bg-gray-50 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="grid grid-cols-2 gap-4 order-2 lg:order-1">
            <img
              src="https://images.unsplash.com/photo-1543163521-1bf539c55dd2"
              alt="White sneaker detail"
              className="h-72 md:h-96 w-full object-cover rounded-lg"
            />
            <img
              src="https://i.pinimg.com/736x/8a/8e/2a/8a8e2a3a372044a3dde6a9ced660f098.jpg"
              alt="Red sneaker detail"
              className="h-72 md:h-96 w-full object-cover mt-10 md:mt-12 rounded-lg"
            />
          </div>

          <div className="order-1 lg:order-2">
            <h2 className="text-3xl md:text-4xl font-extrabold leading-tight">
              Uncompromising <br />
              Quality &amp; Style
            </h2>
            <p className="text-gray-600 mt-6 leading-7">
              We believe footwear is the foundation of any wardrobe. Our shoes are designed to
              perform on the track and stand out on the street.
            </p>
            <div className="mt-8 space-y-6">
              <div className="flex gap-4">
                <div className="bg-orange-100 text-orange-600 p-3 rounded-md h-12 w-12 flex items-center justify-center">
                  <i className="fa-solid fa-leaf" />
                </div>
                <div>
                  <h3 className="font-bold">SUSTAINABLE SOURCING</h3>
                  <p className="text-gray-500 text-sm">
                    We use premium materials from responsible suppliers.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-orange-100 text-orange-600 p-3 rounded-md h-12 w-12 flex items-center justify-center">
                  <i className="fa-solid fa-bolt" />
                </div>
                <div>
                  <h3 className="font-bold">KINETIC ENGINEERING</h3>
                  <p className="text-gray-500 text-sm">
                    Our cushioning technology provides better energy return.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Subscribe */}
      <section className="bg-gray-900 py-16 md:py-20 text-center text-white px-6">
        <h2 className="text-3xl md:text-4xl font-extrabold">Stay Ahead of the Game</h2>
        <p className="text-gray-300 mt-4 max-w-2xl mx-auto">
          Join the SoleStyle community for early access to limited releases.
        </p>
        <form
          onSubmit={(e) => e.preventDefault()}
          className="mt-8 flex flex-col sm:flex-row justify-center max-w-xl mx-auto"
        >
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full px-5 py-3 bg-gray-800 border border-gray-600 outline-none focus:border-orange-500 rounded-t-md sm:rounded-l-md sm:rounded-tr-none"
          />
          <button className="bg-orange-600 px-6 py-3 font-bold hover:bg-red-600 rounded-b-md sm:rounded-r-md sm:rounded-bl-none">
            SUBSCRIBE NOW
          </button>
        </form>
      </section>
    </main>
  );
}
