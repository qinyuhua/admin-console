# Views 目录结构说明

## 目录组织规范

### 模块化目录结构
```
views/
├── layout/              # 布局与认证页面
│   ├── Layout.vue       # 主布局页面
│   ├── Login.vue        # 登录页面
│   └── Register.vue     # 注册页面
├── system/              # 系统配置模块
│   ├── account/         # 账号配置
│   │   ├── index.vue    # 主页面
│   │   └── components/  # 子组件目录
│   ├── menu/            # 菜单配置
│   │   ├── index.vue
│   │   └── components/
│   └── role/            # 角色配置
│       ├── index.vue
│       └── components/
├── miniapp-user/        # 小程序用户模块
│   ├── index.vue
│   └── components/
└── asset/               # 资产管理模块
    ├── index.vue
    └── components/
```

## 命名规范

### 1. 模块目录
- 使用 **小写 + 短横线** 命名（kebab-case）
- 例如：`miniapp-user`、`asset`、`system`

### 2. 主页面文件
- 统一命名为 `index.vue`
- 每个模块目录下必须有且仅有一个 `index.vue`

### 3. 子组件目录
- 统一命名为 `components`
- 存放该模块专属的子组件
- 子组件文件使用 **大驼峰** 命名（PascalCase）
- 例如：`UserForm.vue`、`DataTable.vue`

## 使用示例

### 添加新模块
1. 在 `views/` 下创建模块目录，如 `order/`
2. 创建 `order/index.vue` 主页面
3. 创建 `order/components/` 子组件目录
4. 在 `router/index.js` 中注册路由：
   ```js
   {
     path: 'order',
     component: () => import('../views/order/index.vue')
   }
   ```

### 添加子组件
在对应模块的 `components/` 目录下创建组件：
```
asset/
├── index.vue
└── components/
    ├── AssetForm.vue       # 资产表单组件
    └── AssetStatCard.vue   # 统计卡片组件
```

在 `index.vue` 中引入：
```vue
<script setup>
import AssetForm from './components/AssetForm.vue'
import AssetStatCard from './components/AssetStatCard.vue'
</script>
```

## 注意事项

1. **布局和认证页面**统一放在 `layout/` 目录
2. **功能模块页面**按模块分类到对应子目录
3. 每个模块的 `components/` 目录只存放该模块专属组件
4. 跨模块共享的组件应放在 `src/components/` 全局组件目录
5. API 导入路径规则：
   - 一级模块（如 `asset/`）：`../../api/xxx`
   - 二级模块（如 `system/account/`）：`../../../api/xxx`
