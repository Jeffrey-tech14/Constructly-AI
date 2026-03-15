const fs = require('fs');
let c = fs.readFileSync('src/components/sections/WhoItsForSection.tsx', 'utf8');

c = c.replace(
  '        <section\n          className="bg-white antialiased"\n          style={{\n            fontFamily: "\'Outfit\', sans-serif",\n            WebkitFontSmoothing: "antialiased",\n            MozOsxFontSmoothing: "grayscale",\n            textRendering: "geometricPrecision",\n          }}\n        >\n          <div className="max-w-[1920px] mx-auto grid grid-cols-1 lg:grid-cols-2">',
  '        <section\n          className="bg-white antialiased py-10 md:py-16"\n          style={{\n            fontFamily: "\'Outfit\', sans-serif",\n            WebkitFontSmoothing: "antialiased",\n            MozOsxFontSmoothing: "grayscale",\n            textRendering: "geometricPrecision",\n          }}\n        >\n          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">\n            <div className="grid grid-cols-1 lg:grid-cols-2 rounded-[20px] overflow-hidden shadow-lg border border-gray-100">'
);

// find the end of section 3 to close the extra div
if (c.includes(' Try our User Guide\n                </button>\n              </div>\n            </div>\n          </div>\n        </section>\n      </div>\n    </div>')) {
  c = c.replace(
    ' Try our User Guide\n                </button>\n              </div>\n            </div>\n          </div>\n        </section>',
    ' Try our User Guide\n                </button>\n              </div>\n            </div>\n            </div>\n          </div>\n        </section>'
  );
} else {
  // alternative matching
    // Let's use simpler index logic
    let endSec3 = c.lastIndexOf('</section>');
    if (endSec3 !== -1) {
        let beforeEnd = c.substring(0, endSec3);
        let afterEnd = c.substring(endSec3);
        
        let lastDiv = beforeEnd.lastIndexOf('</div>\n        ');
        if (lastDiv !== -1) {
            beforeEnd = beforeEnd.substring(0, lastDiv) + '</div>\n          </div>\n        ';
            c = beforeEnd + afterEnd;
        }
    }
}

fs.writeFileSync('src/components/sections/WhoItsForSection.tsx', c);
