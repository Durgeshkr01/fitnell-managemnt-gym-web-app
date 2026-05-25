export type MessageTemplateKey =
  | "newAdmission"
  | "paymentReceipt"
  | "duesClear"
  | "planExpiring"
  | "planExpired"
  | "duesReminder"
  | "birthdayWish"
  | "statusActive"
  | "paymentUpdate"
  | "notificationGeneral"
  | "enquiryCard";

export type MessageTemplates = Record<MessageTemplateKey, string>;

export const messageTemplateKeys: MessageTemplateKey[] = [
  "newAdmission",
  "paymentReceipt",
  "duesClear",
  "planExpiring",
  "planExpired",
  "duesReminder",
  "birthdayWish",
  "statusActive",
  "paymentUpdate",
  "notificationGeneral",
  "enquiryCard",
];

export const messageTemplateLabels: Record<MessageTemplateKey, string> = {
  newAdmission: "New Admission",
  paymentReceipt: "Payment Receipt",
  duesClear: "Dues Clear",
  planExpiring: "Plan Expiring Soon",
  planExpired: "Plan Expired",
  duesReminder: "Dues Reminder",
  birthdayWish: "Birthday Wish",
  statusActive: "Active Status Message",
  paymentUpdate: "Payment Update (Notifications)",
  notificationGeneral: "General Notification",
  enquiryCard: "Enquiry Card",
};

export const messageTemplateVariables: Record<MessageTemplateKey, string[]> = {
  newAdmission: [
    "name",
    "roll",
    "joinDate",
    "planStart",
    "planEnd",
    "amount",
    "dues",
  ],
  paymentReceipt: [
    "name",
    "roll",
    "planStart",
    "planEnd",
    "amount",
    "dues",
    "paidOn",
  ],
  duesClear: ["name", "roll", "amount", "paidOn"],
  planExpiring: ["name", "expiry", "detail"],
  planExpired: ["name", "expiry", "detail"],
  duesReminder: ["name", "dues", "detail"],
  birthdayWish: ["name"],
  statusActive: ["name"],
  paymentUpdate: ["name", "title", "detail"],
  notificationGeneral: ["name", "title", "detail"],
  enquiryCard: ["phone", "location"],
};

export const defaultMessageTemplates: MessageTemplates = {
  newAdmission:
    "SG FITNESS EVOLUTION\nApka swagat hai! Apka admission confirm ho gaya hai.\nNaam: {{name}}\nRoll: {{roll}}\nJoin Date: {{joinDate}}\nPlan: {{planStart}} - {{planEnd}}\nAmount Paid: Rs {{amount}}\nDues: Rs {{dues}}\nKisi bhi help ke liye front desk se sampark karein.\nApka dhanyawad!",
  paymentReceipt:
    "SG FITNESS EVOLUTION\nPayment Receipt\nNaam: {{name}}\nRoll: {{roll}}\nPlan: {{planStart}} - {{planEnd}}\nAmount Paid: Rs {{amount}}\nDues: Rs {{dues}}\nPaid On: {{paidOn}}\nApka dhanyawad!",
  duesClear:
    "SG FITNESS EVOLUTION\nDues Clear Receipt\nNaam: {{name}}\nRoll: {{roll}}\nCleared Amount: Rs {{amount}}\nPaid On: {{paidOn}}\nApka dhanyawad!",
  planExpiring:
    "Namaste {{name}}, apka gym plan {{expiry}} ko expire hone wala hai. Renewal ke liye gym se sampark karein. Apka dhanyawad!",
  planExpired:
    "Namaste {{name}}, apka gym plan expire ho chuka hai. Renewal ke liye gym se sampark karein. Apka dhanyawad!",
  duesReminder:
    "Namaste {{name}}, apke account me dues pending hai (Rs {{dues}}). Kripya payment update karein. Apka dhanyawad!",
  birthdayWish:
    "Janamdin ki hardik shubhkamnayein {{name}}! SG Fitness ki taraf se apko bahut bahut badhai.",
  statusActive:
    "Hi {{name}}! Apki fitness journey badiya chal rahi hai. Aaj bhi consistency banaye rakhein!",
  paymentUpdate:
    "Namaste {{name}}, payment update: {{title}}. {{detail}} Apka dhanyawad!",
  notificationGeneral: "Namaste {{name}}, {{title}}. {{detail}}",
  enquiryCard:
    "SG FITNESS EVOLUTION\nStronger Today - Better Tomorrow\n\nENQUIRY CARD\nPhone: {{phone}}\nLocation: {{location}}\n\nIs card me ye benefits milenge:\n- Free Gym Tour\n- Trainer Consultation\n- Body Assessment\n- Special Joining Offers\n\n*Yeh card sirf enquiry ke liye hai, membership confirm nahi hoti.*",
};

export const resolveTemplate = (templates: MessageTemplates, key: MessageTemplateKey) => {
  const value = templates[key];
  if (typeof value === "string" && value.trim()) {
    return value;
  }
  return defaultMessageTemplates[key];
};

export const fillTemplate = (
  template: string,
  data: Record<string, string | number | null | undefined>
) => {
  return Object.entries(data).reduce((result, [key, value]) => {
    const safeValue = value === null || value === undefined ? "" : String(value);
    return result.replaceAll(`{{${key}}}`, safeValue);
  }, template);
};
