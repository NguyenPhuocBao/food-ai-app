const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const data = {
  'Phở bò': [520, 28, 16, 62, 'BREAKFAST|LUNCH', 'MAIN|STAPLE', 'MAINTENANCE|MUSCLE_GAIN', 'SOUP', 'FULL_MEAL', '1 tô vừa: bánh phở 180g, bò 90g, nước dùng, rau.'],
  'Bún chả': [650, 30, 28, 72, 'LUNCH|DINNER', 'MAIN|STAPLE', 'MAINTENANCE|WEIGHT_GAIN', 'GRILLED', 'FULL_MEAL', '1 phần vừa: bún 180g, thịt nướng/chả 120g, nước chấm.'],
  'Cơm tấm': [720, 32, 28, 82, 'LUNCH|DINNER', 'MAIN|STAPLE', 'MAINTENANCE|WEIGHT_GAIN', 'GRILLED', 'FULL_MEAL', '1 đĩa vừa: cơm 180g, sườn 120g, bì/chả ít, nước mắm.'],
  'Bánh mì': [390, 15, 12, 56, 'BREAKFAST|SNACK', 'STAPLE|SNACK', 'MAINTENANCE|WEIGHT_GAIN', 'RAW', 'FULL_MEAL', '1 ổ bánh mì nhân cơ bản, không tính nhiều sốt/bơ.'],
  'Gỏi cuốn': [280, 16, 7, 38, 'SNACK|LUNCH|DINNER', 'SNACK|SIDE', 'WEIGHT_LOSS|MAINTENANCE', 'RAW', 'LIGHT', '3 cuốn tôm thịt vừa, ít nước chấm.'],
  'Bún bò Huế': [580, 28, 20, 70, 'BREAKFAST|LUNCH', 'MAIN|STAPLE', 'MAINTENANCE|WEIGHT_GAIN', 'SOUP', 'FULL_MEAL', '1 tô vừa: bún, bò/chả, nước dùng.'],
  'Cháo lòng': [430, 22, 18, 48, 'BREAKFAST|DINNER', 'MAIN|STAPLE', 'MAINTENANCE', 'SOUP', 'FULL_MEAL', '1 tô vừa, nội tạng mức vừa.'],
  'Xôi xéo': [520, 15, 14, 84, 'BREAKFAST', 'STAPLE', 'WEIGHT_GAIN|MAINTENANCE', 'STEAMED', 'FULL_MEAL', '1 gói xôi vừa 250g, đậu xanh, hành phi.'],
  'Bánh xèo': [520, 20, 26, 52, 'LUNCH|DINNER', 'MAIN|STAPLE', 'MAINTENANCE|WEIGHT_GAIN', 'FRIED', 'FULL_MEAL', '1 cái vừa kèm rau, nước chấm.'],
  'Hủ tiếu': [500, 25, 12, 68, 'BREAKFAST|LUNCH', 'MAIN|STAPLE', 'MAINTENANCE', 'SOUP', 'FULL_MEAL', '1 tô hủ tiếu vừa.'],
  'Bánh cuốn': [420, 16, 12, 62, 'BREAKFAST|SNACK', 'STAPLE|MAIN', 'MAINTENANCE', 'STEAMED', 'FULL_MEAL', '1 phần 250g, chả vừa, nước mắm.'],
  'Bún riêu': [480, 24, 14, 62, 'BREAKFAST|LUNCH', 'MAIN|STAPLE', 'MAINTENANCE', 'SOUP', 'FULL_MEAL', '1 tô vừa có riêu, đậu, bún.'],
  'Mì Quảng': [560, 27, 18, 70, 'BREAKFAST|LUNCH', 'MAIN|STAPLE', 'MAINTENANCE|WEIGHT_GAIN', 'SOUP', 'FULL_MEAL', '1 tô vừa, ít dầu đậu phộng.'],
  'Cao lầu': [530, 25, 15, 72, 'BREAKFAST|LUNCH', 'MAIN|STAPLE', 'MAINTENANCE', 'SOUP', 'FULL_MEAL', '1 tô vừa.'],
  'Bánh canh': [500, 22, 12, 72, 'BREAKFAST|LUNCH', 'MAIN|STAPLE', 'MAINTENANCE', 'SOUP', 'FULL_MEAL', '1 tô bánh canh thường.'],
  'Chả giò': [320, 12, 20, 24, 'SNACK|DINNER', 'SNACK|SIDE', 'WEIGHT_GAIN|MAINTENANCE', 'FRIED', 'LIGHT', '3 cuốn nhỏ, món phụ không nên là bữa chính giảm cân.'],
  'Bò kho': [560, 30, 20, 60, 'BREAKFAST|LUNCH|DINNER', 'MAIN|STAPLE', 'MAINTENANCE|WEIGHT_GAIN', 'SOUP', 'FULL_MEAL', '1 tô vừa kèm bánh mì hoặc bún ít.'],
  'Cà ri gà': [620, 30, 28, 58, 'LUNCH|DINNER', 'MAIN|STAPLE', 'MAINTENANCE|WEIGHT_GAIN', 'SOUP', 'FULL_MEAL', '1 phần vừa, có khoai và nước cốt dừa.'],
  'Lẩu Thái': [520, 35, 16, 50, 'LUNCH|DINNER', 'MAIN|SOUP', 'MAINTENANCE|MUSCLE_GAIN', 'SOUP', 'FULL_MEAL', '1 khẩu phần cá nhân, tính kèm ít bún.'],
  'Bánh bột lọc': [360, 12, 8, 62, 'SNACK|BREAKFAST', 'SNACK|STAPLE', 'MAINTENANCE', 'STEAMED', 'LIGHT', '8-10 cái vừa, ít nước mắm.'],
  'Bánh bèo': [380, 12, 10, 60, 'BREAKFAST|SNACK', 'STAPLE|SNACK', 'MAINTENANCE', 'STEAMED', 'LIGHT', '1 phần 8-10 chén nhỏ.'],
  'Bánh ướt': [420, 15, 10, 68, 'BREAKFAST', 'STAPLE|MAIN', 'MAINTENANCE', 'STEAMED', 'FULL_MEAL', '1 phần vừa kèm chả.'],
  'Bánh hỏi': [460, 18, 12, 70, 'BREAKFAST|LUNCH', 'STAPLE|MAIN', 'MAINTENANCE', 'STEAMED', 'FULL_MEAL', '1 phần vừa kèm thịt/rau.'],
  'Bún mắm': [620, 32, 20, 76, 'LUNCH', 'MAIN|STAPLE', 'MAINTENANCE|WEIGHT_GAIN', 'SOUP', 'FULL_MEAL', '1 tô vừa, mặn cao nên hạn chế.'],
  'Bún đậu mắm tôm': [720, 28, 34, 72, 'LUNCH|DINNER', 'MAIN|STAPLE', 'WEIGHT_GAIN|MAINTENANCE', 'FRIED', 'FULL_MEAL', '1 mẹt cá nhân, đậu chiên và mắm tôm.'],
  'Nem chua': [180, 14, 9, 10, 'SNACK', 'SNACK', 'MAINTENANCE', 'RAW', 'LIGHT', '2-3 cái nhỏ, natri cao.'],
  'Chè': [320, 5, 8, 58, 'SNACK', 'DESSERT', 'WEIGHT_GAIN|MAINTENANCE', 'RAW', 'LIGHT', '1 ly/chén vừa, đường cao.'],
  'Sữa chua': [120, 6, 3, 17, 'SNACK|DESSERT', 'SNACK|DESSERT', 'WEIGHT_LOSS|MAINTENANCE|MUSCLE_GAIN', 'RAW', 'LIGHT', '1 hũ 100-120g, ít đường.'],
  'Trái cây dĩa': [180, 2, 1, 42, 'SNACK|DESSERT', 'DESSERT|SNACK', 'WEIGHT_LOSS|MAINTENANCE', 'RAW', 'LIGHT', '1 dĩa 200g trái cây tươi.'],
  'Cà phê sữa đá': [160, 3, 4, 28, 'BREAKFAST|SNACK', 'DRINK', 'MAINTENANCE', 'RAW', 'LIGHT', '1 ly vừa, sữa đặc vừa.'],
  'Phở gà': [470, 28, 10, 62, 'BREAKFAST|LUNCH', 'MAIN|STAPLE', 'WEIGHT_LOSS|MAINTENANCE|MUSCLE_GAIN', 'SOUP', 'FULL_MEAL', '1 tô vừa, gà bỏ da.'],
  'Bánh mì trứng': [430, 20, 18, 52, 'BREAKFAST', 'MAIN|STAPLE', 'MAINTENANCE|WEIGHT_GAIN', 'FRIED', 'FULL_MEAL', '1 ổ + 1-2 trứng, ít sốt.'],
  'Bánh mì gà nướng': [480, 28, 16, 56, 'BREAKFAST|LUNCH', 'MAIN|STAPLE', 'MAINTENANCE|WEIGHT_GAIN', 'GRILLED', 'FULL_MEAL', '1 ổ với 100g gà nướng.'],
  'Cơm ': [200, 4, 0.5, 45, 'LUNCH|DINNER', 'STAPLE', 'WEIGHT_LOSS|MAINTENANCE|WEIGHT_GAIN|MUSCLE_GAIN', 'STEAMED', 'COMPONENT', '150g cơm trắng chín.'],
  'Cơm gà luộc': [580, 36, 12, 78, 'LUNCH|DINNER', 'MAIN|STAPLE', 'WEIGHT_LOSS|MAINTENANCE|MUSCLE_GAIN', 'BOILED', 'FULL_MEAL', '150g cơm + 120g gà luộc bỏ da + rau.'],
  'Cơm gà nướng': [700, 35, 24, 82, 'LUNCH|DINNER', 'MAIN|STAPLE', 'MAINTENANCE|WEIGHT_GAIN|MUSCLE_GAIN', 'GRILLED', 'FULL_MEAL', '150g cơm + 120g gà nướng có ướp/sốt.'],
  'Cơm thịt bò xào': [680, 34, 24, 78, 'LUNCH|DINNER', 'MAIN|STAPLE', 'MAINTENANCE|WEIGHT_GAIN', 'STIR_FRIED', 'FULL_MEAL', '150g cơm + 120g bò xào rau.'],
  'Canh chua cá': [220, 24, 6, 18, 'LUNCH|DINNER', 'SOUP|SIDE', 'WEIGHT_LOSS|MAINTENANCE', 'SOUP', 'COMPONENT', '1 tô canh cá 300ml.'],
  'Canh bí đỏ': [160, 6, 4, 26, 'LUNCH|DINNER', 'SOUP|SIDE', 'WEIGHT_LOSS|MAINTENANCE', 'SOUP', 'COMPONENT', '1 tô 300ml, bí đỏ và ít thịt/tôm.'],
  'Canh cải xanh': [90, 6, 2, 12, 'LUNCH|DINNER', 'SOUP|SIDE', 'WEIGHT_LOSS|MAINTENANCE', 'SOUP', 'COMPONENT', '1 tô rau cải 300ml.'],
  'Gà áp chảo': [320, 36, 18, 2, 'LUNCH|DINNER', 'MAIN', 'WEIGHT_LOSS|MAINTENANCE|MUSCLE_GAIN', 'STIR_FRIED', 'COMPONENT', '120g thịt gà áp chảo, ít dầu.'],
  'Gà hấp gừng': [240, 34, 8, 3, 'LUNCH|DINNER', 'MAIN', 'WEIGHT_LOSS|MAINTENANCE|MUSCLE_GAIN', 'STEAMED', 'COMPONENT', '120g gà bỏ da hấp gừng.'],
  'Salad ức gà': [360, 36, 12, 24, 'LUNCH|DINNER', 'MAIN|SIDE', 'WEIGHT_LOSS|MAINTENANCE|MUSCLE_GAIN', 'RAW', 'FULL_MEAL', '120g ức gà + rau + ít sốt.'],
  'Salad cá ngừ': [390, 32, 16, 26, 'LUNCH|DINNER', 'MAIN|SIDE', 'WEIGHT_LOSS|MAINTENANCE|MUSCLE_GAIN', 'RAW', 'FULL_MEAL', 'Cá ngừ + rau + ít sốt, 1 tô lớn.'],
  'Sữa chua yến mạch': [260, 12, 6, 42, 'BREAKFAST|SNACK', 'SNACK|DESSERT', 'WEIGHT_LOSS|MAINTENANCE', 'RAW', 'LIGHT', 'Sữa chua 120g + yến mạch 35g.'],
  'Cháo yến mạch': [300, 14, 8, 44, 'BREAKFAST|DINNER', 'MAIN|STAPLE', 'WEIGHT_LOSS|MAINTENANCE', 'SOUP', 'FULL_MEAL', 'Yến mạch 50g nấu cháo, thêm đạm nhẹ.'],
  'Khoai lang luộc': [180, 3, 0.3, 41, 'BREAKFAST|SNACK', 'STAPLE|SNACK', 'WEIGHT_LOSS|MAINTENANCE', 'BOILED', 'COMPONENT', '200g khoai lang luộc.'],
  'Khoai tây nướng': [210, 5, 4, 40, 'LUNCH|DINNER|SNACK', 'STAPLE|SIDE', 'MAINTENANCE', 'GRILLED', 'COMPONENT', '200g khoai tây nướng ít dầu.'],
  'Cơm gạo lứt cá hồi': [620, 35, 22, 68, 'LUNCH|DINNER', 'MAIN|STAPLE', 'MAINTENANCE|MUSCLE_GAIN', 'GRILLED', 'FULL_MEAL', '150g gạo lứt + 120g cá hồi + rau.'],
  'Cơm gạo lứt ứt gà': [540, 38, 10, 68, 'LUNCH|DINNER', 'MAIN|STAPLE', 'WEIGHT_LOSS|MAINTENANCE|MUSCLE_GAIN', 'BOILED', 'FULL_MEAL', 'Tên DB có thể sai chính tả: cơm gạo lứt ức gà.'],
  'Miến gà': [430, 27, 8, 62, 'BREAKFAST|LUNCH|DINNER', 'MAIN|STAPLE', 'WEIGHT_LOSS|MAINTENANCE', 'SOUP', 'FULL_MEAL', '1 tô miến gà vừa.'],
  'Hủ tiếu nam vang': [560, 30, 16, 72, 'BREAKFAST|LUNCH', 'MAIN|STAPLE', 'MAINTENANCE', 'SOUP', 'FULL_MEAL', '1 tô vừa có tôm/thịt.'],
  'Bún cá': [480, 30, 10, 66, 'BREAKFAST|LUNCH', 'MAIN|STAPLE', 'WEIGHT_LOSS|MAINTENANCE', 'SOUP', 'FULL_MEAL', '1 tô bún cá vừa.'],
  'Mì xào hải sản': [680, 32, 24, 82, 'LUNCH|DINNER', 'MAIN|STAPLE', 'MAINTENANCE|WEIGHT_GAIN', 'STIR_FRIED', 'FULL_MEAL', '1 đĩa mì xào, dầu mức vừa.'],
  'Cá thu kho': [310, 28, 18, 8, 'LUNCH|DINNER', 'MAIN', 'MAINTENANCE|MUSCLE_GAIN', 'BRAISED', 'COMPONENT', '120g cá thu kho, chưa tính cơm.'],
  'Tôm hấp': [140, 28, 2, 2, 'LUNCH|DINNER', 'MAIN', 'WEIGHT_LOSS|MAINTENANCE|MUSCLE_GAIN', 'STEAMED', 'COMPONENT', '150g tôm hấp.'],
  'Tôm xào bông cải': [260, 28, 10, 16, 'LUNCH|DINNER', 'MAIN|SIDE', 'WEIGHT_LOSS|MAINTENANCE|MUSCLE_GAIN', 'STIR_FRIED', 'COMPONENT', '120g tôm + 200g bông cải, ít dầu.'],
  'Thịt heo luộc': [330, 26, 24, 0, 'LUNCH|DINNER', 'MAIN', 'MAINTENANCE', 'BOILED', 'COMPONENT', '120g thịt heo luộc nạc vừa.'],
  'Thịt bò nướng': [340, 34, 20, 4, 'LUNCH|DINNER', 'MAIN', 'MAINTENANCE|MUSCLE_GAIN', 'GRILLED', 'COMPONENT', '120g bò nướng.'],
  'Đậu hũ sốt cà chua': [260, 16, 16, 16, 'LUNCH|DINNER', 'MAIN|SIDE', 'WEIGHT_LOSS|MAINTENANCE', 'BRAISED', 'COMPONENT', '180g đậu hũ sốt cà chua.'],
  'Đậu hũ xào nấm': [280, 18, 17, 14, 'LUNCH|DINNER', 'MAIN|SIDE', 'WEIGHT_LOSS|MAINTENANCE', 'STIR_FRIED', 'COMPONENT', 'Đậu hũ + nấm, ít dầu.'],
  'Rau muốn xào tỏi': [160, 5, 10, 14, 'LUNCH|DINNER', 'SIDE', 'WEIGHT_LOSS|MAINTENANCE', 'STIR_FRIED', 'COMPONENT', '200g rau muống xào tỏi, ít dầu.'],
  'Rau cải luộc': [60, 4, 0.5, 10, 'LUNCH|DINNER', 'SIDE', 'WEIGHT_LOSS|MAINTENANCE', 'BOILED', 'COMPONENT', '200g rau cải luộc.'],
  'Bông cải hấp': [80, 6, 0.5, 14, 'LUNCH|DINNER', 'SIDE', 'WEIGHT_LOSS|MAINTENANCE', 'STEAMED', 'COMPONENT', '200g bông cải hấp.'],
  'Trứng ốp la': [180, 13, 14, 1, 'BREAKFAST|LUNCH', 'MAIN', 'MAINTENANCE|MUSCLE_GAIN', 'FRIED', 'COMPONENT', '2 trứng ốp la ít dầu.'],
  'Trứng cuộn rau': [220, 16, 15, 6, 'BREAKFAST|LUNCH|DINNER', 'MAIN', 'WEIGHT_LOSS|MAINTENANCE|MUSCLE_GAIN', 'FRIED', 'COMPONENT', '2 trứng + rau, ít dầu.'],
  'Sữa chua hạt chia': [180, 9, 7, 20, 'SNACK|DESSERT', 'SNACK|DESSERT', 'WEIGHT_LOSS|MAINTENANCE', 'RAW', 'LIGHT', 'Sữa chua 120g + 10g chia.'],
  'Sinh tố bơ': [320, 5, 20, 34, 'SNACK', 'DRINK|DESSERT', 'WEIGHT_GAIN|MAINTENANCE', 'RAW', 'LIGHT', '1 ly vừa, hạn chế sữa đặc.'],
  'Sinh tố chuối': [240, 8, 5, 44, 'BREAKFAST|SNACK', 'DRINK|SNACK', 'MAINTENANCE|WEIGHT_GAIN', 'RAW', 'LIGHT', '1 ly chuối + sữa không đường.'],
  'Cháo gà rau củ': [360, 24, 8, 50, 'BREAKFAST|DINNER', 'MAIN|STAPLE', 'WEIGHT_LOSS|MAINTENANCE', 'SOUP', 'FULL_MEAL', '1 tô cháo gà rau củ.'],
  'Súp bí đỏ': [220, 8, 7, 32, 'BREAKFAST|DINNER|SNACK', 'SOUP|SIDE', 'WEIGHT_LOSS|MAINTENANCE', 'SOUP', 'LIGHT', '1 tô súp bí đỏ 300ml.'],
  'Súp rau củ': [180, 7, 5, 28, 'DINNER|SNACK', 'SOUP|SIDE', 'WEIGHT_LOSS|MAINTENANCE', 'SOUP', 'LIGHT', '1 tô súp rau củ 300ml.'],
  'Gỏi cuốn tôm thịt': [300, 18, 8, 38, 'SNACK|LUNCH|DINNER', 'SNACK|SIDE', 'WEIGHT_LOSS|MAINTENANCE', 'RAW', 'LIGHT', '3 cuốn tôm thịt.'],
  'Gỏi gà bắp cải': [280, 28, 10, 18, 'LUNCH|DINNER', 'MAIN|SIDE', 'WEIGHT_LOSS|MAINTENANCE|MUSCLE_GAIN', 'RAW', 'FULL_MEAL', '120g gà xé + bắp cải + ít sốt.'],
  'Cá kho tộ': [330, 28, 18, 10, 'LUNCH|DINNER', 'MAIN', 'MAINTENANCE|MUSCLE_GAIN', 'BRAISED', 'COMPONENT', '120g cá kho, chưa tính cơm.'],
  'Thịt kho tiêu': [420, 24, 32, 8, 'LUNCH|DINNER', 'MAIN', 'MAINTENANCE|WEIGHT_GAIN', 'BRAISED', 'COMPONENT', '120g thịt kho tiêu, béo cao.'],
  'Bò lúc lắc': [420, 32, 24, 18, 'LUNCH|DINNER', 'MAIN', 'MAINTENANCE|MUSCLE_GAIN', 'STIR_FRIED', 'COMPONENT', '120g bò + rau/củ, chưa tính cơm.'],
  'Cơm chiên dương châu': [680, 22, 24, 92, 'LUNCH|DINNER', 'MAIN|STAPLE', 'WEIGHT_GAIN|MAINTENANCE', 'FRIED', 'FULL_MEAL', '1 đĩa cơm chiên vừa, dầu cao.'],
  'Cơm chiên cá mặn': [720, 24, 26, 96, 'LUNCH|DINNER', 'MAIN|STAPLE', 'WEIGHT_GAIN|MAINTENANCE', 'FRIED', 'FULL_MEAL', '1 đĩa vừa, natri cao.'],
  'Bún mọc': [500, 25, 14, 68, 'BREAKFAST|LUNCH', 'MAIN|STAPLE', 'MAINTENANCE', 'SOUP', 'FULL_MEAL', '1 tô bún mọc vừa.'],
  'Bún gà nấm': [480, 28, 10, 66, 'BREAKFAST|LUNCH|DINNER', 'MAIN|STAPLE', 'WEIGHT_LOSS|MAINTENANCE', 'SOUP', 'FULL_MEAL', '1 tô vừa.'],
  'Bún chay': [420, 16, 10, 68, 'BREAKFAST|LUNCH|DINNER', 'MAIN|STAPLE', 'WEIGHT_LOSS|MAINTENANCE', 'SOUP', 'FULL_MEAL', '1 tô bún chay vừa, có đậu hũ.'],
  'Cơm cháy kho quẹt': [650, 14, 30, 84, 'SNACK|LUNCH', 'SNACK|STAPLE', 'WEIGHT_GAIN|MAINTENANCE', 'FRIED', 'LIGHT', '1 phần vừa, dầu/mỡ và natri cao.'],
  'Cá ngừ kho dưa': [300, 32, 12, 14, 'LUNCH|DINNER', 'MAIN', 'WEIGHT_LOSS|MAINTENANCE|MUSCLE_GAIN', 'BRAISED', 'COMPONENT', '120g cá ngừ kho dưa.'],
  'Gà xào sả ớt': [350, 32, 20, 8, 'LUNCH|DINNER', 'MAIN', 'MAINTENANCE|MUSCLE_GAIN', 'STIR_FRIED', 'COMPONENT', '120g gà xào, ít dầu.'],
  'Bò xào cần tây': [330, 32, 18, 12, 'LUNCH|DINNER', 'MAIN|SIDE', 'WEIGHT_LOSS|MAINTENANCE|MUSCLE_GAIN', 'STIR_FRIED', 'COMPONENT', '120g bò + cần tây.'],
  'Thịt băm sốt đậu': [420, 28, 26, 16, 'LUNCH|DINNER', 'MAIN', 'MAINTENANCE|WEIGHT_GAIN', 'BRAISED', 'COMPONENT', 'Thịt băm + đậu hũ, 1 phần vừa.'],
  'Lẩu nấm chay': [360, 18, 10, 50, 'LUNCH|DINNER', 'MAIN|SOUP', 'WEIGHT_LOSS|MAINTENANCE', 'SOUP', 'FULL_MEAL', '1 khẩu phần cá nhân, thêm ít bún.'],
  'Lẩu gà lá é': [540, 35, 18, 56, 'LUNCH|DINNER', 'MAIN|SOUP', 'MAINTENANCE|MUSCLE_GAIN', 'SOUP', 'FULL_MEAL', '1 khẩu phần cá nhân, tính ít bún.'],
  'Lẩu hải sản': [520, 38, 12, 58, 'LUNCH|DINNER', 'MAIN|SOUP', 'MAINTENANCE|MUSCLE_GAIN', 'SOUP', 'FULL_MEAL', '1 khẩu phần cá nhân.'],
  'Lẩu cá': [480, 34, 10, 58, 'LUNCH|DINNER', 'MAIN|SOUP', 'WEIGHT_LOSS|MAINTENANCE|MUSCLE_GAIN', 'SOUP', 'FULL_MEAL', '1 khẩu phần cá nhân.'],
  'Mực hấp gừng': [170, 30, 3, 4, 'LUNCH|DINNER', 'MAIN', 'WEIGHT_LOSS|MAINTENANCE|MUSCLE_GAIN', 'STEAMED', 'COMPONENT', '150g mực hấp.'],
  'Mực xào cần': [260, 30, 10, 12, 'LUNCH|DINNER', 'MAIN|SIDE', 'WEIGHT_LOSS|MAINTENANCE|MUSCLE_GAIN', 'STIR_FRIED', 'COMPONENT', '150g mực + cần, ít dầu.'],
  'Tôm rim': [280, 28, 10, 18, 'LUNCH|DINNER', 'MAIN', 'MAINTENANCE|MUSCLE_GAIN', 'BRAISED', 'COMPONENT', '150g tôm rim, có đường/nước mắm.'],
  'Súp cua': [230, 18, 6, 28, 'BREAKFAST|SNACK|DINNER', 'SOUP|SNACK', 'WEIGHT_LOSS|MAINTENANCE', 'SOUP', 'LIGHT', '1 chén/tô nhỏ 300ml.'],
  'Cháo tôm': [340, 24, 6, 52, 'BREAKFAST|DINNER', 'MAIN|STAPLE', 'WEIGHT_LOSS|MAINTENANCE', 'SOUP', 'FULL_MEAL', '1 tô cháo tôm.'],
  'Cháo cá hồi': [420, 26, 16, 50, 'BREAKFAST|DINNER', 'MAIN|STAPLE', 'MAINTENANCE|MUSCLE_GAIN', 'SOUP', 'FULL_MEAL', '1 tô cháo cá hồi.'],
  'Cơm rong biển cá hồi': [600, 34, 20, 70, 'LUNCH|DINNER', 'MAIN|STAPLE', 'MAINTENANCE|MUSCLE_GAIN', 'RAW', 'FULL_MEAL', 'Cơm 150g + cá hồi + rong biển.'],
  'Cơm sườn nướng mật ong': [780, 32, 32, 88, 'LUNCH|DINNER', 'MAIN|STAPLE', 'WEIGHT_GAIN|MAINTENANCE', 'GRILLED', 'FULL_MEAL', 'Cơm + sườn nướng mật ong, đường/dầu cao.'],
  'Mì trứng gà': [520, 28, 16, 66, 'BREAKFAST|LUNCH', 'MAIN|STAPLE', 'MAINTENANCE', 'SOUP', 'FULL_MEAL', '1 tô mì trứng gà.'],
  'Mì xào bò': [680, 32, 24, 82, 'LUNCH|DINNER', 'MAIN|STAPLE', 'WEIGHT_GAIN|MAINTENANCE', 'STIR_FRIED', 'FULL_MEAL', '1 đĩa mì xào bò.'],
  'Phở xào bò': [720, 34, 26, 88, 'LUNCH|DINNER', 'MAIN|STAPLE', 'WEIGHT_GAIN|MAINTENANCE', 'STIR_FRIED', 'FULL_MEAL', '1 đĩa phở xào bò, dầu cao.'],
  'Nui xào bò': [690, 34, 24, 84, 'LUNCH|DINNER', 'MAIN|STAPLE', 'WEIGHT_GAIN|MAINTENANCE', 'STIR_FRIED', 'FULL_MEAL', '1 đĩa nui xào bò.'],
  'Bánh đa cua': [540, 26, 16, 72, 'BREAKFAST|LUNCH', 'MAIN|STAPLE', 'MAINTENANCE', 'SOUP', 'FULL_MEAL', '1 tô bánh đa cua.'],
  'Bánh canh cua': [560, 28, 16, 76, 'BREAKFAST|LUNCH', 'MAIN|STAPLE', 'MAINTENANCE', 'SOUP', 'FULL_MEAL', '1 tô bánh canh cua.'],
  'Bánh canh giò heo': [720, 28, 34, 72, 'LUNCH|DINNER', 'MAIN|STAPLE', 'WEIGHT_GAIN|MAINTENANCE', 'SOUP', 'FULL_MEAL', '1 tô vừa, giò heo béo cao.'],
  'Bánh canh gà': [520, 28, 12, 74, 'BREAKFAST|LUNCH', 'MAIN|STAPLE', 'MAINTENANCE', 'SOUP', 'FULL_MEAL', '1 tô bánh canh gà.'],
  'Xôi gà': [650, 30, 20, 86, 'BREAKFAST|LUNCH', 'MAIN|STAPLE', 'WEIGHT_GAIN|MAINTENANCE', 'STEAMED', 'FULL_MEAL', '1 phần xôi gà vừa.'],
  'Xôi đậu xanh': [500, 14, 10, 88, 'BREAKFAST|SNACK', 'STAPLE|SNACK', 'WEIGHT_GAIN|MAINTENANCE', 'STEAMED', 'FULL_MEAL', '1 phần xôi đậu xanh vừa.'],
  'Bún mọc sườn': [580, 30, 20, 68, 'BREAKFAST|LUNCH', 'MAIN|STAPLE', 'MAINTENANCE|WEIGHT_GAIN', 'SOUP', 'FULL_MEAL', '1 tô bún mọc sườn.'],
  'Bún sườn non': [600, 32, 22, 68, 'BREAKFAST|LUNCH', 'MAIN|STAPLE', 'MAINTENANCE|WEIGHT_GAIN', 'SOUP', 'FULL_MEAL', '1 tô bún sườn non.'],
  'Cơm chiên tôm': [670, 28, 22, 90, 'LUNCH|DINNER', 'MAIN|STAPLE', 'WEIGHT_GAIN|MAINTENANCE', 'FRIED', 'FULL_MEAL', '1 đĩa cơm chiên tôm vừa.'],
  'Cơm đậu hũ rau': [500, 22, 16, 68, 'LUNCH|DINNER', 'MAIN|STAPLE', 'WEIGHT_LOSS|MAINTENANCE', 'BRAISED', 'FULL_MEAL', '150g cơm + đậu hũ + rau.'],
  'Cơm chay nấm': [520, 18, 14, 78, 'LUNCH|DINNER', 'MAIN|STAPLE', 'WEIGHT_LOSS|MAINTENANCE', 'STIR_FRIED', 'FULL_MEAL', 'Cơm + nấm + rau + đậu/đạm chay.'],
  'Cơm gà xối mỡ': [850, 34, 38, 90, 'LUNCH|DINNER', 'MAIN|STAPLE', 'WEIGHT_GAIN', 'FRIED', 'FULL_MEAL', 'Cơm + gà xối mỡ, dầu/mỡ cao.'],
};

