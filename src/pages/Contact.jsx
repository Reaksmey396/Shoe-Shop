import { useState } from "react";
import emailjs from "@emailjs/browser";

const initialForm = {
  name: "",
  email: "",
  subject: "Order Support",
  message: "",
};

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // ==========================================
  // HANDLE INPUT CHANGE
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // SEND MESSAGE TO EMAIL
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSent(false);
    setError("");
    setSending(true);

    try {
      await emailjs.send(
        "YOUR_SERVICE_ID",
        "YOUR_TEMPLATE_ID",
        {
          name: form.name,
          email: form.email,
          subject: form.subject,
          message: form.message,
          to_email: "khimreaksmey123@gmail.com",
        },
        "YOUR_PUBLIC_KEY"
      );

      setSent(true);
      setForm(initialForm);
    } catch (error) {
      console.error("Email sending error:", error);

      setError(
        "Sorry, your message could not be sent. Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  // ==========================================
  // OPEN TELEGRAM
  // ==========================================

  const startChat = () => {
    window.open(
      "https://t.me/khimreaksmey",
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <main className="pt-[72px] bg-[#f7f8fc] text-gray-950">

      {/* ==========================================
          HERO
      ========================================== */}

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          <div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
              Let's connect.
              <br />
              <span className="text-red-700">
                We're here for you.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-sm md:text-base leading-7 text-gray-600">
              Whether you have a question about our latest drops,
              need help with sizing, or just want to talk footwear,
              our team is ready to assist.
            </p>
          </div>

          <img
            src="https://i.pinimg.com/1200x/72/2e/db/722edb732de89035a45d0e761c3b7a47.jpg"
            alt="Minimal sneaker contact display"
            className="w-full aspect-[16/10] object-cover rounded-lg shadow-lg"
          />

        </div>
      </section>

      {/* ==========================================
          MESSAGE + STORE INFORMATION
      ========================================== */}

      <section className="pb-16 md:pb-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1.35fr_1fr] gap-10 lg:gap-16">

          {/* ==========================================
              CONTACT FORM
          ========================================== */}

          <form
            onSubmit={handleSubmit}
            className="border border-orange-100 bg-white p-6 md:p-10"
          >

            <h2 className="text-2xl md:text-3xl font-semibold">
              Send us a Message
            </h2>

            {/* SUCCESS MESSAGE */}

            {sent && (
              <div className="mt-4 text-sm font-medium text-green-700 bg-green-50 border border-green-200 px-4 py-3 rounded">
                Thanks! Your message has been sent successfully.
              </div>
            )}

            {/* ERROR MESSAGE */}

            {error && (
              <div className="mt-4 text-sm font-medium text-red-700 bg-red-50 border border-red-200 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* ==========================================
                NAME + EMAIL
            ========================================== */}

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-5">

              {/* NAME */}

              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide">
                  Full Name
                </span>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your name"
                  className="mt-2 w-full border border-orange-100 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500"
                />
              </label>

              {/* EMAIL */}

              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide">
                  Email Address
                </span>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  placeholder="email@example.com"
                  className="mt-2 w-full border border-orange-100 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500"
                />
              </label>

            </div>

            {/* ==========================================
                SUBJECT
            ========================================== */}

            <label className="mt-5 block">

              <span className="text-xs font-bold uppercase tracking-wide">
                Subject
              </span>

              <select
                name="subject"
                value={form.subject}
                onChange={handleChange}
                className="mt-2 w-full border border-orange-100 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500"
              >
                <option>Order Support</option>
                <option>Sizing Question</option>
                <option>Store Appointment</option>
                <option>Custom Project</option>
              </select>

            </label>

            {/* ==========================================
                MESSAGE
            ========================================== */}

            <label className="mt-5 block">

              <span className="text-xs font-bold uppercase tracking-wide">
                Your Message
              </span>

              <textarea
                rows={6}
                name="message"
                value={form.message}
                onChange={handleChange}
                required
                placeholder="How can we help?"
                className="mt-2 w-full resize-none border border-orange-100 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500"
              />

            </label>

            {/* ==========================================
                SEND BUTTON
            ========================================== */}

            <button
              type="submit"
              disabled={sending}
              className={`mt-7 px-8 py-3 text-xs font-bold uppercase tracking-wide text-white transition ${
                sending
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-orange-600 hover:bg-red-700"
              }`}
            >
              {sending ? "Sending..." : "Send Message"}

              {!sending && (
                <i className="fa-solid fa-arrow-right ml-2" />
              )}
            </button>

          </form>

          {/* ==========================================
              STORE INFORMATION
          ========================================== */}

          <div>

            <h2 className="text-2xl md:text-3xl font-semibold">
              Store Information
            </h2>

            <div className="mt-7 space-y-7">

              {/* LOCATION */}

              <div className="flex gap-5">

                <div className="h-11 w-11 shrink-0 rounded-full bg-blue-50 text-red-700 flex items-center justify-center">
                  <i className="fa-solid fa-location-dot" />
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wide">
                    Flagship Location
                  </h3>

                  <p className="mt-2 text-sm text-gray-600 leading-6">
                    Royal University of Phnom Penh
                    <br />
                    Phnom Penh, Cambodia
                  </p>
                </div>

              </div>

              {/* PHONE */}

              <div className="flex gap-5">

                <div className="h-11 w-11 shrink-0 rounded-full bg-blue-50 text-red-700 flex items-center justify-center">
                  <i className="fa-solid fa-phone" />
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wide">
                    Phone Support
                  </h3>

                  <p className="mt-2 text-sm text-gray-600 leading-6">
                    +1 (212) 555-0198
                    <br />
                    Mon-Fri: 9am - 6pm EST
                  </p>
                </div>

              </div>

              {/* EMAIL */}

              <div className="flex gap-5">

                <div className="h-11 w-11 shrink-0 rounded-full bg-blue-50 text-red-700 flex items-center justify-center">
                  <i className="fa-regular fa-envelope" />
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wide">
                    Email Us
                  </h3>

                  <p className="mt-2 text-sm text-gray-600 leading-6">
                    khimreaksmey123@gmail.com
                  </p>
                </div>

              </div>

            </div>

            {/* ==========================================
                TELEGRAM LIVE SUPPORT
            ========================================== */}

            <div className="mt-10 bg-gray-800 p-8 text-white">

              <h3 className="text-2xl font-extrabold">
                Live Support
              </h3>

              <p className="mt-4 text-sm leading-6 text-gray-200">
                Our experts are online and ready to chat with you
                right now for instant assistance.
              </p>

              <button
                type="button"
                onClick={startChat}
                className="mt-6 border border-white px-6 py-3 text-xs font-bold uppercase hover:bg-white hover:text-gray-800 transition"
              >
                <i className="fa-brands fa-telegram mr-2" />
                Start Chat
              </button>

            </div>

          </div>

        </div>
      </section>

      {/* ==========================================
          MAP
      ========================================== */}

      <section className="bg-blue-50 pt-16">

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 items-end pb-10">

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-red-700">
              Visit Us
            </p>

            <h2 className="mt-2 text-3xl md:text-4xl font-extrabold">
              Find our HQ
            </h2>
          </div>

          <p className="text-sm leading-7 text-gray-600 md:max-w-md md:justify-self-end">
            Located at the Royal University of Phnom Penh in
            Cambodia, our concept store is a hub for footwear
            innovation.
          </p>

        </div>

        <div className="relative h-[360px] md:h-[520px] bg-gray-950 overflow-hidden">

          <iframe
            title="Map to SoleStyle flagship location at Royal University of Phnom Penh, Cambodia"
            src="https://www.google.com/maps?q=Royal%20University%20of%20Phnom%20Penh%2C%20Cambodia&output=embed"
            className="h-full w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />

        </div>

      </section>

      {/* ==========================================
          RETAIL
      ========================================== */}

      <section className="py-16 md:py-24">

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          <div className="relative">

            <span className="absolute left-6 top-6 bg-gray-900 px-4 py-2 text-xs font-bold uppercase text-white">
              Flagship Store
            </span>

            <img
              src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80"
              alt="SoleStyle flagship store interior"
              className="w-full aspect-[4/3] object-cover"
            />

          </div>

          <div>

            <h2 className="text-4xl md:text-6xl font-extrabold leading-tight">
              The Future
              <br />
              of Retail.
            </h2>

            <p className="mt-8 text-sm leading-7 text-gray-600">
              Experience SoleStyle in person. Our flagship store
              features a custom tread-mill analysis lab, a coffee
              bar, and an exclusive gallery of archives dating back
              to the start of technical athletics.
            </p>

            <div className="mt-8 space-y-5">

              <div className="flex gap-4">

                <i className="fa-regular fa-circle-check mt-1 text-orange-600" />

                <div>

                  <h3 className="text-sm font-bold uppercase">
                    Custom Fitting Lab
                  </h3>

                  <p className="text-sm text-gray-600">
                    Advanced 3D foot scanning for the perfect fit.
                  </p>

                </div>

              </div>

              <div className="flex gap-4">

                <i className="fa-regular fa-circle-check mt-1 text-orange-600" />

                <div>

                  <h3 className="text-sm font-bold uppercase">
                    Archive Gallery
                  </h3>

                  <p className="text-sm text-gray-600">
                    A curated museum of iconic sneaker history.
                  </p>

                </div>

              </div>

            </div>

            <a
              href="#top"
              className="mt-10 inline-flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-red-700 hover:text-orange-600"
            >
              Book a Store Appointment
              <i className="fa-solid fa-arrow-right" />
            </a>

          </div>

        </div>

      </section>

    </main>
  );
}