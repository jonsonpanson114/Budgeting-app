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

      // Jinnai-style analysis logic
      const insights = [
        { label: '食費が増えてるな', text: '「腹が減っては戦はできぬ」とは言うが、お前は毎日戦場にでも行ってるのか？ 先月より15%も食費が膨らんでるぞ。少しは自制という美学を持ってみたらどうだ。' },
        { label: '深夜の誘惑', text: '22時過ぎにコンビニへ3回も通ってるな。深夜のポテトチップスが明日のお前を救うとでも思ってるのか？ その数千円があれば、もっとマシな本でも買えるはずだ。' },
        { label: '意外な健闘', text: '今のところ予算の80%で踏みとどまってる。まあ、お前にしては上出来じゃないか。そのまま奇跡を維持してみろ。' },
      ];
      const suggestions = [
        { label: '予算の再定義', text: '娯楽費に金をかけすぎだ。何かに熱中するのはいいが、財布の中身が空っぽじゃ熱中も冷めるだろ。少し削って、余裕という名の贅沢を楽しめ。' },
        { label: '見えない負債', text: 'サブスクの存在を忘れるな。使ってもいないサービスに金を払い続けるのは、穴の開いたバケツに水を注ぐようなもんだ。今すぐ確認しろ。' },
      ];

      const aiComment = {
        insights,
        suggestions,
        praise: [{ label: '予算の守護者', text: '来月もこの調子で、せいぜいスマートにやってくれ。' }],
        summary: 'おい、先週は少し飛ばしすぎたんじゃないか？ 食費のグラフがまるでエベレストだ。外食を控えて自炊でもしてみろ。意外と新しい才能に目覚めるかもしれんぞ。',
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
