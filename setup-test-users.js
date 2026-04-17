// 捷成印刷管理系统 - 测试账号初始化脚本
// 使用方法：登录后，在浏览器控制台(F12)粘贴运行此脚本

const TEST_USERS = [
  { username: 'haipa', password: 'test123', name: '海帕杰顿', roleKey: 'sales' },
  { username: 'bigmon', password: 'test123', name: '比格蒙', roleKey: 'purchase' },
  { username: 'leidewang', password: 'test123', name: '雷德王', roleKey: 'report' },
  { username: 'balstan', password: 'test123', name: '巴尔坦星人', roleKey: 'owner' },
  { username: 'astolon', password: 'test123', name: '阿斯特隆', roleKey: 'finance' },
];

// 简单hash函数（仅用于测试环境）
async function simpleHash(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return '$2b$10$' + hashArray.slice(0, 22).map(b => b.toString(36).padStart(2, '0')).join('');
}

// 获取现有用户
function getUsers() {
  const data = localStorage.getItem('users');
  return data ? JSON.parse(data) : [];
}

// 保存用户
function saveUsers(users) {
  localStorage.setItem('users', JSON.stringify(users));
}

// 获取现有员工
function getEmployees() {
  const data = localStorage.getItem('employees');
  return data ? JSON.parse(data) : [];
}

// 保存员工
function saveEmployees(employees) {
  localStorage.setItem('employees', JSON.stringify(employees));
}

async function initTestUsers() {
  const users = getUsers();
  const employees = getEmployees();
  
  console.log('🚀 开始初始化测试账号...');
  
  for (const tu of TEST_USERS) {
    // 检查用户名是否已存在
    if (users.find(u => u.username === tu.username)) {
      console.log(`⏭️  用户 ${tu.username} 已存在，跳过`);
      continue;
    }
    
    // 创建员工记录
    const empId = 'emp_' + tu.username;
    const newEmployee = {
      id: empId,
      name: tu.name,
      phone: '',
      email: tu.username + '@test.com',
      status: '正常',
      roleKey: tu.roleKey,
    };
    employees.push(newEmployee);
    
    // 创建用户账号
    const newUser = {
      id: 'u_' + tu.username,
      username: tu.username,
      passwordHash: '$2b$10$RzYeSgQyej959T98Qvva0et5Q3otEs8WLNDrpiWWIWURY9lUPL4Ka', // admin123的hash
      employeeId: empId,
      roleKey: tu.roleKey,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
    };
    users.push(newUser);
    
    console.log(`✅ 创建账号: ${tu.username} / admin123 (${tu.name} - ${tu.roleKey})`);
  }
  
  saveUsers(users);
  saveEmployees(employees);
  
  console.log('🎉 测试账号初始化完成！');
  console.log('\n账号列表:');
  TEST_USERS.forEach(u => {
    console.log(`  ${u.name}: ${u.username} / admin123`);
  });
}

initTestUsers();
