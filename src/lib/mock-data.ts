import {
  Customer, Vendor, Material, Product, Process, Workstation,
  SalesOrder, PurchaseOrder, Inventory
} from './types';

// 客户模拟数据（来自秒账真实数据）
export const mockCustomers: Customer[] = [
  { id: '1', code: 'C01', name: '天一纺织', contact: 'Max 徐', phone: '13738004619', address: '', remark: '' },
  { id: '2', code: 'C03', name: '托科斯', contact: 'Sancy', phone: '17621127991', address: '', remark: '' },
  { id: '3', code: 'C04', name: '巧克力玩家', contact: '汤剑伟(汤总)', phone: '13817156428', address: '', remark: '' },
  { id: '4', code: 'C05', name: '白领仕', contact: '沃小娟(沃总)', phone: '15862629882', address: '', remark: '' },
  { id: '5', code: 'C06', name: '沃兔', contact: '邵建君(邵总)', phone: '13801667612', address: '', remark: '' },
  { id: '6', code: 'C07', name: '森创服饰', contact: '杨慧(杨总)', phone: '13916602886', address: '', remark: '' },
  { id: '7', code: 'C08', name: '奇翰', contact: '赖洪奇(赖总)', phone: '13816105435', address: '', remark: '' },
  { id: '8', code: 'C09', name: '易景', contact: '周杰(周总)', phone: '18602529333', address: '', remark: '' },
  { id: '9', code: 'C10', name: '衣架', contact: 'Even 曲', phone: '13761422426', address: '', remark: '' },
  { id: '10', code: 'C11', name: '素奇科技', contact: '阿海', phone: '13761422426', address: '', remark: '' },
  { id: '11', code: 'C12', name: 'NEIWAI', contact: '当当', phone: '15862629882', address: '', remark: '' },
  { id: '12', code: 'C12-1', name: 'NEIWAI维珍妮越南（嘉合越）', contact: '胡帅', phone: '15989324950', address: '', remark: '' },
  { id: '13', code: 'C12-2', name: 'NEIWAI广州佳达', contact: 'becky', phone: '86-20-84876008 Ext.3361', address: '', remark: '' },
  { id: '14', code: 'C12-3', name: 'NEIWAI东佑', contact: '', phone: '', address: '', remark: '' },
  { id: '15', code: 'C12-4', name: 'NEIWAI维珍妮深圳', contact: 'Iris Chen/陈虹延', phone: '18218681500', address: '', remark: '' },
  { id: '16', code: 'C12-5', name: 'NEIWAI盐城暖尚', contact: '小何', phone: '13916604725', address: '', remark: '' },
  { id: '17', code: 'C12-6', name: 'NEIWAI上海旭美隆', contact: '孙桂芬', phone: '15026633084', address: '', remark: '' },
  { id: '18', code: 'C12-7', name: 'NEIWAI悦盛', contact: '张晓斌', phone: '13715895888', address: '', remark: '' },
  { id: '19', code: 'C12-8', name: 'NEIWAI卓跃', contact: '陈波', phone: '13322914137', address: '', remark: '' },
  { id: '20', code: 'C12-9', name: 'NEIWAI川行', contact: '邹洋', phone: '15219942034', address: '', remark: '' },
  { id: '21', code: 'C12-2', name: 'KESTOS广州佳达', contact: 'becky', phone: '86-20-84876008 Ext.3361', address: '', remark: '' },
  { id: '22', code: 'C13', name: '海宁勇者', contact: '周', phone: '16601748697', address: '', remark: '' },
  { id: '23', code: 'C14', name: '得盛', contact: '沈佳沁', phone: '18757365168', address: '', remark: '' },
  { id: '24', code: 'C15', name: '上海采高', contact: '吴仪', phone: '19370688373', address: '', remark: '' },
];

