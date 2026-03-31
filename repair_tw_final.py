import re
import os

def parse_ts_file(file_path):
    kv_pairs = {}
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
    
    # Improved regex for standard key: value pairs
    pattern = re.compile(r'^\s*([a-zA-Z0-9_]+):\s*(["\'`].*?["\'`]),?\s*$', re.MULTILINE | re.DOTALL)
    matches = pattern.findall(content)
    for key, value in matches:
        kv_pairs[key] = value.strip()
    return kv_pairs

def repair_tw():
    base_dir = r'd:\antigravity\stepupvoca\app\src\i18n'
    ko_path = os.path.join(base_dir, 'ko.ts')
    zh_path = os.path.join(base_dir, 'zh.ts')
    tw_path = os.path.join(base_dir, 'tw.ts')
    
    ko_dict = parse_ts_file(ko_path)
    zh_dict = parse_ts_file(zh_path)
    tw_dict = parse_ts_file(tw_path)
    
    with open(ko_path, 'r', encoding='utf-8') as f:
        ko_lines = f.readlines()

    new_tw_lines = [
        "import { en } from './en';\n",
        "\n",
        "export const tw = {\n",
        "    ...en,\n"
    ]
    
    # Basic T-S conversion map for common terms
    s2t = {
        "准确率": "準確率", "学习效果": "學習效果", "增长": "增長", "实时": "即時", "对话": "對話",
        "消除": "消除", "恐惧": "恐懼", "完善": "完善", "能力": "實力", "导师": "導師",
        "反馈": "回饋", "场景": "情景", "实战": "實戰", "游戏": "遊戲", "单词": "單字",
        "词汇": "詞彙", "定制": "個人化", "资产": "資產", "对战": "對決", "激励": "激發",
        "动力": "動力", "支持": "支持", "学院": "學院", "公司": "公司", "商店": "商店",
        "设置": "設置", "排行": "排行", "圣경": "聖經", "首页": "首頁", "个人": "個人",
        "统计": "統計", "错题": "錯題", "等级": "等級", "锁定": "鎖定", "解锁": "解鎖",
        "积分": "積分", "金币": "金幣", "奖励": "獎勵", "视频": "影片", "下载": "下載",
        "确认": "確認", "取消": "取消", "删除": "刪除", "报错": "報錯", "发送": "傳送",
        "错误": "錯誤", "重试": "重試", "公告": "公告", "截图": "截圖", "最大": "最大",
        "正确": "正確", "昵称": "暱稱", "酷炫": "酷炫", "保存": "保存", "设备": "設備",
        "记忆": "記憶", "總計": "總計", "复习": "複習", "登录": "登入", "注册": "註冊",
        "体验": "體驗", "功能": "功能", "优惠": "優惠", "价格": "價格", "购买": "購買",
        "支付": "支付", "退款": "退換", "服务": "服務", "客服": "客服", "条款": "條款",
        "隐私": "隱私", "通知": "通知", "提醒": "提醒", "训练": "訓練", "测试": "測試"
    }

    processed_keys = set()
    
    for line in ko_lines:
        line_stripped = line.strip()
        # Find the key
        match = re.match(r'^\s*([a-zA-Z0-9_]+):', line_stripped)
        if match:
            key = match.group(1)
            if key in processed_keys: continue
            processed_keys.add(key)
            
            # 1. Use existing tw value if it exists and looks valid
            val = tw_dict.get(key)
            if val and '\\ufffd' not in val and not any(ord(c) == 0xfffd for c in val):
                new_tw_lines.append(f"    {key}: {val},\n")
            elif key in zh_dict:
                # 2. Use zh value and convert
                zh_val = zh_dict[key]
                tw_val = zh_val
                for s, t in s2t.items():
                    tw_val = tw_val.replace(s, t)
                new_tw_lines.append(f"    {key}: {tw_val},\n")
            # Else: skip it, it will be inherited from ...en
        elif line_stripped.startswith('...'):
            continue # Already added ...en
        elif line_stripped.startswith('export const') or line_stripped.startswith('import'):
            continue # Already handled header
        elif line_stripped == '};':
            new_tw_lines.append('};\n')
        elif line_stripped == '{' or not line_stripped:
            continue
        else:
            # Preservation of comments or other structural elements
            if '//' in line:
                new_tw_lines.append(line)

    if new_tw_lines[-1] != '};\n':
        new_tw_lines.append('};\n')

    with open(tw_path, 'w', encoding='utf-8') as f:
        f.writelines(new_tw_lines)
    print("Repair complete.")

if __name__ == "__main__":
    repair_tw()
