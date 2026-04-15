import {
  Customer, Vendor, Material, Product, Process, Workstation
} from './types';

// 客户模拟数据
export const mockCustomers: Customer[] = [
  { id: '1', code: 'C001', name: '李宁体育', contact: '张经理', phone: '13800138001', address: '北京朝阳区', remark: '长期客户' },
  { id: '2', code: 'C002', name: '安踏集团', contact: '王总', phone: '13900139002', address: '厦门思明区', remark: '' },
  { id: '3', code: 'C003', name: '特步国际', contact: '刘小姐', phone: '13700137003', address: '泉州鲤城区', remark: '月结30天' },
  { id: '4', code: 'C004', name: '361度', contact: '陈经理', phone: '13600136004', address: '广州天河区', remark: '' },
  { id: '5', code: 'C005', name: '鸿星尔克', contact: '林总', phone: '13500135005', address: '泉州晋江市', remark: '新客户' },
];

// 供应商模拟数据
export const mockVendors: Vendor[] = [
  { id: '1', code: 'V001', name: '金霸王纸张', contact: '黄老板', phone: '13888138001', address: '广东东莞', remark: '纸张供应商' },
  { id: '2', code: 'V002', name: '中油油墨', contact: '李经理', phone: '13888138002', address: '江苏苏州', remark: '油墨供应商' },
  { id: '3', code: 'V003', name: '永新覆膜', contact: '周总', phone: '13888138003', address: '浙江温州', remark: '覆膜材料' },
  { id: '4', code: 'V004', name: '利群刀模', contact: '吴师傅', phone: '13888138004', address: '广东深圳', remark: '刀模定制' },
  { id: '5', code: 'V005', name: '顺丰纸业', contact: '张小姐', phone: '13888138005', address: '山东青岛', remark: '' },
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

// 产品模拟数据
export const mockProducts: Product[] = [
  { id: '1', code: 'P001', name: '运动鞋吊牌', spec: '10*15cm', customer: '李宁体育', sheetSize: 16, remark: '' },
  { id: '2', code: 'P002', name: 'T恤吊牌', spec: '8*12cm', customer: '安踏集团', sheetSize: 24, remark: '' },
  { id: '3', code: 'P003', name: '运动服纸盒', spec: '20*30*5cm', customer: '特步国际', sheetSize: 8, remark: '' },
  { id: '4', code: 'P004', name: '鞋盒', spec: '25*35*10cm', customer: '361度', sheetSize: 4, remark: '' },
  { id: '5', code: 'P005', name: '配件纸盒', spec: '15*20*3cm', customer: '鸿星尔克', sheetSize: 12, remark: '' },
  { id: '6', code: 'P006', name: '促销吊牌', spec: '12*18cm', customer: '李宁体育', sheetSize: 16, remark: '促销专用' },
];

// 工艺模拟数据
export const mockProcesses: Process[] = [
  { id: '1', name: '烫金', unitPrice: 0.15, outsource: true, remark: '金色' },
  { id: '2', name: '烫银', unitPrice: 0.15, outsource: true, remark: '银色' },
  { id: '3', name: 'UV', unitPrice: 0.10, outsource: true, remark: '局部UV' },
  { id: '4', name: '覆膜', unitPrice: 0.08, outsource: false, remark: '亮膜/哑膜' },
  { id: '5', name: '压纹', unitPrice: 0.12, outsource: true, remark: '' },
  { id: '6', name: '模切', unitPrice: 0.05, outsource: false, remark: '' },
  { id: '7', name: '糊盒', unitPrice: 0.20, outsource: true, remark: '' },
  { id: '8', name: '打码', unitPrice: 0.02, outsource: false, remark: '' },
];

// 工序模拟数据
export const mockWorkstations: Workstation[] = [
  { id: '1', name: '制稿', sequence: 1, outsource: false, remark: '设计输出' },
  { id: '2', name: '买纸', sequence: 2, outsource: false, remark: '采购纸张' },
  { id: '3', name: '裁切', sequence: 3, outsource: false, remark: '' },
  { id: '4', name: '印刷', sequence: 4, outsource: false, remark: '' },
  { id: '5', name: '覆膜', sequence: 5, outsource: false, remark: '' },
  { id: '6', name: '烫金', sequence: 6, outsource: true, remark: '可委外' },
  { id: '7', name: 'UV', sequence: 7, outsource: true, remark: '可委外' },
  { id: '8', name: '糊盒', sequence: 8, outsource: true, remark: '可委外' },
  { id: '9', name: '模切', sequence: 9, outsource: false, remark: '' },
  { id: '10', name: '清废', sequence: 10, outsource: false, remark: '' },
  { id: '11', name: '包装', sequence: 11, outsource: false, remark: '' },
  { id: '12', name: '出货', sequence: 12, outsource: false, remark: '' },
];
