const fs = require('fs');

// 获取仓库信息（优先从环境变量读取，否则尝试从[git remote]获取）
let repoOwner = 'zhangyibin8111';  // 默认用户名
let repoName = 'TVbox';
let branch = 'main';               // 默认主分支名

// 在GitHub Actions中，环境变量[GITHUB_REPOSITORY]存在
if (process.env.GITHUB_REPOSITORY) {
  const [owner, name] = process.env.GITHUB_REPOSITORY.split('/');
  repoOwner = owner;
  repoName = name;
}

// 构造链接
const rawLink = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/${branch}/MultiLine.json`;
const cdnLink = `https://cdn.jsdelivr.net/gh/${repoOwner}/${repoName}@${branch}/MultiLine.json`;
const purgeLink = `https://purge.jsdelivr.net/gh/${repoOwner}/${repoName}@${branch}/MultiLine.json`;

// 读取JSON配置文件
const configPath = process.argv[2] || 'MultiLine.json';
const rawData = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(rawData);

// 提取更新时间（假设第一条数据的URL为空，[name]为时间字符串）
let updateTime = '未知';
let urlsList = config.urls || [];
if (urlsList.length > 0 && urlsList[0].url === '') {
  updateTime = urlsList[0].name.replace('更新时间 ', '');
  urlsList = urlsList.slice(1); // 移除第一条元数据条目
}

// 生成HTML表格行
let tableRows = '';
urlsList.forEach(item => {
  // 过滤掉空URL或无效条目
  if (item.url && item.url.trim() !== '') {
    tableRows += `
          <tr>
            <td style="white-space: nowrap;">${escapeHtml(item.name)}</td>
            <td style="white-space: nowrap;"><code>${escapeHtml(item.url)}</code></td>
          </tr>`;
  }
});

// 完整的HTML表格，外层加[overflow-x]实现横向滚动
const htmlTable = `
<div style="overflow-x: auto;">
  <table style="border-collapse: collapse; width: 100%;">
    <thead>
      <tr>
        <th style="border: 1px solid #ddd; padding: 8px; text-align: left; white-space: nowrap;">线路名称</th>
        <th style="border: 1px solid #ddd; padding: 8px; text-align: left; white-space: nowrap;">接口地址</th>
      </tr>
    </thead>
    <tbody>${tableRows}</tbody>
  </table>
</div>`;

// 读取模板并替换
let template = fs.readFileSync('README.template.md', 'utf8');
let readmeContent = template
  .replace('{{update_time}}', updateTime)
  .replace(/{{raw_link}}/g, rawLink)
  .replace(/{{cdn_link}}/g, cdnLink)
  .replace(/{{purge_link}}/g, purgeLink)
  .replace('{{table_rows}}', htmlTable);
// 写入 README.md
fs.writeFileSync('README.md', readmeContent, 'utf8');

console.log('✅ README.md 生成成功！');
console.log(`📊 共 ${urlsList.length} 条有效线路`);
console.log(`📅 更新时间: ${updateTime}`);

// 简单的防止线路名称或URL里包含特殊字符
function escapeHtml(str) {
  return str.replace(/[&<>]/g, function (m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}