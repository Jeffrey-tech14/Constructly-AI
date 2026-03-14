import React from "react";

const companies = [
  {
    name: "Amity University",
    src: "https://www.rib-software.com/app/uploads/2023/07/SBE-Purple-LOGO.png.webp",
    widthClass: "w-[120px] md:w-[150px]",
  },
  {
    name: "Tata",
    src: "https://www.rib-software.com/app/uploads/2023/07/tata-logo.png.webp",
    widthClass: "w-[80px] md:w-[100px]",
  },
  {
    name: "Patel Engineering",
    src: "https://www.rib-software.com/app/uploads/2023/07/patel.png.webp",
    widthClass: "w-[90px] md:w-[110px]",
  },
  {
    name: "Aveng",
    src: "https://www.rib-software.com/app/uploads/2023/07/Aveng-Grinaker.png.webp",
    widthClass: "w-[120px] md:w-[140px]",
  },
  {
    name: "HOCHTIEF",
    src: "https://www.rib-software.com/app/uploads/2023/07/Hochtief-logo.png.webp",
    widthClass: "w-[120px] md:w-[140px]",
  },
  {
    name: "Larsen & Toubro",
    src: "https://www.rib-software.com/app/uploads/2023/07/LT.png.webp",
    widthClass: "w-[50px] md:w-[60px]",
  },
  {
    name: "AFCONS",
    src: "https://www.rib-software.com/app/uploads/2023/07/Afcons.png.webp",
    widthClass: "w-[110px] md:w-[130px]",
  },
  {
    name: "Orascom",
    src: "https://www.rib-software.com/app/uploads/2023/07/Orascom-Construction.png.webp",
    widthClass: "w-[130px] md:w-[160px]",
  }
];

export default function TrustedCompaniesMarquee() {
  const row = [...companies, ...companies];

  return (
    <section className="bg-white py-7 md:py-8 overflow-hidden">
      <style>{`
        @keyframes trusted-marquee-ltr {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
      `}</style>

      <div className="max-w-[1400px] mx-auto px-4">
        <p className="text-center text-[#0b3e74] text-[18px] md:text-[34px] font-semibold tracking-tight mb-5 md:mb-6">
          Trusted by 200+ companies in over 47 countries
        </p>
      </div>

      <div className="w-full overflow-hidden">
        <div
          className="flex items-center gap-12 md:gap-16 w-max"
          style={{ animation: "trusted-marquee-ltr 26s linear infinite" }}
        >
          {row.map((company, index) => (
            <div
              key={`${company.name}-${index}`}
              className="h-10 md:h-12 flex items-center justify-center"
            >
              <img
                src={company.src}
                alt={company.name}
                className={`${company.widthClass} h-auto object-contain opacity-95`}
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
