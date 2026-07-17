import re

with open('src/components/OnboardingWizard.tsx', 'r') as f:
    content = f.read()

# Pattern for div with relative containing input and absolute span
# <div className="relative">\s*<input[^>]+/>\s*<span className="absolute[^"]+">\{currencyLabel\}</span>\s*</div>
pattern = re.compile(r'<div className="relative">(\s*<input.*?(?:\n.*?)*?/>\s*)<span className="absolute[^"]+">\{(currencyLabel|debtPeriodLabel)\}</span>\s*</div>', re.MULTILINE)

def replace_func(match):
    input_tag = match.group(1)
    label_var = match.group(2)
    # Modify input tag class
    input_tag = input_tag.replace('w-full', 'flex-1 w-full')
    input_tag = input_tag.replace('pl-8 ', '')
    input_tag = input_tag.replace('pr-3 ', '')
    return f'<div className="flex items-center gap-3">{input_tag}<span className="text-sm font-bold text-brand-helper whitespace-nowrap">{{{label_var}}}</span>\n                </div>'

new_content = pattern.sub(replace_func, content)

with open('src/components/OnboardingWizard.tsx', 'w') as f:
    f.write(new_content)

print("Done python")
