const fs = require('fs');
const { Client } = require('pg');

async function importData() {
    // Kết nối database
    const client = new Client({
        host: 'localhost',
        port: 5432,
        user: 'admin',
        password: 'admin123',
        database: 'food_app_db'
    });

    try {
        console.log('🔄 Đang kết nối database...');
        await client.connect();
        console.log('✅ Kết nối thành công!');

        // Đọc file JSON
        console.log('📖 Đang đọc file JSON...');
        const jsonData = JSON.parse(
            fs.readFileSync('D:/food-ai-app/data/processed/vietfood67_clean.json', 'utf8')
        );

        console.log(`📊 Tìm thấy ${jsonData.food_items.length} món ăn`);

        // Lấy mapping categories
        const catResult = await client.query('SELECT id, name FROM categories');
        const categories = {};
        catResult.rows.forEach(row => {
            categories[row.name] = row.id;
        });

        // Import từng món
        let success = 0;
        for (const item of jsonData.food_items) {
            try {
                const categoryId = categories[item.category] || categories['Món khác'];
                
                await client.query(`
                    INSERT INTO food_items 
                    (name, name_vi, category_id, calories, protein, fat, carbs, description, class_id)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                `, [
                    item.name,
                    item.name_vi || item.name,
                    categoryId,
                    item.calories || 300,
                    item.protein || 15,
                    item.fat || 8,
                    item.carbs || 40,
                    item.description || `Món ${item.name}`,
                    item.class_id || 0
                ]);
                
                success++;
                process.stdout.write(`\r⏳ Đã import: ${success}/${jsonData.food_items.length}`);
                
            } catch (err) {
                console.log(`\n❌ Lỗi import món ${item.name}:`, err.message);
            }
        }

        console.log(`\n✅ Import thành công ${success}/${jsonData.food_items.length} món!`);

        // Kiểm tra tổng số
        const count = await client.query('SELECT COUNT(*) FROM food_items');
        console.log(`📊 Tổng số món trong database: ${count.rows[0].count}`);

    } catch (err) {
        console.error('❌ Lỗi:', err);
    } finally {
        await client.end();
    }
}

importData();