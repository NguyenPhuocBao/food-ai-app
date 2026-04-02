import os
import shutil
from tqdm import tqdm

def prepare_classification_data():
    """
    Chuẩn bị dữ liệu cho classification theo format PyTorch ImageFolder
    """
    # Đường dẫn
    source_path = 'D:/food-ai-app/data/raw/30vnfoods/Images'
    target_path = 'D:/food-ai-app/data/processed/classification'
    
    # Tạo thư mục đích
    print("📁 Đang tạo thư mục đích...")
    for split in ['train', 'val', 'test']:
        os.makedirs(f'{target_path}/{split}', exist_ok=True)
    
    # Đọc danh sách classes từ file đã tạo ở bước 2
    with open('D:/food-ai-app/data/metadata/classes.txt', 'r', encoding='utf-8') as f:
        classes = [line.strip() for line in f.readlines()]
    
    print(f"📋 Tìm thấy {len(classes)} classes")
    
    # Tạo thư mục cho từng class trong mỗi split
    for class_name in classes:
        for split in ['train', 'val', 'test']:
            os.makedirs(f'{target_path}/{split}/{class_name}', exist_ok=True)
    
    # Copy dữ liệu
    print("\n🔄 Đang copy dữ liệu...")
    
    # Copy Train -> train
    print("\n📂 Copy Train -> train:")
    train_classes = [d for d in os.listdir(f'{source_path}/Train') 
                     if os.path.isdir(f'{source_path}/Train/{d}')]
    
    for class_name in tqdm(train_classes, desc="Train"):
        src = f'{source_path}/Train/{class_name}'
        dst = f'{target_path}/train/{class_name}'
        
        images = [f for f in os.listdir(src) 
                 if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        
        for img in images:
            shutil.copy2(f'{src}/{img}', f'{dst}/{img}')
    
    # Copy Validate -> val
    print("\n📂 Copy Validate -> val:")
    val_classes = [d for d in os.listdir(f'{source_path}/Validate') 
                   if os.path.isdir(f'{source_path}/Validate/{d}')]
    
    for class_name in tqdm(val_classes, desc="Validate"):
        src = f'{source_path}/Validate/{class_name}'
        dst = f'{target_path}/val/{class_name}'
        
        images = [f for f in os.listdir(src) 
                 if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        
        for img in images:
            shutil.copy2(f'{src}/{img}', f'{dst}/{img}')
    
    # Copy Test -> test
    print("\n📂 Copy Test -> test:")
    test_classes = [d for d in os.listdir(f'{source_path}/Test') 
                    if os.path.isdir(f'{source_path}/Test/{d}')]
    
    for class_name in tqdm(test_classes, desc="Test"):
        src = f'{source_path}/Test/{class_name}'
        dst = f'{target_path}/test/{class_name}'
        
        images = [f for f in os.listdir(src) 
                 if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
        
        for img in images:
            shutil.copy2(f'{src}/{img}', f'{dst}/{img}')
    
    # Thống kê kết quả
    print("\n" + "="*60)
    print("📊 THỐNG KÊ SAU KHI CHUẨN BỊ DỮ LIỆU")
    print("="*60)
    
    total = 0
    for split in ['train', 'val', 'test']:
        split_path = f'{target_path}/{split}'
        split_total = 0
        classes = os.listdir(split_path)
        
        print(f"\n📁 {split.upper()}:")
        for class_name in sorted(classes)[:5]:  # Chỉ hiển thị 5 class đầu
            class_path = f'{split_path}/{class_name}'
            count = len([f for f in os.listdir(class_path) 
                        if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
            split_total += count
            print(f"  {class_name:20s}: {count:4d} ảnh")
        
        print(f"  ... và {len(classes)-5} classes khác")
        print(f"  TỔNG {split.upper()}: {split_total} ảnh")
        total += split_total
    
    print("\n" + "="*60)
    print(f"📦 TỔNG SỐ ẢNH: {total} ảnh")
    print(f"📁 Dữ liệu đã được chuẩn bị tại: {target_path}")
    print("="*60)

if __name__ == "__main__":
    prepare_classification_data()