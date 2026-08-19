# 🛡️ Chrona AI

**Prescriptive Financial Decision Engine for Retail Credit Defense**
*Submission for LT HackFest 2026 (FinTech Domain)*

## 🚨 The Problem: The "Timing Penalty"
Over 70% of retail loan defaults are due to temporary cash-flow mismatches, not intentional insolvency. Yet, the financial system treats bad timing as a default. 

When a borrower misses an EMI by even one day, they are hit with a **₹500+ NACH bounce fee** and suffer long-term **CIBIL score damage**. Current systems are purely reactive (recording damage after it happens), and budgeting apps only track past spending. 

## 💡 The Solution: Prescriptive Optimization
**Chrona AI** shifts retail credit from *reactive penalties* to *proactive optimization*. 

We don't just predict that a user will bounce an EMI. Our engine dynamically calculates the mathematical cost of a bounce versus the cost of an intervention (e.g., transferring a balance, pausing an SIP) and prescribes the cheapest, lowest-friction action to keep the account above zero.

**The Math of a Bounce:**
* ❌ **Do Nothing:** ₹590 Bounce Fee + 30 Point CIBIL Drop + Overdue Interest = **₹940+ Loss**
* ✅ **Chrona AI Action (Credit Transfer):** ₹199 Processing Fee + 0 CIBIL Impact = **₹741 Saved instantly.**

---

## ✨ Key Features
* 🔗 **Account Aggregator (AA) Integration (Simulated):** Ingests raw transaction data securely via India's consent-based DPI framework.
* 🔮 **60-Day Forward Simulation:** Projects the user's daily bank balance identifying exact liquidity shortfalls before they trigger a default.
* 🧠 **Prescriptive "What-If" Engine:** A real-time decision matrix that models the financial impact of different restructuring choices.
* ⚡ **One-Click Execution:** Users can instantly apply the AI-recommended strategy to restructure debt and protect their credit profile.

---

## 📸 Prototype Preview
*(Note to judges: Replace this text with a GIF or screenshot of your working UI showing the chart going from Red to Green)*

---

## 🛠️ Tech Stack

**Frontend (Prototype):**
* React 18
* TypeScript
* Tailwind CSS (Dark Mode FinTech UI)
* Recharts (For dynamic financial time-series visualization)
* Lucide React (Iconography)

**Backend / Logic Engine (Conceptual Architecture):**
* Python (Pandas)
* Meta Prophet / SARIMAX (Cash-flow forecasting)
* XGBoost (Intervention optimization)

---

## 🚀 How to Run Locally

To run the frontend simulation of Chrona AI on your local machine:

1. **Clone the repository**
   ```bash
   git clone [https://github.com/yourusername/chrona-ai.git](https://github.com/yourusername/ChronaAi.git)
   cd ChronaAI
