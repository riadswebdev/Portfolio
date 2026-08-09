from pathlib import Path
import re
path = Path(r'd:\portfolio\app\lib\github.ts')
text = path.read_text(encoding='utf-8')
md_pattern = re.compile(r'const mdImageRegex = /!\\\[.*?\\\]\\\((?:.|\n)*?\)/g;', re.DOTALL)
html_pattern = re.compile(r'const htmlImageRegex = /<img[^>]+src=\["\"](https?:\\/\\/[^"\"]+|(?:.|\n)*?)["\"]/g;', re.DOTALL)
new_md = 'const mdImageRegex = /!\\[.*?\\]\\((https?:\\/\\/[^\\s\\)]+|\\/[^\\s\\)]+|\\.\\/[^\\s\\)]+|[^\\s\\)]+)\\)/g;'
new_html = 'const htmlImageRegex = /<img[^>]+src=["\'](https?:\\/\\/[^"\']+|\\/[^"\']+|\\.\\/[^"\']+|[^"\']+)["\']/g;'
text_new = md_pattern.sub(new_md, text)
text_new = html_pattern.sub(new_html, text_new)
if text_new == text:
    raise SystemExit('No replacements made; regex patterns were not found')
path.write_text(text_new, encoding='utf-8')
print('patched')
