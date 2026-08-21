# 女性故事库（Demo 数据源）

页面通过 `GET /api/presets` 获取故事，不直接导入故事正文。

当前 Demo 的审核故事保存在 `story-library.ts`，并经 `story-repository.ts` 过滤后发布。每个故事具有：

- `status`：`draft`、`review`、`published` 或 `archived`
- `version`：内容版本，已经开始的游戏保存当时的完整故事快照
- `sourceType`：小组故事、邀请故事或编辑策划故事
- `consentConfirmed`：真人经历是否完成授权确认；未确认的内容不会由接口发布

正式接入 CloudBase 时，将 `story-repository.ts` 的读取实现替换为数据库查询即可，前端页面无需修改。建议数据库继续保存角色资料、章节节点、三个选项、Coach、图片、审核状态、授权状态和版本号。
