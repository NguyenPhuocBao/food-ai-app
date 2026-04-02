const fs = require('fs');
const path = require('path');

// Đọc file classes mới (đã sạch)
const classesFile = 'D:/food-ai-app/data/vietfood67_classes.txt';
const classes = fs.readFileSync(classesFile, 'utf8')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

console.log('✅ Đã đọc được classes:');
classes.forEach((c, i) => console.log(`  ${i+1}. ${c}`));
// Tạo dữ liệu dinh dưỡng mẫu
const foodItems = classes.map((name, index) => {
    // Xác định category dựa trên tên
    let category = 'Món khác';
    if (name.includes('Banh')) category = 'Bánh';
    else if (name.match(/Bun|Pho|Hu tieu|Mi quang/)) category = 'Món nước';
    else if (name.match(/Com|Xoi/)) category = 'Món cơm/xôi';
    else if (name.match(/Goi|Nem/)) category = 'Khai vị';
    else if (name.includes('Che')) category = 'Tráng miệng';
    else if (name.includes('Lau')) category = 'Lẩu';
    else if (name.includes('Kho')) category = 'Món kho';
    else if (name.includes('Canh')) category = 'Canh';
    else if (name.includes('Chao')) category = 'Cháo';
    
    // Dinh dưỡng cơ bản
    let calories = 300;
    if (category === 'Món nước') calories = 350;
    else if (category === 'Món cơm/xôi') calories = 450;
    else if (category === 'Khai vị') calories = 150;
    else if (category === 'Tráng miệng') calories = 250;
    
    return {
        id: index + 1,
        name: name,
        name_vi: name.replace(/([A-Z])/g, ' $1').trim(), // Tạm thời
        category: category,
        calories: calories,
        protein: Math.round(calories * 0.15),
        fat: Math.round(calories * 0.25),
        carbs: Math.round(calories * 0.6),
        description: `Món ${name} đặc sản Việt Nam`,
        class_id: index
    };
});

// Tạo metadata
const metadata = {
    dataset: '30VNFoods',
    total_classes: classes.length,
    classes: classes,
    food_items: foodItems,
    created_at: new Date().toISOString()
};

// Lưu file JSON
const outputPath = 'D:/food-ai-app/data/processed/vietfood67_clean.json';
fs.writeFileSync(outputPath, JSON.stringify(metadata, null, 2), 'utf8');

console.log('\n✅ Đã tạo file JSON sạch!');
console.log(`📁 File: ${outputPath}`);
console.log(`📊 Tổng số món: ${metadata.total_classes}`);