import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, x-requested-with',
};

Deno.serve(async (req) => {
  // CORSプリフライト
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { method } = await req.json();

    if (method === 'analyze-spending') {
      const { userId, period, tone } = await req.json();

      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: corsHeaders }
        );
      }

      // TODO: 実際にClaude APIを呼び出す
      // 分析ロジックを実装

      // 暫定レスポンス
      const insights = [
        { label: '食費が増えてます', text: '今月は食費が先月比で15%増加しています。外食を減らすと予算内に収まりそうです。' },
      { label: '深夜の購買', text: '先週の22時以降に3回コンビニで購入しています。衝動買いを控えて翌朝の活力に影響します。' },
        { label: '良かった点', text: '今月は予算の80%を達成しています。よくできています！' },
      ];
      const suggestions = [
        { label: '予算配分を見直す', text: '娯楽費が予算を超えそうなので、週末の娯楽予算を減らしてみましょう' },
        { label: '固定費を見直す', text: 'サブスクの定額支払いを確認してください。自動更新されやすくなります。' },
      ];

      const aiComment = {
        insights,
        suggestions,
        praise: [{ label: '予算キーパー', text: '来月も頑張れましょう' }],
        summary: '先週は食費が多かったみたい。外食を控えて、家で作るようにすると今月は予算内で収まりそうやで。',
      };

      // Supabaseに保存（トランザクション開始）
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') || '',
        Deno.env.get('SUPABASE_ANON_KEY') || '',
      );

      await supabase
        .from('ai_comments')
        .insert({
          user_id: userId,
          period,
          type: 'monthly',
          content: aiComment,
          tone: tone,
        });

      return new Response(
        JSON.stringify(aiComment),
        { status: 200, headers: corsHeaders }
      );
    }

    return new Response(JSON.stringify({ error: 'Method not found' }), { status: 404, headers: corsHeaders });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});
