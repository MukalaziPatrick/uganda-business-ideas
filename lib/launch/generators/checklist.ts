import type { ChecklistItem, IntakeProfile } from "../types";

function baseChecklist(profile: IntakeProfile): ChecklistItem[] {
  const audience = profile.audience.trim() || "your target customers";

  return [
    // Week 1 — clarity + offer
    { dayNumber: 1, title: "Write your one-sentence offer", detail: "Say who you help, what result they get, and how. Use the offer statement in this plan as your starting point and read it out loud to 2 people." },
    { dayNumber: 2, title: "List 20 people who match your audience", detail: `Names and phone contacts of real ${audience} you can reach this month. Family and friends count only if they truly fit.` },
    { dayNumber: 3, title: "Set your first price", detail: "Pick one simple price for one clear package. You can change it later — launching with no price is the real mistake." },
    { dayNumber: 4, title: "Set up your contact points", detail: "Business WhatsApp, a phone line you answer, and an email. Put all three on everything you publish — never rely on one channel alone." },
    { dayNumber: 5, title: "Create simple brand basics", detail: "Business name, one-line description, and two colors. No logo designer needed this month — clean and consistent beats fancy." },
    { dayNumber: 6, title: "Prepare your lead magnet", detail: "Build the free item from this plan (sample, guide, checklist, or audit call) so you can hand it to anyone who shows interest." },
    { dayNumber: 7, title: "Week 1 review: refine the offer", detail: "Talk to 3 people from your list. Note the exact words they use about the problem, and rewrite your offer with those words." },

    // Week 2 — visibility assets
    { dayNumber: 8, title: "Set up or refresh 2 social pages", detail: "Pick the 2 platforms where your audience actually spends time. Complete every profile field, add your contact points." },
    { dayNumber: 9, title: "Post your launch story", detail: "Tell people what you are starting and why. Personal beats polished — end with your offer and how to reach you." },
    { dayNumber: 10, title: "Create 5 photos or visuals", detail: "Real photos of your product, service, or process. Phone camera in daylight is enough." },
    { dayNumber: 11, title: "Publish your lead magnet", detail: "Post it, pin it, and put it in your WhatsApp status. Start collecting names and numbers of everyone who takes it." },
    { dayNumber: 12, title: "Post customer-problem content", detail: "Use one content idea from this plan. Talk about the customer's problem, not your product." },
    { dayNumber: 13, title: "Ask 5 friends to share your launch post", detail: "Send each one a personal message, not a broadcast. Make it easy: give them the exact post to forward." },
    { dayNumber: 14, title: "Week 2 review: count your reach", detail: "How many people saw your posts? How many contacts did the lead magnet collect? Write the numbers down." },

    // Week 3 — outreach
    { dayNumber: 15, title: "Message 10 people from your list", detail: "Short personal message: the problem, your offer, one question. No paragraph essays." },
    { dayNumber: 16, title: "Follow up and message 10 more", detail: "Politely follow up yesterday's silent ones, then reach 10 new contacts. Follow-up is where most sales actually happen." },
    { dayNumber: 17, title: "Visit or call 3 potential customers", detail: "Face-to-face or voice builds trust text cannot. Ask about their problem before you pitch." },
    { dayNumber: 18, title: "Post proof content", detail: "A testimonial, behind-the-scenes photo, or work-in-progress. Show that things are really happening." },
    { dayNumber: 19, title: "Launch a deal with a deadline", detail: "A clear launch offer that expires (e.g. first 10 customers, or ends Sunday). Deadlines move people." },
    { dayNumber: 20, title: "Message 10 more and track responses", detail: "Keep a simple table: name, date contacted, response, next step. This is your first CRM." },
    { dayNumber: 21, title: "Week 3 review: study the objections", detail: "List every reason people said no or went quiet. Pick the most common one and decide how to answer it." },

    // Week 4 — first sales push
    { dayNumber: 22, title: "Follow up every warm lead", detail: "Everyone who showed any interest gets one clear, friendly closing message today." },
    { dayNumber: 23, title: "Deliver your first orders brilliantly", detail: "Over-deliver on quality and communication. Your first customers become your marketing." },
    { dayNumber: 24, title: "Ask each buyer for a referral and testimonial", detail: "One sentence from a happy customer plus 'who else should I talk to?' — ask while they are happiest." },
    { dayNumber: 25, title: "Post your first success story", detail: "Share the result a customer got (with permission). Results content converts better than promises." },
    { dayNumber: 26, title: "Re-offer to the non-buyers", detail: "Remind everyone who did not buy that the launch deal is ending. Some were just waiting to see proof." },
    { dayNumber: 27, title: "Tally revenue and leads", detail: "Total sales, total leads, best channel. Numbers, not feelings." },
    { dayNumber: 28, title: "Plan month 2 around your best channel", detail: "Double down on the one channel and offer that produced the most sales. Cut what produced nothing." },
    { dayNumber: 29, title: "Set up simple record keeping", detail: "A notebook or spreadsheet with sales, expenses, and customer contacts. This discipline pays off at tax and loan time." },
    { dayNumber: 30, title: "Write your launch review", detail: "What worked, what flopped, what customers said, and your one big priority for next month." },
  ];
}

export function buildLaunchChecklist(profile: IntakeProfile): ChecklistItem[] {
  const items = baseChecklist(profile);

  if (profile.stage === "selling") {
    const day2 = items.find((item) => item.dayNumber === 2);
    if (day2) {
      day2.title = "List your 10 best existing customers";
      day2.detail =
        "Write down your 10 best customers and what they have in common — that pattern is your real audience for this month.";
    }
  }

  if (profile.helpNeeded.includes("registration")) {
    const day25 = items.find((item) => item.dayNumber === 25);
    if (day25) {
      day25.title = "Start your business registration";
      day25.detail =
        "Reserve your business name on URSB (ursb.go.ug) and note the TIN requirements on URA (ura.go.ug). Your Founder OS operator will guide the paperwork.";
    }
  }

  return items;
}
