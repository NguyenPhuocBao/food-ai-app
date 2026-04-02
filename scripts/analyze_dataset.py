import os
from collections import Counter
import matplotlib.pyplot as plt
import numpy as np

# Đường dẫn dataset
base_path = 'D:/food-ai-app/data/raw/30vnfoods/Images'
splits = ['Train', 'Test', 'Validate']

# Thống kê
stats = {}
total_images = 0

print("=" * 60)
print("📊 THỐNG KÊ CHI TIẾT 30VNFoods DATASET")
print("=" * 60)

for split in splits:
    split_path = os.path.join(base_path, split)
    if not os.path.exists(split_path):
        continue
    
    # Lấy danh sách các class (thư mục con)
    classes = [d for d in os.listdir(split_path) 
               if os.path.isdir(os.path.join(split_path, d))]
    
    print(f"\n📁 {split.upper()}: {split_path}")
    print("-" * 40)
    
    split_total = 0
    for class_name in sorted(classes):
        class_path = os.path.join(split_path, class_name)
        images = [f for f in os.listdir(class_path) 
                 if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        count = len(images)
        
        if class_name not in stats:
            stats[class_name] = {}
        stats[class_name][split] = count
        split_total += count
        
        print(f"  {class_name:20s}: {count:4d} ảnh")
    
    print(f"  {'─' * 40}")
    print(f"  TỔNG {split.upper()}: {split_total} ảnh")
    total_images += split_total

print("\n" + "=" * 60)
print(f"📊 TỔNG SỐ ẢNH TOÀN BỘ: {total_images} ảnh")
print("=" * 60)

# Vẽ biểu đồ phân phối
plt.figure(figsize=(15, 8))

classes = sorted(stats.keys())
train_counts = [stats[c].get('Train', 0) for c in classes]
test_counts = [stats[c].get('Test', 0) for c in classes]
val_counts = [stats[c].get('Validate', 0) for c in classes]

x = np.arange(len(classes))
width = 0.25

plt.bar(x - width, train_counts, width, label='Train', color='#4ECDC4')
plt.bar(x, test_counts, width, label='Test', color='#FF6B6B')
plt.bar(x + width, val_counts, width, label='Validate', color='#FFE66D')

plt.xlabel('Classes')
plt.ylabel('Số lượng ảnh')
plt.title('Phân phối ảnh trong 30VNFoods dataset')
plt.xticks(x, classes, rotation=90)
plt.legend()
plt.tight_layout()
plt.savefig('D:/food-ai-app/data/metadata/dataset_distribution.png')
plt.show()

print("\n✅ Đã lưu biểu đồ tại: data/metadata/dataset_distribution.png")