// 供应商模拟数据（来自秒账真实数据）
export const mockVendors: Vendor[] = [
  { id: '1', code: 'S01', name: '百思蓝德', contact: '', phone: '', address: '', remark: '' },
  { id: '2', code: 'S02', name: '捷成印刷', contact: '金超喆', phone: '15706746202', address: '', remark: '' },
  { id: '3', code: 'S03', name: '易景', contact: '', phone: '', address: '', remark: '' },
  { id: '4', code: 'S04', name: '得盛', contact: '', phone: '', address: '', remark: '' },
  { id: '5', code: 'S05', name: '万强', contact: '', phone: '', address: '', remark: '' },
  { id: '6', code: 'S06', name: '三井', contact: '', phone: '', address: '', remark: '' },
  { id: '7', code: 'S07', name: '中嘉', contact: '', phone: '', address: '', remark: '' },
  { id: '8', code: 'S08', name: '华顺', contact: '', phone: '', address: '', remark: '' },
  { id: '9', code: 'S09', name: '金华优昊', contact: '', phone: '', address: '', remark: '' },
  { id: '10', code: 'S10', name: '天益', contact: '', phone: '', address: '', remark: '' },
  { id: '11', code: 'S11', name: '鑫唛子', contact: '', phone: '', address: '', remark: '' },
  { id: '12', code: 'S12', name: '溢泓堂', contact: '', phone: '', address: '', remark: '' },
  { id: '13', code: 'S13', name: '释海', contact: '', phone: '', address: '', remark: '' },
  { id: '14', code: 'S14', name: '超耐斯', contact: '', phone: '', address: '', remark: '' },
  { id: '15', code: 'S15', name: '凯优', contact: '', phone: '', address: '', remark: '' },
  { id: '16', code: 'S16', name: '梓宸星', contact: '', phone: '', address: '', remark: '' },
  { id: '17', code: 'S17', name: '起印', contact: '', phone: '', address: '', remark: '' },
  { id: '18', code: 'S18', name: '肖王包装', contact: '高总', phone: '', address: '', remark: '' },
  { id: '19', code: 'S19', name: '谦林包装', contact: '兰小姐', phone: '18968774817', address: '', remark: '' },
  { id: '20', code: 'S20', name: '辰跃纸业', contact: '周振超', phone: '18019228336', address: '', remark: '' },
  { id: '21', code: 'S21', name: '嘉小友', contact: '傅卿', phone: '13567337973', address: '', remark: '' },
  { id: '22', code: 'S22', name: '杭州明牛', contact: '', phone: '', address: '', remark: '' },
];

// 物料模拟数据
export const mockMaterials: Material[] = [
  { id: '1', code: 'M001', name: '双铜纸', spec: '128g', unit: '张', category: '纸张', remark: '' },
  { id: '2', code: 'M002', name: '双铜纸', spec: '157g', unit: '张', category: '纸张', remark: '' },
  { id: '3', code: 'M003', name: '双铜纸', spec: '200g', unit: '张', category: '纸张', remark: '' },
  { id: '4', code: 'M004', name: '胶版纸', spec: '120g', unit: '张', category: '纸张', remark: '' },
  { id: '5', code: 'M005', name: 'UV油墨', spec: '红', unit: '公斤', category: '油墨', remark: '' },
  { id: '6', code: 'M006', name: 'UV油墨', spec: '蓝', unit: '公斤', category: '油墨', remark: '' },
  { id: '7', code: 'M007', name: 'PET覆膜', spec: '薄', unit: '米', category: '覆膜材料', remark: '' },
  { id: '8', code: 'M008', name: 'OPP覆膜', spec: '厚', unit: '米', category: '覆膜材料', remark: '' },
  { id: '9', code: 'M009', name: '粘鼠胶', spec: '普通', unit: '桶', category: '辅料', remark: '' },
  { id: '10', code: 'M010', name: '橡皮布', spec: '标准', unit: '条', category: '辅料', remark: '' },
];

