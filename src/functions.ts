import { inngest } from "./client";
import { Resend } from "resend";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";
import { GoogleGenAI } from "@google/genai";

const resend = new Resend(process.env.RESEND_API_KEY);
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// 1. Daily Payment Reminder Cron
export const dailyPaymentReminder = inngest.createFunction(
  { id: "daily-payment-reminder" },
  { cron: "0 9 * * *" }, // Runs daily at 9:00 AM UTC
  async ({ step }) => {
    const pendingExpenses = await step.run("fetch-pending-expenses", async () => {
      return await convex.query(api.cronJobs.getPendingDebts);
    });

    await step.run("send-reminder-emails", async () => {
      for (const expense of pendingExpenses) {
        for (const recipient of expense.splitWith) {
          await resend.emails.send({
            from: "Splitter <notifications@yourdomain.com>",
            to: recipient,
            subject: "Daily Reminder: Pending Expense",
            html: `<p>You have a pending split for <strong>${expense.description}</strong> totaling <strong>$${expense.amount}</strong>.</p>`,
          });
        }
      }
    });

    return { remindedCount: pendingExpenses.length };
  }
);

// 2. Monthly AI Spending Insights Cron
export const monthlyAiInsights = inngest.createFunction(
  { id: "monthly-ai-insights" },
  { cron: "0 0 1 * *" }, // Runs 1st of every month at midnight
  async ({ step }) => {
    const monthlyData = await step.run("fetch-monthly-expenses", async () => {
      return await convex.query(api.cronJobs.getMonthlyExpenses);
    });

    const aiReport = await step.run("generate-ai-insights", async () => {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Analyze these expenses and give a 3-bullet spending optimization breakdown: ${JSON.stringify(monthlyData)}`,
      });
      return response.text;
    });

    await step.run("email-monthly-digest", async () => {
      const users = await convex.query(api.users.getAllUsers);
      for (const user of users) {
        await resend.emails.send({
          from: "Splitter AI <insights@yourdomain.com>",
          to: user.email,
          subject: "Your Monthly AI Expense Insights",
          html: `<h2>Monthly Spending Digest</h2><p>${aiReport}</p>`,
        });
      }
    });

    return { status: "Insights generated and delivered" };
  }
);
