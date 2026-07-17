import fs from 'fs';
let content = fs.readFileSync('src/components/OnboardingWizard.tsx', 'utf8');

content = content.replace(/<div className="relative">\s*(<input[^>]+className="[^"]+w-full[^"]+"[^>]*\/>)\s*<span className="absolute[^"]+">\{([^}]+)\}<\/span>\s*<\/div>/g, 
  (match, inputTag, labelVar) => {
    let newInput = inputTag.replace('w-full', 'flex-1 w-full');
    return `<div className="flex items-center gap-3">
                  ${newInput}
                  <span className="text-sm font-bold text-brand-helper whitespace-nowrap">{${labelVar}}</span>
                </div>`;
});

content = content.replace(/<div className="relative">\s*(<input[^>]+className=\{`w-full[^`]+`\}[^>]*\/>)\s*<span className="absolute[^"]+">\{([^}]+)\}<\/span>\s*<\/div>/g, 
  (match, inputTag, labelVar) => {
    let newInput = inputTag.replace('w-full', 'flex-1 w-full');
    newInput = newInput.replace(/pl-8 /g, '').replace(/pr-3 /g, '').replace(/px-4 /g, 'px-3 ');
    return `<div className="flex items-center gap-3">
                    ${newInput}
                    <span className="text-xs font-bold text-brand-helper whitespace-nowrap">{${labelVar}}</span>
                  </div>`;
});

fs.writeFileSync('src/components/OnboardingWizard.tsx', content);
console.log("Done Onboarding");