const columns = [
  'id',
  'name',
  'currentCategory',
  'currentCalories',
  'currentProtein',
  'currentFat',
  'currentCarbs',
  'recommendedCalories',
  'recommendedProtein',
  'recommendedFat',
  'recommendedCarbs',
  'recommendedCategory',
  'recommendedMealTimeTags',
  'recommendedMealRoles',
  'recommendedGoalTags',
  'recommendedCookingMethod',
  'recommendedPortionType',
  'servingNote',
  'manualReviewNote',
];

const escapeCsv = (value) => {
  if (value === null || value === undefined) return '';
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const categoryFromRoles = (name, tags, roles) => {
  if (roles.includes('DRINK')) return 'Đồ uống';
  if (roles.includes('DESSERT')) return 'Tráng miệng';
  if (roles.includes('SOUP')) return name.includes('Canh') ? 'Canh' : 'Món nước';
  if (name.includes('Cơm')) return 'Cơm';
  if (name.includes('Bún')) return 'Bún';
  if (name.includes('Mì') || name.includes('Nui') || name.includes('Miến')) return 'Mì/Miến/Nui';
  if (roles.includes('SNACK')) return 'Ăn nhẹ';
  return tags;
};

async function main() {
  const outputPath = process.argv[2] || path.resolve(__dirname, '../exports/food-nutrition-admin-manual-review.csv');
  const foods = await prisma.foodItem.findMany({
    orderBy: { id: 'asc' },
    select: {
      id: true,
      name: true,
      category: true,
      calories: true,
      protein: true,
      fat: true,
      carbs: true,
    },
  });

  const rows = foods.map((food) => {
    const item = data[food.name];
    if (!item) {
      return [
        food.id,
        food.name,
        food.category,
        food.calories,
        food.protein,
        food.fat,
        food.carbs,
        '',
        '',
        '',
        '',
        food.category,
        '',
        '',
        '',
        '',
        '',
        '',
        'Chưa có mapping đề xuất, cần review thủ công.',
      ];
    }

    const [
      calories,
      protein,
      fat,
      carbs,
      mealTimeTags,
      mealRoles,
      goalTags,
      cookingMethod,
      portionType,
      servingNote,
    ] = item;

    return [
      food.id,
      food.name,
      food.category,
      food.calories,
      food.protein,
      food.fat,
      food.carbs,
      calories,
      protein,
      fat,
      carbs,
      categoryFromRoles(food.name, food.category, mealRoles),
      mealTimeTags,
      mealRoles,
      goalTags,
      cookingMethod,
      portionType,
      servingNote,
      '',
    ];
  });

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(
    outputPath,
    `${columns.join(',')}\n${rows.map((row) => row.map(escapeCsv).join(',')).join('\n')}\n`,
    'utf8',
  );

  const missing = rows.filter((row) => !row[7]).length;
  console.log(`Exported ${rows.length} rows to ${outputPath}`);
  if (missing > 0) console.log(`Missing recommendation rows: ${missing}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
