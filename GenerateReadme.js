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

// 构造直链和CDN链接
const rawLink = `https://raw.githubusercontent.com/${repoOwner}/${repoName}/${branch}/MultiLine.json`;
const cdnLink = `https://cdn.jsdelivr.net/gh/${repoOwner}/${repoName}@${branch}/MultiLine.json`;

// 读取JSON配置文件
const configPath = process.argv[2] || 'MultiLine.json';
const rawData = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(rawData);

// 提取更新时间（假设第一条数据的[url]为空，[name]为时间字符串）
let updateTime = '未知';
let urlsList = config.urls || [];
if (urlsList.length > 0 && urlsList[0].url === '') {
    updateTime = urlsList[0].name.replace('更新时间 ', '');
    urlsList = urlsList.slice(1); // 移除第一条元数据条目
}

// 生成表格行
let tableRows = '';
urlsList.forEach(item => {
    // 过滤掉空[url]或无效条目
    if (item.url && item.url.trim() !== '') {
        tableRows += `| ${item.name} | [${item.url}](${item.url}) |\n`;
    }
});

// 读取模板
let template = fs.readFileSync('README.template.md', 'utf8');
// 替换占位符
let readmeContent = template
    .replace('{{update_time}}', updateTime)
    .replace('{{raw_link}}', rawLink)
    .replace('{{cdn_link}}', cdnLink)
    .replace('{{table_rows}}', tableRows);
// 写入 README.md
fs.writeFileSync('README.md', readmeContent, 'utf8');

console.log('✅ README.md 生成成功！');
console.log(`📊 共 ${urlsList.length} 条有效线路`);
console.log(`📅 更新时间: ${updateTime}`);