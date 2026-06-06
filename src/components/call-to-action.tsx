import React from "react";

export default function CallToAction() {
  return (
    <section className="rounded-3xl p-8">
      <div className="glass-panel-strong panel-card p-6 flex flex-col items-center gap-4 text-center">
        <h2 className="font-display text-2xl font-semibold">Ready to join?</h2>
        <p className="text-slate-300">Start your fitness journey with SG Fitness Evolution.</p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <a href="/access" className="btn-base btn-accent px-5 py-2">Join Now</a>
          <a href="tel:8809551534" className="btn-base px-5 py-2">Call Now</a>
          <a href="https://wa.me/918809551534" target="_blank" rel="noreferrer" className="btn-base px-5 py-2">WhatsApp</a>
          <a href="https://share.google/vSOLuqnbizuJN4sm3" target="_blank" rel="noreferrer" className="btn-base px-5 py-2">Get Directions</a>
        </div>
      </div>
    </section>
  );
}