// 产品模拟数据（来自秒账真实数据）
export const mockProducts: Product[] = [
  { id: '1', code: 'C01HT0001', name: 'DB 通用吊牌', spec: '', unit: '个', category: '吊牌', customer: 'C01-天一纺织', purchasePrice: 0.18, salePrice: 0.23, remark: '' },
  { id: '2', code: 'C01HT0002', name: 'DB 大号吊牌', spec: '', unit: '个', category: '吊牌', customer: 'C01-天一纺织', purchasePrice: 0, salePrice: 0, remark: '' },
  { id: '3', code: 'C01HT0003', name: 'DB 吊牌A款', spec: '', unit: '个', category: '吊牌', customer: 'C01-天一纺织', purchasePrice: 0, salePrice: 0, remark: '' },
  { id: '4', code: 'C01HT0006', name: 'DB 白色吊牌', spec: '', unit: '个', category: '吊牌', customer: 'C01-天一纺织', purchasePrice: 0.16, salePrice: 0.2, remark: '' },
  { id: '5', code: 'C01HT0007', name: 'DB 黑色吊牌', spec: '', unit: '个', category: '吊牌', customer: 'C01-天一纺织', purchasePrice: 0.34, salePrice: 0, remark: '' },
  { id: '6', code: 'C01HT0008', name: 'DB 红色吊牌', spec: '', unit: '个', category: '吊牌', customer: 'C01-天一纺织', purchasePrice: 0, salePrice: 0, remark: '' },
  { id: '7', code: 'C01HT0009', name: 'DB 蓝色吊牌', spec: '', unit: '个', category: '吊牌', customer: 'C01-天一纺织', purchasePrice: 0, salePrice: 0, remark: '' },
  { id: '8', code: 'C01HT0013', name: 'CAD吊牌', spec: '', unit: '个', category: '吊牌', customer: 'C05-白领仕', purchasePrice: 0.08, salePrice: 0.1, remark: '' },
  { id: '9', code: 'C05HT0016', name: '史努比吊牌', spec: '', unit: '个', category: '吊牌', customer: 'C05-白领仕', purchasePrice: 0, salePrice: 0.07, remark: '' },
  { id: '10', code: 'C06HT0003', name: 'Blizzcon鲨鱼吊牌', spec: '', unit: '个', category: '吊牌', customer: 'C06-沃兔', purchasePrice: 0, salePrice: 0, remark: '' },
  { id: '11', code: 'C09HT0004', name: '易景红色吊牌', spec: '', unit: '个', category: '吊牌', customer: 'C09-易景', purchasePrice: 0, salePrice: 0, remark: '' },
  { id: '12', code: 'C01WO0002', name: 'GWEST 织标', spec: '', unit: '个', category: '织标', customer: 'C01-天一纺织', purchasePrice: 0.12, salePrice: 0.28, remark: '' },
  { id: '13', code: 'C01WO0003', name: 'GWEST 织标', spec: '', unit: '个', category: '织标', customer: 'C01-天一纺织', purchasePrice: 0, salePrice: 0, remark: '' },
  { id: '14', code: 'C01WO0004', name: 'GWEST 织标', spec: '', unit: '个', category: '织标', customer: 'C01-天一纺织', purchasePrice: 0, salePrice: 0, remark: '' },
  { id: '15', code: 'C01WO0005', name: 'GWEST 织标', spec: '', unit: '个', category: '织标', customer: 'C01-天一纺织', purchasePrice: 0, salePrice: 0, remark: '' },
  { id: '16', code: 'C01WO0006', name: 'GWEST 织标', spec: '', unit: '个', category: '织标', customer: 'C01-天一纺织', purchasePrice: 0, salePrice: 0, remark: '' },
  { id: '17', code: 'C05WO0007', name: '史努比织标', spec: '', unit: '个', category: '织标', customer: 'C05-白领仕', purchasePrice: 0, salePrice: 0.18, remark: '' },
  { id: '18', code: 'C01WA0004', name: 'DB 洗标', spec: '', unit: '个', category: '洗标', customer: 'C01-天一纺织', purchasePrice: 0, salePrice: 0, remark: '' },
  { id: '19', code: 'C01WA0005', name: 'DB 洗标', spec: '', unit: '个', category: '洗标', customer: 'C01-天一纺织', purchasePrice: 0, salePrice: 0, remark: '' },
  { id: '20', code: 'C01ST0001', name: 'DB 条形码贴纸', spec: '', unit: '个', category: '贴纸', customer: 'C01-天一纺织', purchasePrice: 0, salePrice: 0, remark: '' },
  { id: '21', code: 'C01ST0002', name: 'DB 不干胶', spec: '', unit: '个', category: '贴纸', customer: 'C01-天一纺织', purchasePrice: 0.1, salePrice: 0.12, remark: '' },
  { id: '22', code: 'C03ST0005', name: '8818不干胶贴纸', spec: '', unit: '个', category: '贴纸', customer: 'C03-托科斯', purchasePrice: 0.05, salePrice: 0.21, remark: '' },
  { id: '23', code: 'C03ST0007', name: '8895DM外标签', spec: '', unit: '个', category: '贴纸', customer: 'C03-托科斯', purchasePrice: 0.1, salePrice: 0.26, remark: '' },
  { id: '24', code: 'C01OT0001', name: 'DB 贴纸', spec: '', unit: '个', category: '其他', customer: 'C01-天一纺织', purchasePrice: 0, salePrice: 0, remark: '' },
  { id: '25', code: 'C01OT0002', name: 'DB 合格证', spec: '', unit: '个', category: '其他', customer: 'C01-天一纺织', purchasePrice: 0, salePrice: 0, remark: '' },
  { id: '26', code: 'C01OT0003', name: 'DB 吊绳吊粒', spec: '', unit: '个', category: '其他', customer: 'C01-天一纺织', purchasePrice: 0.03, salePrice: 0.1, remark: '' },
  { id: '27', code: 'C01OT0004', name: 'DB 吊粒', spec: '', unit: '个', category: '其他', customer: 'C01-天一纺织', purchasePrice: 0, salePrice: 0, remark: '' },
  { id: '28', code: 'C01PB0001', name: 'DB 塑料袋', spec: '', unit: '个', category: '包装袋', customer: 'C01-天一纺织', purchasePrice: 1.1, salePrice: 0.86, remark: '' },
  { id: '29', code: 'C01PB0002', name: 'DB 包装袋', spec: '', unit: '个', category: '包装袋', customer: 'C01-天一纺织', purchasePrice: 0, salePrice: 0, remark: '' },
  { id: '30', code: 'C15HT0001', name: 'coco金贴背卡', spec: '', unit: '个', category: '吊牌', customer: 'C15-上海采高', purchasePrice: 0, salePrice: 0.088, remark: '' },
];

