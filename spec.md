# FocusForge - 仕様書 v1.0
## ADHD向けAIタスク管理アプリ

---

## 1. プロダクト概要

**FocusForge** は、ADHD（注意欠如・多動症）を持つ人向けのAIパワードタスク管理アプリ。
大きなタスクをAIが小さな実行可能なステップに分解し、ゲーミフィケーションで達成感を維持する。

### ターゲットユーザー
- ADHD当事者（成人）
- 集中力に悩む学生・社会人
- タスク管理が苦手な人全般

### 差別化ポイント
1. **AIタスク分解** — 「論文を書く」→「テーマを3つ書き出す(5分)」「1つ選ぶ(2分)」「アウトラインを書く(15分)」
2. **Body Doubling（バーチャル作業仲間）** — 他のユーザーと匿名でオンライン共同作業
3. **ゲーミフィケーション** — XP、レベル、ストリーク、実績バッジ
4. **刺激的なUI** — ADHD脳が飽きないアニメーション・サウンドフィードバック
5. **Pomodoro統合** — タイマー + 休憩リマインダー

---

## 2. 技術スタック

| レイヤー | 技術 |
|----------|------|
| フロントエンド | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| バックエンド | Supabase (Auth, DB, Realtime, Edge Functions) |
| AI | OpenAI API (GPT-5) via Supabase Edge Functions |
| ホスティング | Vercel (Pro $20/月、収益化後) |
| 決済 | Stripe (いおりさんのアカウント既存) |
| アナリティクス | PostHog (無料枠) or Plausible |

### 無料枠で運用可能か
- **Supabase Free**: 500MB DB, 1GB Storage, 50K MAU, 500K Edge Function呼び出し/月
- **Vercel Hobby**: 開発・テスト用（商用不可→収益化時にPro移行）
- **OpenAI**: タスク分解1回あたり約$0.001-0.005 → 1000回/日でも$5/日
- **初期段階はOpenAI APIコストのみ** → いおりさんに相談必要

---

## 3. データベース設計

### テーブル

```sql
-- ユーザープロファイル
create table profiles (
  id uuid primary key references auth.users(id),
  display_name text,
  level int default 1,
  xp int default 0,
  streak_days int default 0,
  last_active_date date,
  settings jsonb default '{}',
  created_at timestamptz default now()
);

-- タスク
create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  title text not null,
  description text,
  parent_task_id uuid references tasks(id),
  status text default 'pending' check (status in ('pending', 'in_progress', 'completed', 'skipped')),
  priority text default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  estimated_minutes int,
  actual_minutes int,
  xp_reward int default 10,
  due_date timestamptz,
  completed_at timestamptz,
  ai_generated boolean default false,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- ポモドーロセッション
create table pomodoro_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  task_id uuid references tasks(id),
  duration_minutes int not null,
  type text check (type in ('work', 'break')),
  completed boolean default false,
  started_at timestamptz default now(),
  ended_at timestamptz
);

-- 実績バッジ
create table achievements (
  id text primary key,
  name text not null,
  description text,
  icon text,
  xp_reward int default 50
);

-- ユーザー実績
create table user_achievements (
  user_id uuid references profiles(id) on delete cascade,
  achievement_id text references achievements(id),
  unlocked_at timestamptz default now(),
  primary key (user_id, achievement_id)
);

-- Body Doubling ルーム
create table rooms (
  id uuid primary key default gen_random_uuid(),
  name text,
  max_participants int default 10,
  active boolean default true,
  created_at timestamptz default now()
);

-- ルーム参加者
create table room_participants (
  room_id uuid references rooms(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (room_id, user_id)
);
```

### RLS (Row Level Security)
```sql
-- ユーザーは自分のデータのみアクセス可能
alter table profiles enable row level security;
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);

alter table tasks enable row level security;
create policy "Users can CRUD own tasks" on tasks for all using (auth.uid() = user_id);

alter table pomodoro_sessions enable row level security;
create policy "Users can CRUD own sessions" on pomodoro_sessions for all using (auth.uid() = user_id);
```

---

## 4. ページ構成

### 4.1 ランディングページ (`/`)
- ヒーローセクション: 「ADHDでも、やりきれる。」
- 特徴3つ（AIタスク分解、Body Doubling、ゲーミフィケーション）
- プライシング（Free / Pro $5/月）
- CTA: 「無料で始める」

### 4.2 ダッシュボード (`/dashboard`)
- 今日のタスク一覧（ドラッグ&ドロップで並び替え）
- ポモドーロタイマー
- 進捗バー（今日のXP / 目標）
- ストリークカウンター
- 「AIにタスクを分解してもらう」ボタン

### 4.3 タスク詳細 (`/tasks/[id]`)
- タスク情報（タイトル、説明、期限）
- サブタスク一覧（AI分解結果）
- 「開始」ボタン（ポモドーロ開始）
- 完了時のアニメーション＋XP獲得演出

### 4.4 Body Doubling (`/focus-room`)
- アクティブなルーム一覧
- 参加中のユーザー数表示（匿名アバター）
- チャットなし（集中を妨げないため）
- 自分の現在のタスクと残り時間を表示

