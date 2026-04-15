const https = require('https');

const APP_ID = 'cli_a942474699f85cc1';
const APP_SECRET = 'aY6lJiIPeicpOVzyRMFROCUFRijRY4pf';
const BITABLE_TOKEN = 'EUyCb0aIcavugUsXJaocRtR6n6b';

function getToken() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      app_id: APP_ID,
      app_secret: APP_SECRET
    });
    
    const options = {
      hostname: 'open.feishu.cn',
      path: '/open-apis/auth/v3/tenant_access_token/internal',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        const result = JSON.parse(body);
        if (result.code === 0) {
          resolve(result.tenant_access_token);
        } else {
          reject(new Error('Failed to get token: ' + body));
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function createTable(token, tableName, fields) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      table: {
        name: tableName,
        fields: fields
      }
    });
    
    const options = {
      hostname: 'open.feishu.cn',
      path: `/open-apis/bitable/v1/apps/${BITABLE_TOKEN}/tables`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        const result = JSON.parse(body);
        if (result.code === 0) {
          console.log(`✓ Created table: ${tableName} -> ${result.data.table_id}`);
          resolve(result.data.table_id);
        } else {
          console.log(`✗ Failed to create ${tableName}: ${result.msg}`);
          reject(result);
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function main() {
  try {
    console.log('Getting access token...');
    const token = await getToken();
    console.log('Token obtained!\n');

    // Create 销售订单 table
    const salesFields = [
      { field_name: "单号", type: 1 },
      { field_name: "客户名称", type: 1 },
      { field_name: "日期", type: 5 },
      { field_name: "合同金额", type: 2 },
      { field_name: "已送货", type: 2 },
      { field_name: "未收款项", type: 2 },
      { field_name: "已收款", type: 2 },
      { field_name: "收款状态", type: 3, property: { options: [{ name: "未收款" }, { name: "部分收款" }, { name: "全部收款" }] } },
      { field_name: "送货状态", type: 3, property: { options: [{ name: "未送货" }, { name: "部分送货" }, { name: "全部送货" }] } },
      { field_name: "制单人", type: 1 },
      { field_name: "业务员", type: 1 },
      { field_name: "计划收款日期", type: 5 },
      { field_name: "备注", type: 4 }
    ];
    const salesTableId = await createTable(token, '销售订单', salesFields);

    // Create 采购订单 table
    const purchaseFields = [
      { field_name: "单号", type: 1 },
      { field_name: "供应商名称", type: 1 },
      { field_name: "日期", type: 5 },
      { field_name: "合同金额", type: 2 },
      { field_name: "已收货", type: 2 },
      { field_name: "未付款", type: 2 },
      { field_name: "已付款", type: 2 },
      { field_name: "付款状态", type: 3, property: { options: [{ name: "未付款" }, { name: "部分付款" }, { name: "全部付款" }] } },
      { field_name: "收货状态", type: 3, property: { options: [{ name: "未收货" }, { name: "部分收货" }, { name: "全部收货" }] } },
      { field_name: "制单人", type: 1 },
      { field_name: "业务员", type: 1 },
      { field_name: "计划付款日期", type: 5 },
      { field_name: "收货地址", type: 1 },
      { field_name: "备注", type: 4 }
    ];
    const purchaseTableId = await createTable(token, '采购订单', purchaseFields);

    // Create 库存表 table
    const inventoryFields = [
      { field_name: "产品名称", type: 1 },
      { field_name: "货号", type: 1 },
      { field_name: "分类", type: 3, property: { options: [{ name: "原材料" }, { name: "成品" }, { name: "半成品" }, { name: "辅料" }] } },
      { field_name: "单位", type: 1 },
      { field_name: "当前库存", type: 2 },
      { field_name: "安全库存", type: 2 },
      { field_name: "采购在途", type: 2 },
      { field_name: "销售在途", type: 2 },
      { field_name: "备注", type: 4 }
    ];
    const inventoryTableId = await createTable(token, '库存表', inventoryFields);

    console.log('\n=== Summary ===');
    console.log(`销售订单 table_id: ${salesTableId}`);
    console.log(`采购订单 table_id: ${purchaseTableId}`);
    console.log(`库存表 table_id: ${inventoryTableId}`);
    console.log('\nUpdate your repo.ts with these table IDs!');
    
  } catch (err) {
    console.error('Error:', err);
  }
}

main();
