// app/api/whatsapp/_lib/state-machine.ts
import type { Conversation, ConversationUpdate } from '@/lib/supabase/whatsapp';
import {
  budgetMessage,
  locationMessage,
  challengeMessage,
  paymentMessage,
  generatingMessage,
} from './messages';

type TransitionResult = {
  updates: ConversationUpdate;
  reply: string | null; // null = no immediate reply (async path)
};

const AFFIRMATIVES = ['yes', 'yeah', 'yep', 'sure', 'ok', 'okay', 'yes please', 'proceed', 'go ahead'];
const BUDGET_OPTIONS: Record<string, string> = {
  '1': 'Under 500k UGX',
  '2': '500k – 2M UGX',
  '3': 'Above 2M UGX',
  'under 500k': 'Under 500k UGX',
  '500k': '500k – 2M UGX',
  '500k to 2m': '500k – 2M UGX',
  '500k – 2m': '500k – 2M UGX',
  'above 2m': 'Above 2M UGX',
  'above 2 million': 'Above 2M UGX',
};
const CHALLENGE_OPTIONS: Record<string, string> = {
  '1': 'Finding customers',
  '2': 'Getting startup money',
  '3': 'Not knowing where to begin',
  'finding customers': 'Finding customers',
  'customers': 'Finding customers',
  'money': 'Getting startup money',
  'startup money': 'Getting startup money',
  'not knowing': 'Not knowing where to begin',
  'where to begin': 'Not knowing where to begin',
  'where to start': 'Not knowing where to begin',
};

function normalize(text: string): string {
  return text.toLowerCase().trim();
}

export function transition(conv: Conversation, incomingText: string): TransitionResult {
  const msg = normalize(incomingText);

  switch (conv.state) {
    case 'NEW': {
      return {
        updates: { state: 'QUALIFYING', business_type: incomingText.trim() },
        reply: budgetMessage(incomingText.trim()),
      };
    }

    case 'QUALIFYING': {
      if (!conv.budget) {
        const budget = BUDGET_OPTIONS[msg] ?? incomingText.trim();
        return {
          updates: { budget },
          reply: locationMessage(),
        };
      }
      if (!conv.location) {
        return {
          updates: { location: incomingText.trim() },
          reply: challengeMessage(),
        };
      }
      if (!conv.concern) {
        const concern = CHALLENGE_OPTIONS[msg] ?? incomingText.trim();
        return {
          updates: { state: 'PITCHING', concern },
          reply: null, // caller builds pitch using updated conv
        };
      }
      return { updates: {}, reply: challengeMessage() };
    }

    case 'PITCHING': {
      if (AFFIRMATIVES.includes(msg)) {
        return {
          updates: { state: 'AWAITING_PAYMENT' },
          reply: paymentMessage(),
        };
      }
      return {
        updates: {},
        reply: `Would you like me to prepare the report for you? Reply *Yes* to proceed.`,
      };
    }

    case 'AWAITING_PAYMENT': {
      if (msg.includes('paid') || msg.includes('payment') || msg.includes('sent')) {
        return {
          updates: { state: 'GENERATING' },
          reply: generatingMessage(conv.location ?? 'your area'),
        };
      }
      return {
        updates: {},
        reply: `Once you have sent the payment, reply *PAID* and share a screenshot.`,
      };
    }

    case 'GENERATING':
    case 'AWAITING_APPROVAL': {
      return {
        updates: {},
        reply: `Your report is still being prepared. We will send it to you very shortly.`,
      };
    }

    case 'DELIVERED': {
      return {
        updates: {},
        reply: `Thank you for using Business Yoo! If you need anything else, feel free to message us.`,
      };
    }

    default:
      return { updates: {}, reply: null };
  }
}