// 工艺模拟数据
export const mockProcesses: Process[] = [
  { id: '1', name: '烫金', category: '表面处理', unitPrice: 0.15, unit: '件', outsource: true, hasDie: true, remark: '金色' },
  { id: '2', name: '烫银', category: '表面处理', unitPrice: 0.15, unit: '件', outsource: true, hasDie: true, remark: '银色' },
  { id: '3', name: '局部UV', category: '表面处理', unitPrice: 0.10, unit: '件', outsource: true, remark: '局部UV' },
  { id: '4', name: '覆膜', category: '表面处理', unitPrice: 0.08, unit: '件', outsource: false, remark: '亮膜/哑膜' },
  { id: '5', name: '压纹', category: '表面处理', unitPrice: 0.12, unit: '件', outsource: true, remark: '' },
  { id: '6', name: '模切', category: '成型', unitPrice: 0.05, unit: '件', outsource: false, hasDie: true, remark: '' },
  { id: '7', name: '糊盒', category: '印后加工', unitPrice: 0.20, unit: '件', outsource: true, remark: '' },
  { id: '8', name: '打码', category: '印刷', unitPrice: 0.02, unit: '件', outsource: false, remark: '' },
];

// 工序模拟数据
export const mockWorkstations: Workstation[] = [
  { id: '1', name: '制稿', sequence: 1, outsource: false, unitPrice: 0.10, unit: '件', remark: '设计输出' },
  { id: '2', name: '买纸', sequence: 2, outsource: false, unitPrice: 0.05, unit: '件', remark: '采购纸张' },
  { id: '3', name: '裁切', sequence: 3, outsource: false, unitPrice: 0.08, unit: '件', remark: '' },
  { id: '4', name: '印刷', sequence: 4, outsource: false, unitPrice: 0.15, unit: '色令/件', remark: '' },
  { id: '5', name: '覆膜', sequence: 5, outsource: false, unitPrice: 0.12, unit: '件', remark: '' },
  { id: '6', name: '烫金', sequence: 6, outsource: true, unitPrice: 0.20, unit: '件', remark: '可委外' },
  { id: '7', name: 'UV', sequence: 7, outsource: true, unitPrice: 0.18, unit: '件', remark: '可委外' },
  { id: '8', name: '糊盒', sequence: 8, outsource: true, unitPrice: 0.25, unit: '件', remark: '可委外' },
  { id: '9', name: '模切', sequence: 9, outsource: false, unitPrice: 0.10, unit: '件', remark: '' },
  { id: '10', name: '清废', sequence: 10, outsource: false, unitPrice: 0.05, unit: '件', remark: '' },
  { id: '11', name: '包装', sequence: 11, outsource: false, unitPrice: 0.08, unit: '件', remark: '' },
  { id: '12', name: '出货', sequence: 12, outsource: false, unitPrice: 0.06, unit: '件', remark: '' },
];

