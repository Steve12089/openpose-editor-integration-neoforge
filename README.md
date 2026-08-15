# openpose-editor-integration-neoforge
本项目已基本完善，且已有分支解决了大部分问题，故暂时没有更新计划
在github.com/Haoming02/sd-webui-forge-classic的控制网上增加了openpose骨骼图编辑按钮

本项目由AI生成,但大概率没有什么严重的bug

使用:
1:首先安装 https://github.com/huchenlei/sd-webui-openpose-editor
2:确保在你的本地`extensions\sd-webui-openpose-editor` 存在且 `dist` 目录完整
3:像安装其他插件那样安装此插件
4:重启 WebUI

使用

1. 打开 txt2img 或 img2img,展开 ControlNet 单元
2. 控制类型选择 **OpenPose**(例如预处理器 `dw_openpose_full`),上传一张包含人物姿态的图片
3. 点击 💥 运行预处理器,生成骨骼预览
4. 预览右下角点击 **编辑** 按钮
5. 在打开的编辑器中拖拽骨骼关键点,调整完毕后点击左侧 **Send Pose**
6. 弹窗自动关闭,预览骨骼图与 "Preview as Input" 同步更新,直接生成即可

 注意事项

- 若点击「编辑」提示 *No OpenPose JSON found*,请先运行 OpenPose 预处理器生成骨骼数据
- 编辑器快捷键:空格/F 平移,滚轮缩放,右键隐藏关键点
- 插件仅在浏览器端运行,不改变任何后端生成逻辑
