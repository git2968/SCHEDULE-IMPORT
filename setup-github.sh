#!/bin/bash

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # 无颜色

echo -e "${GREEN}=== 初始化Git仓库并部署到GitHub ===${NC}\n"

# 检查git是否安装
if ! command -v git &> /dev/null; then
    echo -e "${YELLOW}git未安装，请先安装git${NC}"
    exit 1
fi

# 初始化git仓库
echo -e "${BLUE}正在初始化Git仓库...${NC}"
git init

# 添加所有文件
echo -e "\n${BLUE}添加文件到暂存区...${NC}"
git add .

# 初始提交
echo -e "\n${BLUE}创建初始提交...${NC}"
git commit -m "Initial commit"

# 添加远程仓库
echo -e "\n${BLUE}添加GitHub远程仓库...${NC}"
git remote add origin https://github.com/git2968/SCHEDULE-IMPORT.git

# 创建main分支并推送
echo -e "\n${BLUE}创建main分支...${NC}"
git branch -M main

echo -e "\n${YELLOW}即将推送到GitHub...${NC}"
echo -e "可能需要输入GitHub凭证\n"

# 推送到GitHub
echo -e "${BLUE}推送代码到GitHub...${NC}"
git push -u origin main

echo -e "\n${GREEN}完成!${NC}"
echo -e "仓库已推送到: ${BLUE}https://github.com/git2968/SCHEDULE-IMPORT${NC}"
echo -e "GitHub Pages将在几分钟后可用: ${BLUE}https://git2968.github.io/SCHEDULE-IMPORT/${NC}" 