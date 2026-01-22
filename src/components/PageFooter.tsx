// src/components/PageFooter.tsx
import {
  Phone,
  Mail,
  ArrowRight,
  ShieldCheck,
  FileText,
  Server,
  MapPin,
  Lock,
} from "lucide-react";

interface PageFooterProps {
  scrollTo: (section: string) => void;
}

const PageFooter = ({ scrollTo }: PageFooterProps) => {
  const linkGroups = [
    {
      title: "Core Platform",
      links: [
        { label: "Features", id: "features" },
        { label: "How It Works", id: "how-it-works" },
        { label: "Who It's For", id: "who-its-for" },
        { label: "System FAQ", id: "faq" },
      ],
    },
    {
      title: "Commercial",
      links: [
        { label: "Pricing Packages", id: "pricing" },
        { label: "Payment Options", id: "payment-options" },
        { label: "Client Testimonials", id: "testimonials" },
        { label: "Enterprise Support", id: "contact" },
      ],
    },
  ];

  // ✅ Updated Logo – uses Navbar theme colors
  const JTechAILogo = () => (
    <svg
      width="145"
      height="34"
      viewBox="0 0 135 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mb-6"
    >
      <path d="M19.2857 11.25H12.8571V15.75H19.2857V11.25Z" fill="#002d5c" />
      <path d="M19.2857 20.25H12.8571V24.75H19.2857V20.25Z" fill="#002d5c" />
      <path d="M9.64286 6.75H25.7143V2.25H9.64286V6.75Z" fill="#002d5c" />
      <path d="M9.64286 29.25H25.7143V24.75H9.64286V29.25Z" fill="#002d5c" />
      <path d="M6.42857 11.25H0V24.75H6.42857V11.25Z" fill="#002d5c" />
      <path d="M32.1429 11.25H25.7143V24.75H32.1429V11.25Z" fill="#002d5c" />
      <path d="M38.5714 15.75H32.1429V20.25H38.5714V15.75Z" fill="#002d5c" />
      <circle cx="22.5" cy="13.5" r="2.25" fill="#86bc25" />
      <circle cx="22.5" cy="22.5" r="2.25" fill="#86bc25" />
      <path d="M22.5 15.75V20.25" stroke="#86bc25" strokeWidth="1.5" />
      <text
        x="45"
        y="24"
        fontFamily="Outfit, sans-serif"
        fontWeight="800"
        fontSize="22"
        fill="#002d5c"
      >
        JTech
      </text>
      <text
        x="108"
        y="24"
        fontFamily="Outfit, sans-serif"
        fontWeight="800"
        fontSize="22"
        fill="#86bc25"
      >
        AI
      </text>
    </svg>
  );

  return (
    <>
      <footer
        id="footer"
        className="bg-white pt-16 pb-8 text-[#1a1a1a]"
      >
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 mb-16">
            
            {/* COLUMN 1: BRAND & COMPLIANCE */}
            <div className="lg:col-span-4">
              <JTechAILogo />
              <p className="text-gray-600 text-sm leading-relaxed font-normal max-w-sm">
                Next-generation construction estimation powered by neural network
                analysis. Engineered for precision.
              </p>

              {/* Compliance Badges */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#002d5c]">
                  Security Standards
                </h4>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2 px-3 py-2 bg-[#e5f0f7] border border-[#d1d5db] rounded">
                    <ShieldCheck className="w-4 h-4 text-[#002d5c]" strokeWidth={1.8} />
                    <span className="text-xs font-bold text-[#002d5c]">ISO 27001</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 bg-[#e5f0f7] border border-[#d1d5db] rounded">
                    <Lock className="w-4 h-4 text-[#002d5c]" strokeWidth={1.8} />
                    <span className="text-xs font-bold text-[#002d5c]">SOC 2 Type II</span>
                  </div>
                </div>
              </div>
            </div>

            {/* LINK COLUMNS */}
            {linkGroups.map((group) => (
              <div key={group.title} className="lg:col-span-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#002d5c] mb-6 pb-2 border-b border-[#e5e7eb] inline-block">
                  {group.title}
                </h3>
                <ul className="space-y-3">
                  {group.links.map((link) => (
                    <li key={link.id}>
                      <button
                        onClick={() => scrollTo(link.id)}
                        className="group relative inline-block text-sm font-normal text-[#002d5c] hover:text-[#001226] transition-colors"
                      >
                        {link.label}
                        <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[#002d5c] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* COLUMN 4: CONTACT & NEWSLETTER */}
            <div className="lg:col-span-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#002d5c] mb-6 pb-2 border-b border-[#e5e7eb] inline-block">
                Regional Headquarters
              </h3>
              
              <div className="mb-8 space-y-4 text-[#1a1a1a]">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#002d5c] mt-0.5 flex-shrink-0" />
                  <div className="text-sm font-normal">
                    <span className="font-bold block">NAIROBI, KENYA</span>
                    JTech Plaza, 4th Floor<br />
                    East Africa Region
                  </div>
                </div>
                
                <div className="pl-8 space-y-2">
                  <a
                    href="tel:+254706927062"
                    className="flex items-center gap-2 text-xs font-medium text-[#002d5c] hover:text-[#001226] transition-colors"
                  >
                    <Phone className="w-4 h-4" strokeWidth={1.8} />
                    +254 706 927062
                  </a>
                  <a
                    href="mailto:support@jtechai.com"
                    className="flex items-center gap-2 text-xs font-medium text-[#002d5c] hover:text-[#001226] transition-colors"
                  >
                    <Mail className="w-4 h-4" strokeWidth={1.8} />
                    support@jtechai.com
                  </a>
                </div>
              </div>

              {/* Newsletter – Sharp, clean form */}
              <div className="relative">
                <div className="flex border border-[#d1d5db] rounded-md overflow-hidden shadow-sm">
                  <input
                    type="email"
                    placeholder="Enter email for updates"
                    className="w-full bg-white py-3 pl-4 text-sm font-normal text-[#1a1a1a] placeholder:text-gray-400 focus:outline-none"
                  />
                  <button
                    className="bg-[#002d5c] text-white px-4 flex items-center justify-center hover:bg-[#001226] transition-colors"
                  >
                    <ArrowRight className="w-4 h-4" strokeWidth={2} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="bg-[#002d5c] py-4">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs font-bold uppercase tracking-wider text-white/80">
            <div className="flex items-center gap-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#86bc25] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#86bc25]"></span>
              </span>
              <p className="text-white">System Status: Operational</p>
              <span className="text-white/30 mx-2">|</span>
              <p>© {new Date().getFullYear()} JTech AI Systems</p>
            </div>

            <div className="flex gap-6">
              <a href="#" className="hover:text-white flex items-center gap-1.5 transition-colors">
                <ShieldCheck className="w-3 h-3" strokeWidth={2} /> Privacy
              </a>
              <a href="#" className="hover:text-white flex items-center gap-1.5 transition-colors">
                <FileText className="w-3 h-3" strokeWidth={2} /> Terms
              </a>
              <a href="#" className="hover:text-white flex items-center gap-1.5 transition-colors">
                <Server className="w-3 h-3" strokeWidth={2} /> Status
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default PageFooter;