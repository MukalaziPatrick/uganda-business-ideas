// lib/supabase/whatsapp.ts
import { createSupabaseAdminClient } from '@/lib/supabase/server';

export type ConversationState =
  | 'NEW'
  | 'QUALIFYING'
  | 'PITCHING'
  | 'AWAITING_PAYMENT'
  | 'GENERATING'
  | 'AWAITING_APPROVAL'
  | 'DELIVERED';

export type Conversation = {
  id: string;
  phone_number: string;
  state: ConversationState;
  business_type: string | null;
  budget: string | null;
  location: string | null;
  concern: string | null;
  created_at: string;
  updated_at: string;
};

export type ConversationUpdate = Partial<
  Omit<Conversation, 'id' | 'phone_number' | 'created_at' | 'updated_at'>
>;

export async function getOrCreateConversation(phone: string): Promise<Conversation> {
  const supabase = createSupabaseAdminClient();

  const { data: existing } = await supabase
    .from('whatsapp_conversations')
    .select('*')
    .eq('phone_number', phone)
    .single();

  if (existing) return existing as Conversation;

  const { data: created, error } = await supabase
    .from('whatsapp_conversations')
    .insert({ phone_number: phone })
    .select()
    .single();

  if (error || !created) throw new Error(`Failed to create conversation: ${error?.message}`);
  return created as Conversation;
}

export async function updateConversation(
  id: string,
  updates: ConversationUpdate
): Promise<void> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from('whatsapp_conversations')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(`Failed to update conversation: ${error.message}`);
}

export async function saveReport(
  conversationId: string,
  reportText: string,
  telegramMessageId: string
): Promise<string> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('whatsapp_reports')
    .insert({
      conversation_id: conversationId,
      report_text: reportText,
      generated_at: new Date().toISOString(),
      telegram_message_id: telegramMessageId,
    })
    .select('id')
    .single();
  if (error || !data) throw new Error(`Failed to save report: ${error?.message}`);
  return data.id;
}

export async function getReportByTelegramMsgId(telegramMsgId: string): Promise<{
  id: string;
  conversation_id: string;
  report_text: string;
} | null> {
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from('whatsapp_reports')
    .select('id, conversation_id, report_text')
    .eq('telegram_message_id', telegramMsgId)
    .single();
  return data ?? null;
}

export async function markReportApproved(reportId: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  await supabase
    .from('whatsapp_reports')
    .update({ approved_at: new Date().toISOString() })
    .eq('id', reportId);
}

export async function markReportDelivered(reportId: string): Promise<void> {
  const supabase = createSupabaseAdminClient();
  await supabase
    .from('whatsapp_reports')
    .update({ delivered_at: new Date().toISOString() })
    .eq('id', reportId);
}
