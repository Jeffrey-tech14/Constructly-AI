// src/components/PageFooter.tsx
import { motion } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  Linkedin,
  Twitter,
  Facebook,
  ShieldCheck,
  FileText,
  Server,
} from "lucide-react";

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
    .font-technical { font-family: 'Outfit', sans-serif; }
  `}</style>
);

const THEME = {
  NAVY: "#002d5c",
  LIGHT_BLUE: "#0077B6",
  TEXT_MAIN: "#1a1a1a",
  BG_FOOTER: "#fcfcfc",
  BORDER: "#d1d5db",
};

interface PageFooterProps {
  scrollTo: (section: string) => void;
}

const PageFooter = ({ scrollTo }: PageFooterProps) => {
  const links = [
    { label: "Features & Capabilities", id: "features" },
    { label: "Commercial Licensing", id: "pricing" },
    { label: "System Workflow", id: "how-it-works" },
    { label: "Project Reports", id: "testimonials" },
    { label: "Technical Documentation", id: "faq" },
  ];

  const JTechAILogo = () => (
    <svg
      width="135"
      height="36"
      viewBox="0 0 135 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mb-8"
    >
      <path d="M19.2857 11.25H12.8571V15.75H19.2857V11.25Z" fill={THEME.NAVY} />
      <path d="M19.2857 20.25H12.8571V24.75H19.2857V20.25Z" fill={THEME.NAVY} />
      <path d="M9.64286 6.75H25.7143V2.25H9.64286V6.75Z" fill={THEME.NAVY} />
      <path d="M9.64286 29.25H25.7143V24.75H9.64286V29.25Z" fill={THEME.NAVY} />
      <path d="M6.42857 11.25H0V24.75H6.42857V11.25Z" fill={THEME.NAVY} />
      <path d="M32.1429 11.25H25.7143V24.75H32.1429V11.25Z" fill={THEME.NAVY} />
      <path d="M38.5714 15.75H32.1429V20.25H38.5714V15.75Z" fill={THEME.NAVY} />
      <circle cx="22.5" cy="13.5" r="2.25" fill={THEME.LIGHT_BLUE} />
      <circle cx="22.5" cy="22.5" r="2.25" fill={THEME.LIGHT_BLUE} />
      <path d="M22.5 15.75V20.25" stroke={THEME.LIGHT_BLUE} strokeWidth="1.5" />
      <text
        x="45"
        y="24"
        fontFamily="Inter, sans-serif"
        fontWeight="bold"
        fontSize="22"
        fill={THEME.NAVY}
      >
        JTech
      </text>
      <text
        x="108"
        y="24"
        fontFamily="Inter, sans-serif"
        fontWeight="bold"
        fontSize="22"
        fill={THEME.LIGHT_BLUE}
      >
        AI
      </text>
    </svg>
  );

  return (
    <>
      <GlobalStyles />
      <footer
        id="contact"
        className="bg-[#fcfcfc] border-t border-[#d1d5db] pt-24 pb-12 font-technical text-[#1a1a1a]"
      >
        <div className="max-w-[1440px] mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16 mb-20 border-b border-[#e5e7eb] pb-16">
            {/* COLUMN 1: CORPORATE IDENTITY */}
            <div className="flex flex-col items-start">
              <JTechAILogo />
              <p className="text-gray-500 text-xs leading-relaxed mb-8 max-w-xs font-medium">
                Next-generation construction estimation powered by neural
                network analysis. ISO 27001 Certified Engineering Software.
              </p>
              <div className="flex gap-2">
                <a
                  href="https://linkedin.com/company/jtechai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center border border-[#d1d5db] text-[#0A66C2] hover:bg-[#002d5c] hover:text-white hover:border-[#002d5c] transition-all duration-300 "
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href="https://x.com/jtechai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center border border-[#d1d5db] text-black hover:bg-[#002d5c] hover:text-white hover:border-[#002d5c] transition-all duration-300 "
                  aria-label="X (Twitter)"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href="https://facebook.com/jtechai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 flex items-center justify-center border border-[#d1d5db] text-[#1877F2] hover:bg-[#002d5c] hover:text-white hover:border-[#002d5c] transition-all duration-300 "
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* COLUMN 2: SITE MAP */}
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-[2px] text-[#002d5c] mb-8 border-b-2 border-[#002d5c] pb-2 inline-block">
                Platform Modules
              </h3>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.id}>
                    <button
                      onClick={() => scrollTo(link.id)}
                      className="group flex items-center gap-3 text-gray-600 hover:text-[#002d5c] hover:pl-2 transition-all duration-300 text-[13px] font-bold uppercase tracking-wide"
                    >
                      <div className="w-1 h-1 bg-gray-300 group-hover:bg-[#5BB539] transition-colors " />
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* COLUMN 3: GLOBAL HEADQUARTERS */}
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-[2px] text-[#002d5c] mb-8 border-b-2 border-[#002d5c] pb-2 inline-block">
                Headquarters
              </h3>
              <div className="space-y-5">
                <div className="flex items-start gap-4 text-gray-600 group">
                  <div className="p-2 bg-gray-50 border border-gray-200 text-[#002d5c] ">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="text-xs leading-relaxed font-medium mt-0.5">
                    <strong className="text-[#002d5c] block mb-1 uppercase tracking-wider">
                      Nairobi Office
                    </strong>
                    JTech Plaza, 4th Floor
                    <br />
                    East Africa Region
                  </div>
                </div>

                <a
                  href="tel:+254706927062"
                  className="flex items-center gap-4 text-gray-600 group hover:text-[#002d5c] transition-colors"
                >
                  <div className="p-2 bg-gray-50 border border-gray-200 text-[#002d5c] group-hover:bg-[#002d5c] group-hover:text-white transition-colors ">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold tracking-wider">
                    +254 706 927062
                  </span>
                </a>

                <a
                  href="mailto:support@jtechai.com"
                  className="flex items-center gap-4 text-gray-600 group hover:text-[#002d5c] transition-colors"
                >
                  <div className="p-2 bg-gray-50 border border-gray-200 text-[#002d5c] group-hover:bg-[#002d5c] group-hover:text-white transition-colors ">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold tracking-wider">
                    support@jtechai.com
                  </span>
                </a>
              </div>
            </div>

            {/* COLUMN 4: NEWSLETTER */}
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-[2px] text-[#002d5c] mb-8 border-b-2 border-[#002d5c] pb-2 inline-block">
                Engineering Updates
              </h3>
              <p className="text-gray-500 text-xs mb-6 font-medium leading-relaxed">
                Subscribe to our technical bulletin for software patches, API
                changelogs, and AI model updates.
              </p>
              <div className="relative flex">
                <input
                  type="email"
                  placeholder="CORP. EMAIL ADDRESS"
                  className="w-full bg-white border border-[#d1d5db] py-3 px-4 text-xs font-bold text-[#002d5c] placeholder-gray-400 focus:outline-none focus:border-[#002d5c] transition-all  uppercase tracking-wide"
                />
                <button className="bg-[#002d5c] hover:bg-[#001a35] text-white px-5 transition-colors  flex items-center justify-center">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* BOTTOM BAR */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-[#5BB539] rounded-full animate-pulse" />
              <p>
                © {new Date().getFullYear()} JTech AI Systems. All rights
                reserved.
              </p>
            </div>

            <div className="flex gap-8">
              <a
                href="#"
                className="hover:text-[#002d5c] flex items-center gap-2 transition-colors"
              >
                <ShieldCheck className="w-3 h-3" /> Privacy Protocol
              </a>
              <a
                href="#"
                className="hover:text-[#002d5c] flex items-center gap-2 transition-colors"
              >
                <FileText className="w-3 h-3" /> Terms of Service
              </a>
              <a
                href="#"
                className="hover:text-[#002d5c] flex items-center gap-2 transition-colors"
              >
                <Server className="w-3 h-3" /> System Status: Operational
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default PageFooter;
