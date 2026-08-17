import { useState } from "react";
import { Link } from "react-router-dom";

const profileImages = ["/images/image01.png", "/images/image02.png"];

export default function About() {
  const [imageIndex, setImageIndex] = useState(0);

  const prevImage = () =>
    setImageIndex((i) => (i - 1 + profileImages.length) % profileImages.length);
  const nextImage = () => setImageIndex((i) => (i + 1) % profileImages.length);

  return (
    <main className="pt-[72px] bg-[#f7f8fc] text-gray-950">
      {/* Hero */}
      <section className="relative min-h-[560px] md:min-h-[680px] flex items-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1600&q=80"
          alt="Modern performance sneaker"
          className="absolute inset-0 h-full w-full object-cover grayscale opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#eef1f6] via-[#eef1f6]/85 to-[#eef1f6]/20" />

        <div className="relative max-w-7xl mx-auto w-full px-6 py-20">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-widest text-orange-600">
              Our Legacy
            </p>
            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight uppercase">
              Redesigning the <br />
              <span className="text-transparent [-webkit-text-stroke:1px_#f97316]">Movement</span>{" "}
              of <br />
              Tomorrow.
            </h1>
            <p className="mt-6 max-w-xl text-sm md:text-base text-gray-700 leading-7">
              SoleStyle was founded on a singular obsession: that high-performance engineering
              should sacrifice aesthetic soul. We craft footwear's future by honoring form.
            </p>
            <a
              href="#craft"
              className="mt-8 inline-flex bg-orange-600 px-6 py-3 text-xs font-bold uppercase tracking-wide text-white hover:bg-red-600"
            >
              Explore Our Craft
            </a>
          </div>
        </div>
      </section>

      {/* Story */}
      <section id="craft" className="bg-[#f7f8fc] py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-extrabold leading-tight">
              From a Single Stitch <br />
              to a Global Standard.
            </h2>
            <div className="mt-5 h-1 w-24 bg-orange-600" />
            <p className="mt-8 text-sm text-gray-600 leading-7">
              In 2014, in a small studio in Milan, SoleStyle began as a bespoke experiment. Our
              founders, engineers by trade and designers by heart, saw a gap in the market where
              technology met the catwalk. They sought to create a shoe that could survive a
              marathon and command a room.
            </p>
            <p className="mt-5 text-sm text-gray-600 leading-7">
              Today, SoleStyle stands at the pinnacle of luxury footwear. Every curve is
              calculated, every material is sourced for longevity, and every color is chosen to
              make a statement. We do not just sell shoes; we sell the confidence of a perfect
              step.
            </p>
          </div>

          <div className="relative lg:justify-self-end">
            <img
              src="https://images.unsplash.com/photo-1511556820780-d912e42b4980?auto=format&fit=crop&w=900&q=80"
              alt="Artisan working on a shoe"
              className="w-full max-w-lg aspect-[4/5] object-cover grayscale"
            />
            <div className="absolute -bottom-8 -left-8 bg-orange-700 px-8 py-5 text-white">
              <p className="text-3xl font-extrabold">10</p>
              <p className="text-[11px] font-bold uppercase tracking-wide">Years of Excellence</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="bg-blue-50 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-orange-600">
              The Foundation
            </p>
            <h2 className="mt-2 text-3xl md:text-4xl font-extrabold">Our Core Pillars</h2>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <article className="border border-orange-100 bg-white p-8 text-center">
              <i className="fa-brands fa-angellist text-2xl text-orange-600" />
              <h3 className="mt-6 text-xl font-semibold">Sustainability</h3>
              <p className="mt-4 text-sm text-gray-600 leading-6">
                We believe in circular fashion. 90% of our materials are recycled or bio-based,
                ensuring every step you take leaves a smaller footprint on our planet.
              </p>
            </article>

            <article className="border border-orange-100 bg-white p-8 text-center">
              <i className="fa-solid fa-person-running text-2xl text-orange-600" />
              <h3 className="mt-6 text-xl font-semibold">Innovation</h3>
              <p className="mt-4 text-sm text-gray-600 leading-6">
                From carbon-fiber plates to AI-designed midsoles, we relentlessly pursue the
                technological edge that transforms performance into an art form.
              </p>
            </article>

            <article className="border border-orange-100 bg-white p-8 text-center">
              <i className="fa-solid fa-compass-drafting text-2xl text-orange-600" />
              <h3 className="mt-6 text-xl font-semibold">Styling</h3>
              <p className="mt-4 text-sm text-gray-600 leading-6">
                Athletic wear should transition seamlessly to the world of refined elegance. Every
                pair is as visually striking as it is functional.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="border-t border-orange-100 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-24 items-start">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-orange-600">
              The Architects
            </p>
            <h2 className="mt-4 text-3xl md:text-4xl font-extrabold leading-tight">
              Meet the Visionaries.
            </h2>
            <p className="mt-6 text-sm text-gray-600 leading-7">
              Our team brings together experts from aerospace engineering, high-fashion, and
              professional sports to challenge the status quo.
            </p>
            <p className="mt-5 text-sm text-gray-600 leading-7">
              Led by Khim Reaksmey, our frontend vision focuses on building clean, responsive, and
              user-friendly shopping experiences. Every page is shaped with careful attention to
              layout, color, product presentation, and simple navigation so customers can explore
              SoleStyle with confidence.
            </p>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border-l-4 border-orange-600 bg-white px-5 py-4 shadow-sm">
                <h3 className="text-sm font-bold">Creative Interface</h3>
                <p className="mt-2 text-xs text-gray-600 leading-6">
                  Designing modern pages that feel sharp, organized, and easy to use on every
                  screen.
                </p>
              </div>
              <div className="border-l-4 border-orange-600 bg-white px-5 py-4 shadow-sm">
                <h3 className="text-sm font-bold">Frontend Quality</h3>
                <p className="mt-2 text-xs text-gray-600 leading-6">
                  Turning ideas into polished React, Tailwind CSS, and interactive web
                  experiences.
                </p>
              </div>
            </div>
          </div>

          <div>
            <article className="max-w-xl">
              <div className="relative">
                <img
                  src={profileImages[imageIndex]}
                  alt="Khim Reaksmey"
                  className="h-[450px] mx-auto w-full object-cover"
                />
                <button
                  type="button"
                  onClick={prevImage}
                  aria-label="Previous image"
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-gray-100 text-orange-700 shadow-md hover:bg-orange-600 hover:text-white"
                >
                  <i className="fa-solid fa-arrow-left" />
                </button>
                <button
                  type="button"
                  onClick={nextImage}
                  aria-label="Next image"
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 bg-gray-100 text-orange-700 shadow-md hover:bg-orange-600 hover:text-white"
                >
                  <i className="fa-solid fa-arrow-right" />
                </button>
              </div>
              <div className="text-center">
                <h3 className="mt-4 text-lg font-bold">Khim Reaksmey</h3>
                <p className="text-md uppercase tracking-wide text-orange-600">
                  Frontend Developer
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-orange-700 py-16 md:py-20 text-center text-white">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-extrabold leading-tight">
            Ready to define your <br /> own path?
          </h2>
          <p className="mt-5 text-sm text-orange-50">
            Join our community of visionaries and experience the perfect fusion of tech and
            style.
          </p>
          <Link
            to="/services"
            className="mt-8 inline-flex border border-white bg-white px-9 py-3 text-xs font-bold uppercase tracking-wide text-orange-700 hover:bg-transparent hover:text-white"
          >
            Shop the Collection
          </Link>
        </div>
      </section>
    </main>
  );
}
