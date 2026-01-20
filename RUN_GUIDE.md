# 🧬 Shopper DNA Analyzer v2.0 - Complete Guide

> **Theme**: E-commerce | Consumer Analytics | Personalization
> **Tech Stack**: Next.js, FastAPI, Python (Scikit-Learn), Google Gemini AI

## 🌟 Project Overview
**Shopper DNA** is an advanced analytics platform that solves the "Shopper Behavior Patterns & Affinity Discovery" problem statement. It goes beyond basic clustering to provide **Actionable Business Intelligence**.

### Key Features
1.  **Behavioral Segmentation**: Uses K-Means clustering to group users by Spend, Recency, and Frequency.
2.  **Affinity Discovery**: Automatically detects "Favorite Categories" (Fashion, Tech, etc.) even if the raw data is missing them.
3.  **NLP Sentiment Analysis**: Generates and analyzes synthetic review text to gauge customer sentiment.
4.  **"Business Brain" AI**: A custom LLM integration that answers:
    *   *Who is at risk of churning?*
    *   *Should we offer a discount?*
    *   *What is the "Brutal Truth" about this segment?*

---

## 🚀 Installation & Setup

### Prerequisites
*   **Node.js** (v18 or higher)
*   **Python** (v3.9 or higher)
*   **Google Gemini API Key** (Get one for free at [aistudio.google.com](https://aistudio.google.com))

### Step 1: Backend Setup (The "Brain")
This powers the ML clustering and AI generation.

1.  Open a terminal and navigate to the `backend` folder:
    ```bash
    cd backend
    ```
2.  Create and activate a virtual environment:
    ```bash
    python3 -m venv venv
    source venv/bin/activate  # Mac/Linux
    # OR: venv\Scripts\activate  # Windows
    ```
3.  Install Python dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  **Crucial Step**: Set your API Key.
    *   Open `backend/.env`
    *   Add your key: `GEMINI_API_KEY=your_actual_key_here`
5.  Start the Server:
    ```bash
    uvicorn app.main:app --reload --port 8000
    ```
    *You should see: `Uvicorn running on http://127.0.0.1:8000`*

### Step 2: Frontend Setup (The "Face")
This is the beautiful dashboard UI.

1.  Open a **new terminal** (keep the backend running!) and navigate to `frontend`:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the Development Server:
    ```bash
    npm run dev
    ```
4.  Open your browser to: **[http://localhost:3000](http://localhost:3000)**

---

## 🧪 How to Use the Analyzer

### 1. Upload Data
*   On the landing screen, click the **"Upload Data"** box.
*   Select the file: `Problem_Statement_5/Consumer_dataset.csv`.
*   *Values automatically enriched*: The system will instantly calculate "Category Affinities" and "Review Sentiment" for you.

### 2. The Dashboard Views
Use the sidebar to explore:
*   **Dashboard**: High-level Charts (Spend vs Age, Satisfaction Levels, Churn Risk).
*   **Audience Segments**: The "Persona Cards". This is where the magic happens.
*   **Data View**: A raw table to inspect individual customer rows.

### 3. Generate AI Insights
*   Scroll to the **"AI Persona Profiles"** section.
*   Click the **Wand Icon (Generate Persona)** on any card.
*   The AI will analyze the segment and generate a Markdown report with:
    *   **Value Tier**: High/Mid/Low.
    *   **Churn Risk**: Calculated from "Days Since Purchase".
    *   **Strategic Advice**: "Should we discount? Yes/No."

### 4. Interactive Tools
*   **Filter Dropdown** (Top Right): Filter the *entire dashboard* by specific cluster (e.g., "Show me only Cluster 2").
*   **Sliders**: Use the Age/Spend sliders above the charts to zoom in on specific demographics.

---

## ⚠️ Troubleshooting

**Q: "Command not found: uvicorn"**
*   **Fix**: You forgot to activate the virtual environment! Run `source venv/bin/activate` inside the `backend` folder first.

**Q: Charts are empty?**
*   **Fix**: Did you upload the CSV? Refresh the page and upload `Consumer_dataset.csv`.

**Q: AI says "Error generating persona"?**
*   **Fix**: Check your terminal for error messages. usually, it means your `GEMINI_API_KEY` is missing or invalid in `backend/.env`.

---

## 📁 Project Structure
*   `backend/app/analysis.py`: Contains the **K-Means Clustering** and **Auto-Enrichment** logic.
*   `backend/app/llm_service.py`: Contains the **Business Logic Prompt** for the AI.
*   `frontend/components/Dashboard.tsx`: The main React component managing the state and charts.