// 销售订单模拟数据
export const mockSalesOrders: SalesOrder[] = [
  { id: '1', 单号: 'XS20260415001', 客户名称: 'C05-白领仕', 日期: '2026-04-15', 合同金额: 3780.00, 已送货: 0, 未收款项: 3780.00, 已收款: 0, 收款状态: '未收款', 送货状态: '未送货',
  开票状态: '未开票', 制单人: '李紫璘', 业务员: '李紫璘', 计划收款日期: '2026-05-15', 备注: '急单，优先处理' },
  { id: '2', 单号: 'XS20260414002', 客户名称: 'C12-NEIWAI川行', 日期: '2026-04-14', 合同金额: 14560.00, 已送货: 14560.00, 未收款项: 0, 已收款: 14560.00, 收款状态: '全部收款', 送货状态: '全部送货',
  开票状态: '未开票', 制单人: '李紫璘', 业务员: '李紫璘', 计划收款日期: '2026-04-30', 备注: '' },
  { id: '3', 单号: 'XS20260413003', 客户名称: 'C01-天一纺织', 日期: '2026-04-13', 合同金额: 5680.00, 已送货: 3000.00, 未收款项: 2680.00, 已收款: 2000.00, 收款状态: '部分收款', 送货状态: '部分送货',
  开票状态: '未开票', 制单人: '李紫璘', 业务员: '李紫璘', 计划收款日期: '2026-04-28', 备注: '分批送货' },
  { id: '4', 单号: 'XS20260412004', 客户名称: 'C10-衣架', 日期: '2026-04-12', 合同金额: 1300.00, 已送货: 1300.00, 未收款项: 0, 已收款: 1300.00, 收款状态: '全部收款', 送货状态: '全部送货',
  开票状态: '未开票', 制单人: '李紫璘', 业务员: '李紫璘', 计划收款日期: '2026-04-25', 备注: '' },
  { id: '5', 单号: 'XS20260411005', 客户名称: 'C06-沃兔', 日期: '2026-04-11', 合同金额: 8900.00, 已送货: 5000.00, 未收款项: 3900.00, 已收款: 5000.00, 收款状态: '部分收款', 送货状态: '部分送货',
  开票状态: '未开票', 制单人: '李紫璘', 业务员: '王明', 计划收款日期: '2026-05-01', 备注: '客户要求加急' },
  { id: '6', 单号: 'XS20260410006', 客户名称: 'C15-上海采高', 日期: '2026-04-10', 合同金额: 3120.80, 已送货: 3420.80, 未收款项: -300.00, 已收款: 3420.80, 收款状态: '全部收款', 送货状态: '全部送货',
  开票状态: '未开票', 制单人: '李紫璘', 业务员: '王明', 计划收款日期: '2026-04-20', 备注: '实际送货多了，超出部分次月结' },
  { id: '7', 单号: 'XS20260409007', 客户名称: 'C12-NEIWAI卓跃', 日期: '2026-04-09', 合同金额: 20552.00, 已送货: 20552.00, 未收款项: 0, 已收款: 20552.00, 收款状态: '全部收款', 送货状态: '全部送货',
  开票状态: '未开票', 制单人: '李紫璘', 业务员: '李紫璘', 计划收款日期: '2026-04-25', 备注: '' },
  { id: '8', 单号: 'XS20260408008', 客户名称: 'C05-白领仕', 日期: '2026-04-08', 合同金额: 4500.00, 已送货: 0, 未收款项: 4500.00, 已收款: 0, 收款状态: '未收款', 送货状态: '未送货',
  开票状态: '未开票', 制单人: '李紫璘', 业务员: '李紫璘', 计划收款日期: '2026-05-08', 备注: '草稿' },
];