### 4.5 プロフィール (`/profile`)
- レベル、XP、ストリーク
- 実績バッジ一覧
- 統計（完了タスク数、総集中時間など）

### 4.6 設定 (`/settings`)
- テーマ（ダーク/ライト/ADHDフレンドリーカラー）
- 通知設定
- ポモドーロ時間設定（デフォルト25/5）
- サブスク管理

---

## 5. AI タスク分解ロジック

### Edge Function: `ai-decompose`
```typescript
// POST /functions/v1/ai-decompose
// Body: { task_title: string, task_description?: string }
// Returns: { subtasks: Array<{ title: string, estimated_minutes: number, tips: string }> }

const systemPrompt = `You are an ADHD-friendly task coach. 
Break down the given task into small, concrete, actionable steps.
Each step should take 5-25 minutes.
Use simple, encouraging language.
Add a practical tip for each step to help someone with ADHD stay focused.
Return 3-7 subtasks.`;
```

### コスト見積もり
- 1リクエスト: ~500トークン入力 + ~300トークン出力
- GPT-5: ~$0.003/リクエスト
- 1ユーザーあたり1日5回 = $0.015/日 = $0.45/月
- 400ユーザー = **$180/月** (十分回収可能)

---

## 6. ゲーミフィケーション設計

### XP システム
| アクション | XP |
|-----------|-----|
| タスク完了 | 10 |
| サブタスク完了 | 5 |
| ポモドーロ完了 | 15 |
| 3日連続ストリーク | 50 |
| 7日連続ストリーク | 150 |
| 30日連続ストリーク | 500 |

### レベルアップ
- Level 1: 0 XP
- Level 2: 100 XP
- Level 5: 1,000 XP
- Level 10: 5,000 XP
- Level 20: 20,000 XP
- 式: `required_xp = floor(100 * level^1.5)`

### 実績バッジ（初期20個）
- 🔥 First Flame: 初めてのタスク完了
- ⚡ Lightning Start: 朝7時前にタスク開始
- 🧊 Cool Streak: 7日連続
- 🏔️ Mountain Climber: 50タスク完了
- 🎯 Laser Focus: 5ポモドーロ連続完了
- 🌙 Night Owl: 22時以降にタスク完了
- 🤝 Body Double: Body Doublingルーム初参加
- ...

---

## 7. マネタイズ

### Free プラン
- タスク作成: 無制限
- AI分解: 3回/日
- ポモドーロ: 無制限
- Body Doubling: 1ルーム/日

### Pro プラン ($5/月 = ¥750)
- AI分解: 無制限
- Body Doubling: 無制限
- 詳細統計・分析
- カスタムテーマ
- 優先サポート

### 収益目標
- **月30万円 = 400有料ユーザー × $5**
- Free:Pro比率 = 97:3（一般的なフリーミアム転換率）
- 必要MAU: ~13,000

---

## 8. MVP（2週間で構築）

### Week 1: コア機能
- [ ] Supabaseプロジェクト作成、テーブル作成
- [ ] Next.js プロジェクト初期化（shadcn/ui）
- [ ] 認証（Supabase Auth: Google, GitHub, Email）
- [ ] タスクCRUD
- [ ] AI分解（Edge Function + OpenAI）
- [ ] ポモドーロタイマー

### Week 2: 体験向上
- [ ] ゲーミフィケーション（XP、レベル、ストリーク）
- [ ] 実績バッジ
- [ ] ランディングページ
- [ ] レスポンシブ対応
- [ ] 基本的なアニメーション
- [ ] Body Doubling（v1: シンプルな在席表示）

### Week 3以降: 成長
- [ ] Stripe決済連携
- [ ] Product Hunt ローンチ
- [ ] SEO最適化
- [ ] X/Reddit でのビルドインパブリック

---

## 9. セキュリティ

- [x] Supabase RLS（行レベルセキュリティ）
- [ ] Rate limiting（AI分解リクエスト）
- [ ] Input sanitization
- [ ] CSRF protection（Next.js built-in）
- [ ] Content Security Policy
- [ ] APIキーはEdge Functionsのみ（クライアント非露出）
- [ ] GDPR: データエクスポート/削除機能

---

## 10. 国際化

### 初期: 英語のみ
- ADHDツールの課金意欲は英語圏が圧倒的に高い
- Reddit r/ADHD: 2.5M members（巨大コミュニティ）
- Product Huntローンチにも英語必須

### Phase 2: 日本語追加
- next-intl使用
- 日本のADHD認知度は上昇中

---

## 11. 競合分析

| アプリ | 月額 | 特徴 | FocusForgeの差別化 |
|--------|------|------|-------------------|
| Todoist | $5 | 汎用タスク管理 | ADHD特化ではない |
| Goblin.tools | 無料 | AIタスク分解 | タスク管理機能なし |
| Tiimo | $6 | ADHD向けスケジュール | タスク分解なし、Body Doublingなし |
| Focusmate | $7 | Body Doubling | タスク管理なし |
| **FocusForge** | **$5** | **全部入り（AI分解+Body Doubling+ゲーミフィケーション）** | **唯一の統合ソリューション** |

---

*仕様書作成: REY | 2026-02-09*
*レビュー待ち: いおりさん確認後、Codex CLIで実装開始*
