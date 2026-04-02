import json
import os

# Danh sách 30 món ăn từ kết quả phân tích
foods = [
    "Banh beo", "Banh bot loc", "Banh can", "Banh canh", "Banh chung",
    "Banh cuon", "Banh duc", "Banh gio", "Banh khot", "Banh mi",
    "Banh pia", "Banh tet", "Banh trang nuong", "Banh xeo", "Bun bo Hue",
    "Bun dau mam tom", "Bun mam", "Bun rieu", "Bun thit nuong", "Ca kho to",
    "Canh chua", "Cao lau", "Chao long", "Com tam", "Goi cuon",
    "Hu tieu", "Mi quang", "Nem chua", "Pho", "Xoi xeo"
]

# Sắp xếp theo thứ tự alphabet
foods.sort()

# Tạo mapping class_to_idx
class_to_idx = {food: idx for idx, food in enumerate(foods)}

# Tạo mapping idx_to_class
idx_to_class = {idx: food for idx, food in enumerate(foods)}

# Lưu thành JSON
output_dir = 'D:/food-ai-app/data/metadata'
os.makedirs(output_dir, exist_ok=True)

# Lưu dạng class_to_idx
with open(f'{output_dir}/class_to_idx.json', 'w', encoding='utf-8') as f:
    json.dump(class_to_idx, f, indent=2, ensure_ascii=False)

# Lưu dạng idx_to_class
with open(f'{output_dir}/idx_to_class.json', 'w', encoding='utf-8') as f:
    json.dump(idx_to_class, f, indent=2, ensure_ascii=False)

# Lưu dạng class_indices cho PyTorch
class_indices = {str(idx): food for idx, food in enumerate(foods)}
with open(f'{output_dir}/class_indices.json', 'w', encoding='utf-8') as f:
    json.dump(class_indices, f, indent=2, ensure_ascii=False)

# Tạo file txt đơn giản
with open(f'{output_dir}/classes.txt', 'w', encoding='utf-8') as f:
    for food in foods:
        f.write(f"{food}\n")

print("✅ ĐÃ TẠO CLASS INDICES THÀNH CÔNG!")
print("=" * 60)
print(f"📁 Thư mục: {output_dir}")
print("\n📊 DANH SÁCH 30 MÓN ĂN (ĐÃ SẮP XẾP):")
print("-" * 40)
for idx, food in enumerate(foods):
    print(f"  {idx:2d}: {food}")

print("\n📄 Các file đã tạo:")
print(f"  • class_to_idx.json")
print(f"  • idx_to_class.json")  
print(f"  • class_indices.json")
print(f"  • classes.txt")
print("=" * 60)