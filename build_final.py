import sys, re

# Read original
with open(r'C:\Users\ASUS\Doubao\chats\2026-09-09\new-chat\campus-toolbox\index.html', 'r', encoding='utf-8') as f:
    original = f.read()

style_start = original.find('<style>') + len('<style>')
style_end = original.find('</style>')
script_start = original.find('<script>')

# Build new CSS
new_css = open(r'C:\Users\ASUS\Desktop\网站设计\repo-work\full_new_css.txt', 'r', encoding='utf-8').read()

before_style = original[:style_start]
html_body = original[style_end:script_start]
js_and_rest = original[script_start:]

new_html = before_style + '\n' + new_css + '\n' + html_body + js_and_rest

out = r'C:\Users\ASUS\Desktop\网站设计\repo-work\index_redesigned.html'
with open(out, 'w', encoding='utf-8') as f:
    f.write(new_html)

print(f'Written {len(new_html)} chars to index_redesigned.html')