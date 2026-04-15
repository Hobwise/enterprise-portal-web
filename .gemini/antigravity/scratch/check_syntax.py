import re

def check_balance(filename):
    with open(filename, 'r') as f:
        content = f.read()
    
    # Check braces
    braces = 0
    for i, char in enumerate(content):
        if char == '{': braces += 1
        elif char == '}': braces -= 1
        if braces < 0:
            print(f"Excess '}}' at index {i}")
            # return
    print(f"Final brace balance: {braces}")

    # Check parens
    parens = 0
    for i, char in enumerate(content):
        if char == '(': parens += 1
        elif char == ')': parens -= 1
        if parens < 0:
            print(f"Excess ')' at index {i}")
            # return
    print(f"Final paren balance: {parens}")

    # Check tags (very naive)
    tags = re.findall(r'<(/?[a-zA-Z0-9]+)', content)
    stack = []
    for tag in tags:
        if tag.startswith('/'):
            if not stack:
                print(f"Closing tag {tag} without opening")
            else:
                top = stack.pop()
                if top != tag[1:]:
                    print(f"Mismatched tag: opened {top}, closing {tag}")
        else:
            # Skip self-closing and special tags (simplified)
            if tag in ['img', 'br', 'hr', 'input', 'link', 'meta', 'path', 'svg', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse', 'stop']:
                continue
            stack.append(tag)
    print(f"Unclosed tags: {stack}")

if __name__ == "__main__":
    check_balance("/Users/mac/enterprise-portal-web/app/dashboard/inventory/inventory-count/page.tsx")
