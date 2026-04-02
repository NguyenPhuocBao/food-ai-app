import json

# Danh sách món ăn từ kết quả phân tích
foods = [
    "Banh beo", "Banh bot loc", "Banh can", "Banh canh", "Banh chung",
    "Banh cuon", "Banh duc", "Banh gio", "Banh khot", "Banh mi",
    "Banh pia", "Banh tet", "Banh trang nuong", "Banh xeo", "Bun bo Hue",
    "Bun dau mam tom", "Bun mam", "Bun rieu", "Bun thit nuong", "Ca kho to",
    "Canh chua", "Cao lau", "Chao long", "Com tam", "Goi cuon",
    "Hu tieu", "Mi quang", "Nem chua", "Pho", "Xoi xeo"
]

# Phân loại theo nhóm
categories = {
    "Món nước": ["Bun bo Hue", "Bun rieu", "Bun mam", "Hu tieu", "Mi quang", "Pho", "Banh canh", "Cao lau"],
    "Món khô": ["Bun thit nuong", "Bun dau mam tom", "Com tam"],
    "Bánh": ["Banh beo", "Banh bot loc", "Banh can", "Banh chung", "Banh cuon", "Banh duc", 
             "Banh gio", "Banh khot", "Banh mi", "Banh pia", "Banh tet", "Banh trang nuong", "Banh xeo"],
    "Món kho": ["Ca kho to"],
    "Canh": ["Canh chua"],
    "Cháo": ["Chao long"],
    "Khai vị": ["Goi cuon", "Nem chua"],
    "Xôi": ["Xoi xeo"]
}

# Đếm số lượng theo nhóm
count_by_category = {}
for food in foods:
    for category, items in categories.items():
        if food in items:
            count_by_category[category] = count_by_category.get(category, 0) + 1
            break
    else:
        count_by_category["Món khác"] = count_by_category.get("Món khác", 0) + 1

print("📊 PHÂN BỐ MÓN ĂN THEO NHÓM:")
print("-" * 40)
for category, count in count_by_category.items():
    print(f"{category:15s}: {count} món")