import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <h1 className="text-3xl font-bold text-red-700 mb-5">SoleStyle</h1>
          <p className="text-gray-700 text-sm leading-6 mb-5 max-w-xs">
            Defining the future of footwear through premium design and athletic excellence.
          </p>
          <div className="flex gap-5 text-gray-800 text-lg">
            <i className="fa-solid fa-globe hover:text-red-600 cursor-pointer" />
            <i className="fa-solid fa-at hover:text-red-600 cursor-pointer" />
            <i className="fa-solid fa-share-nodes hover:text-red-600 cursor-pointer" />
          </div>
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase mb-5 text-gray-900">Quick Links</h2>
          <ul className="space-y-3 text-sm text-gray-700">
            <li>
              <Link to="/" className="hover:text-red-600">Home</Link>
            </li>
            <li>
              <Link to="/services" className="hover:text-red-600">Shop</Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-red-600">About</Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-red-600">Contact</Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase mb-5 text-gray-900">Categories</h2>
          <ul className="space-y-3 text-sm text-gray-700">
            <li>
              <Link to="/services" className="hover:text-red-600">Men's Sneakers</Link>
            </li>
            <li>
              <Link to="/services" className="hover:text-red-600">Women's Collection</Link>
            </li>
            <li>
              <Link to="/services" className="hover:text-red-600">Performance Run</Link>
            </li>
            <li>
              <Link to="/services" className="hover:text-red-600">Lifestyle Classics</Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase mb-5 text-gray-900">Customer Support</h2>
          <ul className="space-y-3 text-sm text-gray-700">
            <li>
              <Link to="/contact" className="hover:text-red-600">Privacy Policy</Link>
            </li>
            <li>
              <Link to="/services" className="hover:text-red-600">Terms of Service</Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-red-600">Shipping &amp; Returns</Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-red-600">FAQ</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-red-200 py-5 text-center px-4">
        <p className="text-sm text-gray-700">&copy; 2024 SoleStyle. All rights reserved.</p>
      </div>
    </footer>
  );
}
