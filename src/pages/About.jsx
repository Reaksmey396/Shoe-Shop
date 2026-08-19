import { useState } from "react";
import { Link } from "react-router-dom";

const profileImages = [
  `${import.meta.env.BASE_URL}images/image01.jpg`,
  `${import.meta.env.BASE_URL}images/image02.jpg`,
  `${import.meta.env.BASE_URL}images/image03.png`,
  `${import.meta.env.BASE_URL}images/image04.png`,
];

export default function About() {
  const [imageIndex, setImageIndex] = useState(0);

  const prevImage = () => {
    setImageIndex((current) => {
      if (current === 0) {
        return profileImages.length - 1;
      }

      return current - 1;
    });
  };

  const nextImage = () => {
    setImageIndex((current) => {
      if (current === profileImages.length - 1) {
        return 0;
      }

      return current + 1;
    });
  };

  return (
    <main className="bg-[#f7f8fc] pt-[72px] text-gray-950">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative flex min-h-[560px] items-center overflow-hidden md:min-h-[680px]">

        <img
          src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1600&q=80"
          alt="Modern performance sneaker"
          className="absolute inset-0 h-full w-full object-cover grayscale opacity-70"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#eef1f6] via-[#eef1f6]/90 to-[#eef1f6]/20" />

        <div className="relative mx-auto w-full max-w-7xl px-6 py-20 sm:px-8">

          <div className="max-w-3xl">

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
              Our Legacy
            </p>

            <h1 className="mt-5 text-4xl font-extrabold uppercase leading-tight sm:text-5xl lg:text-6xl">
              Redesigning the
              <br />

              <span className="text-transparent [-webkit-text-stroke:1px_#f97316]">
                Movement
              </span>{" "}

              of
              <br />

              Tomorrow.
            </h1>

            <p className="mt-6 max-w-xl text-sm leading-7 text-gray-700 md:text-base">
              SoleStyle was founded on a singular obsession: that
              high-performance engineering should never sacrifice aesthetic
              soul. We craft footwear's future by honoring form.
            </p>

            <a
              href="#craft"
              className="mt-8 inline-flex bg-orange-600 px-6 py-3 text-xs font-bold uppercase tracking-wide text-white transition hover:bg-red-600"
            >
              Explore Our Craft
            </a>

          </div>

        </div>

      </section>


      {/* =====================================================
          STORY
      ===================================================== */}

      <section
        id="craft"
        className="bg-[#f7f8fc] py-16 md:py-24"
      >

        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 sm:px-8 lg:grid-cols-2 lg:gap-20">

          <div>

            <h2 className="text-3xl font-extrabold leading-tight md:text-4xl">
              From a Single Stitch
              <br />
              to a Global Standard.
            </h2>

            <div className="mt-5 h-1 w-24 bg-orange-600" />

            <p className="mt-8 text-sm leading-7 text-gray-600">
              In 2014, in a small studio in Milan, SoleStyle began as a
              bespoke experiment. Our founders, engineers by trade and
              designers by heart, saw a gap in the market where technology
              met the catwalk. They sought to create a shoe that could
              survive a marathon and command a room.
            </p>

            <p className="mt-5 text-sm leading-7 text-gray-600">
              Today, SoleStyle stands at the pinnacle of luxury footwear.
              Every curve is calculated, every material is sourced for
              longevity, and every color is chosen to make a statement.
              We do not just sell shoes; we sell the confidence of a
              perfect step.
            </p>

          </div>


          <div className="relative lg:justify-self-end">

            <img
              src="https://images.unsplash.com/photo-1511556820780-d912e42b4980?auto=format&fit=crop&w=900&q=80"
              alt="Artisan working on a shoe"
              className="aspect-[4/5] w-full max-w-lg object-cover grayscale"
            />

            <div className="absolute -bottom-8 -left-2 bg-orange-700 px-7 py-5 text-white sm:-left-8">

              <p className="text-3xl font-extrabold">
                10
              </p>

              <p className="text-[11px] font-bold uppercase tracking-wide">
                Years of Excellence
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          CORE PILLARS
      ===================================================== */}

      <section className="bg-blue-50 py-16 md:py-20">

        <div className="mx-auto max-w-7xl px-6 sm:px-8">

          <div className="text-center">

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
              The Foundation
            </p>

            <h2 className="mt-2 text-3xl font-extrabold md:text-4xl">
              Our Core Pillars
            </h2>

          </div>


          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">

            {/* Sustainability */}

            <article className="border border-orange-100 bg-white p-8 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md">

              <i className="fa-brands fa-angellist text-2xl text-orange-600" />

              <h3 className="mt-6 text-xl font-semibold">
                Sustainability
              </h3>

              <p className="mt-4 text-sm leading-6 text-gray-600">
                We believe in circular fashion. 90% of our materials are
                recycled or bio-based, ensuring every step you take leaves
                a smaller footprint on our planet.
              </p>

            </article>


            {/* Innovation */}

            <article className="border border-orange-100 bg-white p-8 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md">

              <i className="fa-solid fa-person-running text-2xl text-orange-600" />

              <h3 className="mt-6 text-xl font-semibold">
                Innovation
              </h3>

              <p className="mt-4 text-sm leading-6 text-gray-600">
                From carbon-fiber plates to AI-designed midsoles, we
                relentlessly pursue the technological edge that transforms
                performance into an art form.
              </p>

            </article>


            {/* Styling */}

            <article className="border border-orange-100 bg-white p-8 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md">

              <i className="fa-solid fa-compass-drafting text-2xl text-orange-600" />

              <h3 className="mt-6 text-xl font-semibold">
                Styling
              </h3>

              <p className="mt-4 text-sm leading-6 text-gray-600">
                Athletic wear should transition seamlessly to the world of
                refined elegance. Every pair is as visually striking as it
                is functional.
              </p>

            </article>

          </div>

        </div>

      </section>


      {/* =====================================================
          TEAM
      ===================================================== */}

      <section className="border-t border-orange-100 bg-[#f7f8fc] py-16 md:py-20">

        <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-12 px-6 sm:px-8 lg:grid-cols-2 lg:gap-24">

          {/* =================================================
              LEFT SIDE
          ================================================= */}

          <div>

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
              The Architects
            </p>

            <h2 className="mt-4 text-3xl font-extrabold leading-tight md:text-4xl">
              Meet the Visionaries.
            </h2>

            <p className="mt-6 text-sm leading-7 text-gray-600">
              Our team brings together experts from aerospace engineering,
              high-fashion, and professional sports to challenge the
              status quo.
            </p>

            <p className="mt-5 text-sm leading-7 text-gray-600">
              Led by Khim Reaksmey, our frontend vision focuses on building
              clean, responsive, and user-friendly shopping experiences.
              Every page is shaped with careful attention to layout,
              color, product presentation, and simple navigation so
              customers can explore SoleStyle with confidence.
            </p>


            {/* =================================================
                SKILLS
            ================================================= */}

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">

              <div className="border-l-4 border-orange-600 bg-white px-5 py-4 shadow-sm">

                <h3 className="text-sm font-bold">
                  Creative Interface
                </h3>

                <p className="mt-2 text-xs leading-6 text-gray-600">
                  Designing modern pages that feel sharp, organized,
                  and easy to use on every screen.
                </p>

              </div>


              <div className="border-l-4 border-orange-600 bg-white px-5 py-4 shadow-sm">

                <h3 className="text-sm font-bold">
                  Frontend Quality
                </h3>

                <p className="mt-2 text-xs leading-6 text-gray-600">
                  Turning ideas into polished React, Tailwind CSS,
                  and interactive web experiences.
                </p>

              </div>

            </div>

          </div>


          {/* =================================================
              RIGHT SIDE - IMAGE SLIDER
          ================================================= */}

          <div className="w-full">

            <article className="mx-auto w-full max-w-xl">

              {/* IMAGE */}

              <div className="relative overflow-hidden bg-gray-100">

                <img
                  src={profileImages[imageIndex]}
                  alt={`Khim Reaksmey ${imageIndex + 1}`}
                  className="h-[420px] w-full object-cover object-center sm:h-[500px]"
                  onError={(event) => {
                    console.error(
                      "Image failed to load:",
                      event.currentTarget.src
                    );
                  }}
                />


                {/* LEFT ARROW */}

                <button
                  type="button"
                  onClick={prevImage}
                  aria-label="Previous image"
                  className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center bg-white text-orange-700 shadow-md transition hover:bg-orange-600 hover:text-white sm:left-5"
                >
                  <i className="fa-solid fa-arrow-left text-sm" />
                </button>


                {/* RIGHT ARROW */}

                <button
                  type="button"
                  onClick={nextImage}
                  aria-label="Next image"
                  className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center bg-white text-orange-700 shadow-md transition hover:bg-orange-600 hover:text-white sm:right-5"
                >
                  <i className="fa-solid fa-arrow-right text-sm" />
                </button>


                {/* IMAGE DOTS */}

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2">

                  <div className="flex items-center gap-2 rounded-full bg-black/50 px-3 py-2 backdrop-blur-sm">

                    {profileImages.map((_, index) => (

                      <button
                        key={index}
                        type="button"
                        onClick={() => setImageIndex(index)}
                        aria-label={`Show image ${index + 1}`}
                        className={`h-2.5 w-2.5 rounded-full transition ${
                          imageIndex === index
                            ? "bg-orange-500"
                            : "bg-white/70 hover:bg-white"
                        }`}
                      />

                    ))}

                  </div>

                </div>

              </div>


              {/* PROFILE INFORMATION */}

              <div className="text-center">

                <h3 className="mt-5 text-xl font-bold">
                  Khim Reaksmey
                </h3>

                <p className="mt-1 text-sm uppercase tracking-[0.15em] text-orange-600">
                  Frontend Developer
                </p>

              </div>

            </article>

          </div>

        </div>

      </section>


      {/* =====================================================
          CTA
      ===================================================== */}

      <section className="bg-orange-700 py-16 text-center text-white md:py-20">

        <div className="mx-auto max-w-3xl px-6">

          <h2 className="text-3xl font-extrabold leading-tight md:text-4xl">
            Ready to define your
            <br />
            own path?
          </h2>

          <p className="mt-5 text-sm leading-6 text-orange-50">
            Join our community of visionaries and experience the perfect
            fusion of tech and style.
          </p>

          <Link
            to="/services"
            className="mt-8 inline-flex border border-white bg-white px-9 py-3 text-xs font-bold uppercase tracking-wide text-orange-700 transition hover:bg-transparent hover:text-white"
          >
            Shop the Collection
          </Link>

        </div>

      </section>

    </main>
  );
}