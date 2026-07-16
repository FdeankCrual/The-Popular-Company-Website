import json

with open('data/money.json', 'r') as f:
    data = json.load(f)

def to_tsv(array):
    if not array: return ''
    headers = list(array[0].keys())
    lines = ['\t'.join(headers)]
    for row in array:
        lines.append('\t'.join(str(row.get(h, '')).replace('\t', ' ') for h in headers))
    return '\n'.join(lines)

md = '# Your July Financial Data\n\n'
md += 'Copy the contents of each block and paste it into cell **A1** of the corresponding tab in your Google Sheet.\n\n'

md += '### Money_Incomes\n```tsv\n' + to_tsv(data.get('incomes', [])) + '\n```\n\n'
md += '### Money_Expenses\n```tsv\n' + to_tsv(data.get('expenses', [])) + '\n```\n\n'
md += '### Money_Employees\n```tsv\n' + to_tsv(data.get('employees', [])) + '\n```\n\n'
md += '### Money_EMIs\n```tsv\n' + to_tsv(data.get('emis', [])) + '\n```\n\n'

with open('/Users/bhavik2k4/.gemini/antigravity-ide/brain/b1b83c9a-e651-4c1f-9e2d-e97d0591b2dc/Money_July_Data.md', 'w') as f:
    f.write(md)

print('Generated Money_July_Data.md')
