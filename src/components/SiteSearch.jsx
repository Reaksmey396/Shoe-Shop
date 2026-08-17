import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { productSearchItems } from "../lib/data";

export default function SiteSearch({ className = "" }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", onClickOutside);
    return () => document.removeEventListener("click", onClickOutside);
  }, []);

  const matches = query.trim()
    ? productSearchItems
        .filter((item) =>
          `${item.name} ${item.category}`.toLowerCase().includes(query.trim().toLowerCase())
        )
        .slice(0, 6)
    : [];

  return (
    <div ref={wrapRef} className={`site-search relative ${className}`}>
      <input
        type="text"
        placeholder="Search your favorite Shoes..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        className="site-search-input w-full px-4 py-2 pr-10 outline-none focus:ring-2 focus:ring-red-100 bg-gray-100 border border-transparent focus:border-red-200 rounded-md"
      />
      <i className="fa-solid fa-magnifying-glass absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
      {open && query.trim() && (
        <div className="search-results absolute top-full left-0 mt-2 w-full bg-white border border-red-100 shadow-lg rounded-md overflow-hidden z-[70]">
          {matches.length ? (
            matches.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-3 hover:bg-red-50"
              >
                <span className="block text-sm font-bold text-gray-900">{item.name}</span>
                <span className="block text-xs text-gray-500">
                  {item.category}
                  {item.price ? ` - ${item.price}` : ""}
                </span>
              </Link>
            ))
          ) : (
            <p className="px-4 py-3 text-sm text-gray-500">No product found</p>
          )}
        </div>
      )}
    </div>
  );
}
