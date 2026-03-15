const fs = require('fs');

let b = fs.readFileSync('src/components/UserGuide.tsx', 'utf8');

const footerIndex = b.indexOf('{/* Footer CTA */}');

if (footerIndex > -1) {
    b = b.substring(0, footerIndex);
    b += `{/* Footer CTA */}
        <div className="mt-12 text-center pb-12">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-[#d1d5db] dark:border-blue-800">
            <CardContent className="pt-8 pb-8 text-center">
              <h3 className="text-xl text-white dark:text-white mb-4">
                Ready to Create Your First Quote?
              </h3>
              <p className="text-[#a0a0a0] dark:text-gray-300 mb-6">
                Follow the steps in this guide to build accurate construction estimates in minutes.
              </p>
              <a
                href="/quotes/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#ef443b] hover:bg-[#002a54] text-white rounded-lg transition-colors border-none"
              >
                Start Building a Quote
                <ChevronRight className="w-5 h-5" />
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  </div>
</PublicLayout>
  );
};

export default UserGuide;
`;

    fs.writeFileSync('src/components/UserGuide.tsx', b);
    console.log("Success! File saved cleanly without duplicate tags.");
} else {
    console.log("Could not find Footer CTA!");
}
