import React from "react";

export default function Footer({ isDark = true }) {
  return (
    <footer
      className={`w-full mt-12 ${
        isDark ? "text-neutral-300" : "bg-white text-gray-700"
      }`}
      style={{ backgroundColor: isDark ? "#1a1a1a" : "#ffffff" }}
      aria-labelledby="footer-heading"
    >
      {/* full-width wrapper so footer spans entire viewport */}
      <div className="w-full px-6 py-12">
        {/* inner grid stretches across full width; adjust columns responsively */}
        <div className="w-full grid grid-cols-2 md:grid-cols-5 gap-30 max-w-none">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center mb-2">
              <img src="./images/logo.png" className={`w-8 filter transition duration-200 ${
                  isDark ? "" : "brightness-0"
                }`}
                alt="Name logo" />
              <div className="font-semibold text-lg flex text-center justify-center mt-2">
                CodeSeed
              </div>
            </div>

            <div className="ml-5 text-sm opacity-80">By Lucky</div>

            <div className="mt-6 flex gap-4 ml-2">
              <a href="#" aria-label="X" className="hover:opacity-80">
                <i className="fa-brands fa-x-twitter"></i>
              </a>
              <a href="#" aria-label="LinkedIn" className="hover:opacity-80">
                <i className="fa-brands fa-linkedin"></i>
              </a>
              <a href="#" aria-label="YouTube" className="hover:opacity-80">
                <i className="fa-brands fa-youtube"></i>
              </a>
              <a href="#" aria-label="Instagram" className="hover:opacity-80">
                <i className="fa-brands fa-instagram"></i>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">Products</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="hover:underline">
                  CodeSeed
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  CodeSeed Code
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Max plan
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Team plan
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Enterprise plan
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-3">Solutions</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="hover:underline">
                  AI agents
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Code modernization
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Coding
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Customer support
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-3">Learn</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="hover:underline">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Catalog
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Courses
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium mb-3">Help & security</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="hover:underline">
                  Availability
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Status
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  Support center
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t pt-6 text-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="opacity-80">
            © {new Date().getFullYear()} Lucky Patil
          </div>
          <div className="opacity-80">Terms · Privacy · Usage policy</div>
        </div>
      </div>
    </footer>
  );
}
