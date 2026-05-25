"use client";

import { useEffect, useMemo, useState } from "react";
import AuthGuard from "@/components/auth-guard";
import AiChatbot from "@/components/ai-chatbot";
import LogoutButton from "@/components/logout-button";
import MemberCard from "@/components/member-card";
import SectionHeader from "@/components/section-header";
import SiteFooter from "@/components/site-footer";
import { formatDateTimeDisplay } from "@/lib/date-utils";
import {
  getMemberById,
  type MemberRecord,
} from "@/lib/firebase/members";
import { getPaymentsByMember, type PaymentRecord } from "@/lib/firebase/payments";

export default function MemberPortalPage() {
  const [member, setMember] = useState<MemberRecord | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadMember = async () => {
      try {
        const memberId = window.localStorage.getItem("memberId");
        if (!memberId) {
          throw new Error("Member session not found.");
        }

        const [memberData, paymentData] = await Promise.all([
          getMemberById(memberId),
          getPaymentsByMember(memberId),
        ]);

        if (!memberData) {
          throw new Error("Member profile not found.");
        }

        if (isActive) {
          setMember(memberData);
          setPayments(paymentData);
        }
      } catch (loadError) {
        if (isActive) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load member portal."
          );
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    void loadMember();

    return () => {
      isActive = false;
    };
  }, []);

  const sortedPayments = useMemo(() => {
    return [...payments].sort((a, b) => {
      const aTime = new Date(a.paidOn).getTime();
      const bTime = new Date(b.paidOn).getTime();
      if (Number.isNaN(aTime) || Number.isNaN(bTime)) return 0;
      return bTime - aTime;
    });
  }, [payments]);

  return (
    <AuthGuard role="member">
      <div className="app-bg min-h-screen text-slate-100">
        <div className="mx-auto w-full max-w-5xl space-y-6 px-6 py-10">
          <div className="glass-panel rounded-2xl px-6 py-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Member Portal
                </p>
                <h1 className="font-display mt-2 text-2xl text-white">
                  {member?.name ?? "Your Membership"}
                </h1>
              </div>
              <LogoutButton />
            </div>
          </div>

          <SectionHeader
            title="Membership Card"
            subtitle="Read-only view of your details."
          />

          {error ? (
            <div className="rounded-2xl border border-rose-400/40 bg-rose-500/10 p-4 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="glass-panel rounded-2xl p-6 text-sm text-slate-300">
              Loading member details...
            </div>
          ) : member ? (
            <MemberCard member={member} readOnly />
          ) : null}

          <SectionHeader
            title="Payment History"
            subtitle="Your latest renewals and dues payments."
          />

          <div className="glass-panel rounded-2xl p-6">
            {loading ? (
              <p className="text-sm text-slate-300">Loading payments...</p>
            ) : sortedPayments.length === 0 ? (
              <p className="text-sm text-slate-300">No payments recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {sortedPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm text-white">
                        {payment.type} - ₹{payment.amount}
                      </p>
                      <p className="text-xs text-slate-400">
                        {payment.memberName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-white">
                        {formatDateTimeDisplay(payment.paidOn)}
                      </p>
                      <p className="text-xs text-slate-400">
                        Roll {payment.rollNumber ?? "--"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <SiteFooter />
        </div>
        <AiChatbot role="member" />
      </div>
    </AuthGuard>
  );
}
