# 贡献指南

感谢您考虑为课表管理系统项目做出贡献！您的参与对我们来说非常宝贵。

## 如何贡献

### 报告Bug

- 在提交新的问题之前，请检查是否已存在相关问题
- 使用我们的Bug报告模板
- 描述清楚如何重现问题，以及您期望的结果
- 包含尽可能多的相关信息（浏览器、操作系统等）

### 提出功能建议

- 使用我们的功能请求模板
- 描述该功能可以解决什么问题
- 描述您想要的解决方案
- 说明您考虑过的替代方案

### 提交代码

1. Fork 本仓库
2. 创建您的功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个Pull Request

### Pull Request 指南

- 确保PR描述清楚地说明了更改内容和原因
- 包括任何相关的issue编号
- 更新相关文档
- PR将被审核后合并

## 开发设置

1. 克隆仓库
```bash
git clone https://github.com/git2968/SCHEDULE-IMPORT.git
cd student-schedule
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

## 编码规范

- 遵循TypeScript和React最佳实践
- 组件使用函数式组件和Hooks
- 使用Styled Components进行样式管理
- 保持代码简洁、可读
- 添加适当的注释

## 提交消息约定

请按照以下格式编写提交消息：

```
<类型>: <简短描述>

<详细描述>
```

类型可以是：
- `feat`: 新功能
- `fix`: 修复Bug
- `docs`: 文档更新
- `style`: 代码格式（不影响代码运行的变动）
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 添加测试
- `chore`: 构建过程或辅助工具的变动

## 许可证

通过贡献您的代码，您同意将其许可在项目的MIT许可下。 