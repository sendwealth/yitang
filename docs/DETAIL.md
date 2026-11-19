# 一堂方法论技能包 (yitang)

本插件把一堂(yitang)的工作方法论注册为 DSH 技能,用户和智能体都可以调用,作为做事时的方法论指导。

## 包含的技能

| 技能 | 一句话 |
|---|---|
| `yitang` | 总索引:按问题类型路由到具体方法论 |
| `yitang-dual-triangle` | 一堂双三角:人类三角(审美/体系/创造力)× AI三角(场景/数据/基本功),AI 时代竞争力操作系统 |
| `yitang-y-model` | Y模型:相信并追求客观因果规律,理论+事实两叉,假设驱动、定性定量 |
| `yitang-scene-star-model` | 场景STAR:S探索/T变革/A提速/R落地四象限 + 场景评估画布 |
| `yitang-business-formula` | 业务公式:先切分再拆转化,参数冰山,相关到因果 |
| `yitang-cd-loop` | C×D 循环:业务公式找战场,转化率(动力/阻力/触点)打节点 |
| `yitang-ai-data` | ADAPTED 6+1:AI 数据全生命周期(预判→识别→收集→处理→使用→反馈+治理) |
| `yitang-skill-encapsulation` | Skill 封装五阶段:经验→六类规则→三类测试 |
| `yitang-partner-encapsulation` | Partner 封装六阶段:TCPR 角色 + 双三角准备 + 固定入口 |
| `yitang-voice-prompting` | AI口喷:语音输入×AI 协作,把AI当人、把人当AI |
| `yitang-ai-10x-flywheel` | AI十倍速飞轮:信心→结果→复利→跨界四赛段,先判断阶段再选动作 |

## 使用方式

- 对智能体:技能目录会出现在系统提示的可用技能列表,任务匹配时加载,也可直接让智能体"用 yitang-xxx 方法论来做这件事"。
- 对用户:可按技能名直接调用(如 `/yitang-dual-triangle`)。

## 来源与限制

内容提炼自用户 Obsidian 知识库(Ob-wiki)中的一堂课程笔记,原文来自一堂直播与飞书文档。技能正文为方法论指导,不是业务数据;具体数字与案例是课程记录,使用时应结合当前实际情况验证。

技能文件位于包内 `skills/` 目录,每个技能一个文件夹(`SKILL.md`),修改后新会话生效。