// 采购订单模拟数据
export const mockPurchaseOrders: PurchaseOrder[] = [
  { id: '1', 单号: 'CG20260415001', 供应商名称: 'S20-辰跃纸业', 日期: '2026-04-15', 合同金额: 50000.00, 已收货: 0, 未付款: 50000.00, 已付款: 0, 付款状态: '未付款', 收货状态: '未收货',
  开票状态: '未开票', 制单人: '李紫璘', 业务员: '李紫璘', 计划付款日期: '2026-05-15', 收货地址: '上海市青浦区', 备注: '双铜纸128g' },
  { id: '2', 单号: 'CG20260412002', 供应商名称: 'S19-谦林包装', 日期: '2026-04-12', 合同金额: 28000.00, 已收货: 28000.00, 未付款: 0, 已付款: 25000.00, 付款状态: '部分付款', 收货状态: '全部收货',
  开票状态: '未开票', 制单人: '李紫璘', 业务员: '李紫璘', 计划付款日期: '2026-05-12', 收货地址: '上海市青浦区', 备注: '塑料袋一批' },
  { id: '3', 单号: 'CG20260410003', 供应商名称: 'S18-肖王包装', 日期: '2026-04-10', 合同金额: 6000.00, 已收货: 6000.00, 未付款: 0, 已付款: 6000.00, 付款状态: '全部付款', 收货状态: '全部收货',
  开票状态: '未开票', 制单人: '李紫璘', 业务员: '王明', 计划付款日期: '2026-04-25', 收货地址: '上海市青浦区', 备注: '' },
  { id: '4', 单号: 'CG20260408004', 供应商名称: 'S17-起印', 日期: '2026-04-08', 合同金额: 2300.00, 已收货: 2300.00, 未付款: 0, 已付款: 2300.00, 付款状态: '全部付款', 收货状态: '全部收货',
  开票状态: '未开票', 制单人: '李紫璘', 业务员: '李紫璘', 计划付款日期: '2026-04-20', 收货地址: '上海市青浦区', 备注: '打样费' },
  { id: '5', 单号: 'CG20260405005', 供应商名称: 'S21-嘉小友', 日期: '2026-04-05', 合同金额: 15800.00, 已收货: 12000.00, 未付款: 3800.00, 已付款: 12000.00, 付款状态: '部分付款', 收货状态: '部分收货',
  开票状态: '未开票', 制单人: '李紫璘', 业务员: '王明', 计划付款日期: '2026-05-05', 收货地址: '上海市青浦区', 备注: '分批到货' },
];

// 库存模拟数据
export const mockInventory: Inventory[] = [
  { id: '1', 产品名称: 'GWEST 织标', 货号: 'C01WO0001', 分类: '成品', 单位: '个', 当前库存: 15000, 安全库存: 5000, 采购在途: 10000, 销售在途: 3000, 备注: '' },
  { id: '2', 产品名称: 'GWEST 织标', 货号: 'C01WO0002', 分类: '成品', 单位: '个', 当前库存: 8000, 安全库存: 3000, 采购在途: 0, 销售在途: 1500, 备注: '5XB规格' },
  { id: '3', 产品名称: 'GWEST 织标', 货号: 'C01WO0003', 分类: '成品', 单位: '个', 当前库存: 12000, 安全库存: 4000, 采购在途: 5000, 销售在途: 2000, 备注: '6XB规格' },
  { id: '4', 产品名称: 'GWEST 吊牌', 货号: 'C01HT0001', 分类: '成品', 单位: '个', 当前库存: 25000, 安全库存: 10000, 采购在途: 0, 销售在途: 5000, 备注: '' },
  { id: '5', 产品名称: '双铜纸128g', 货号: 'M001', 分类: '原材料', 单位: '张', 当前库存: 50000, 安全库存: 20000, 采购在途: 100000, 销售在途: 0, 备注: '' },
  { id: '6', 产品名称: '双铜纸157g', 货号: 'M002', 分类: '原材料', 单位: '张', 当前库存: 35000, 安全库存: 15000, 采购在途: 50000, 销售在途: 0, 备注: '' },
  { id: '7', 产品名称: '塑料袋PE', 货号: 'M010', 分类: '辅料', 单位: '个', 当前库存: 5000, 安全库存: 2000, 采购在途: 10000, 销售在途: 0, 备注: '' },
  { id: '8', 产品名称: 'GWEST 洗标', 货号: 'C01WA0001', 分类: '成品', 单位: '个', 当前库存: 40000, 安全库存: 15000, 采购在途: 20000, 销售在途: 8000, 备注: '' },
];

// 启用模拟数据模式
export const USE_MOCK_DATA = false;
