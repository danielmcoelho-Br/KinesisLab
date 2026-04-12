import re

def count_braces(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove strings and comments to avoid false positives
    content = re.sub(r'//.*', '', content)
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    content = re.sub(r'\'(.*?)\'', '', content)
    content = re.sub(r'\"(.*?)\"', '', content)
    content = re.sub(r'\`(.*?)\`', '', content, flags=re.DOTALL)

    open_b = content.count('{')
    close_b = content.count('}')
    open_p = content.count('(')
    close_p = content.count(')')
    open_a = content.count('<')
    close_a = content.count('>')

    print(f"Braces: {{: {open_b}, }}: {close_b} (Diff: {open_b - close_b})")
    print(f"Parens: (: {open_p}, ): {close_p} (Diff: {open_p - close_p})")

count_braces('src/components/assessment/FormSection.tsx')
