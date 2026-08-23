import React, { useState } from 'react';
import { Cpu, Code, Radio, Zap, CheckCircle2 } from 'lucide-react';

export const InteractiveWorkflow = () => {
  const [activeCodeTab, setActiveCodeTab] = useState('ticket');

  const ticketCode = `// 6.1 Workflow Automation: Ticket Status Transition Cascade
app.patch('/api/tickets/:id/status', authenticateJWT, async (req, res) => {
  const { status, note } = req.body;
  const ticket = await MaintenanceTicket.findById(req.params.id);

  // 1. Append Status History
  ticket.statusHistory.push({
    status,
    changedBy: req.user._id,
    timestamp: new Date(),
    note
  });
  ticket.status = status;
  await ticket.save();

  // 2. Synchronous Audit Log & VAPID Push Dispatch
  await AuditLog.create({ action: 'TICKET_STATUS_UPDATED', actor: req.user._id });
  await pushService.sendNotification(ticket.tenantId, \`Ticket updated: \${status}\`);

  return res.json({ success: true, ticket });
});`;

  const paymentCode = `// 6.2 Internal Webhook/Event Simulation: EventEmitter Payment Chain
const paymentEmitter = new EventEmitter();

// Synchronous Listener (Same-request, same-process cycle)
paymentEmitter.on('payment.confirmed', async ({ paymentId, actorId }) => {
  await Payment.findByIdAndUpdate(paymentId, {
    status: 'paid',
    paidAt: new Date(),
    mockTransactionId: \`TXN_SIM_\${Date.now()}\`
  });

  await AuditLog.create({ action: 'PAYMENT_CONFIRMED', actor: actorId });
  await Notification.create({ message: 'Rent payment processed successfully.' });
});

app.post('/api/payments/:id/pay', authenticateJWT, async (req, res) => {
  paymentEmitter.emit('payment.confirmed', { paymentId: req.params.id, actorId: req.user._id });
  return res.json({ status: 'confirmed' });
});`;

  return (
    <section id="workflow" className="py-24 bg-[#08080C] relative border-t border-white/10 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16 reveal-init">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs font-semibold mb-3">
            <Cpu className="w-3.5 h-3.5" />
            <span>Section 6 Integration Engine</span>
          </div>
          <h2 className="font-grotesk text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Synchronous Workflow Automation
          </h2>
          <p className="font-sans text-slate-400 text-base mt-3 font-normal">
            Execution guarantees zero dropped side effects by running workflows synchronously within Express request cycles.
          </p>
        </div>

        {/* 2-Column Code Preview & Workflow Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Interactive Code Tabs */}
          <div className="lg:col-span-7 spotlight-card rounded-3xl p-6 border border-white/10 bg-[#0C0C14] shadow-2xl reveal-init">
            
            {/* Code Header Controls */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-blue-400" />
                <span className="font-mono text-xs font-bold text-white">Express Backend Integration Spec</span>
              </div>

              {/* Code Tab Switcher */}
              <div className="flex gap-1.5 bg-[#141422] p-1 rounded-xl border border-white/10 font-grotesk text-xs">
                <button
                  onClick={() => setActiveCodeTab('ticket')}
                  className={`px-3 py-1 rounded-lg flex items-center gap-1.5 btn-press transition-all ${
                    activeCodeTab === 'ticket' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" /> 6.1 Ticket Cascade
                </button>
                <button
                  onClick={() => setActiveCodeTab('payment')}
                  className={`px-3 py-1 rounded-lg flex items-center gap-1.5 btn-press transition-all ${
                    activeCodeTab === 'payment' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" /> 6.2 EventEmitter
                </button>
              </div>
            </div>

            {/* Code Display */}
            <pre className="font-mono text-xs text-slate-300 leading-relaxed overflow-x-auto p-4 rounded-2xl bg-[#07070B] border border-white/5 no-scrollbar">
              <code>{activeCodeTab === 'ticket' ? ticketCode : paymentCode}</code>
            </pre>

          </div>

          {/* Right Column: Workflow Steps Checklist */}
          <div className="lg:col-span-5 space-y-4 reveal-init stagger-2">
            
            <div className="p-5 rounded-2xl bg-[#101018] border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-blue-400 font-grotesk font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>1. Single Request Cycle Execution</span>
              </div>
              <p className="font-sans text-xs text-slate-400 leading-relaxed font-normal pl-6">
                All database updates, status history appends, and audit records complete synchronously before responding to client.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#101018] border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-purple-400 font-grotesk font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>2. Internal EventEmitter Dispatch</span>
              </div>
              <p className="font-sans text-xs text-slate-400 leading-relaxed font-normal pl-6">
                Same-process event listeners capture payment events instantly, eliminating message queue overhead on Vercel.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#101018] border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-grotesk font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>3. VAPID Push & Audit Logging</span>
              </div>
              <p className="font-sans text-xs text-slate-400 leading-relaxed font-normal pl-6">
                Web-push notifications and immutable audit log snapshots execute inline to fulfill strict course defense requirements.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
