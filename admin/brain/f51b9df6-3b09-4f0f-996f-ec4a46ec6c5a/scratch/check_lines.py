with open('/home/tony/Downloads/Tender-management/admin/src/pages/FinancialManagement.jsx', 'r') as f:
    lines = f.readlines()

for i in range(575, 585):
    if i < len(lines):
        print(f"{i+1}: {repr(lines[i])}")
