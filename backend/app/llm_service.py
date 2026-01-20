import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
# Ensure GEMINI_API_KEY is set in .env
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

def generate_persona_description(cluster_id: int, stats: dict) -> str:
    if not api_key:
        return f"Cluster {cluster_id}: AI description unavailable (Missing API Key). Stats: {stats}"
        
    model = genai.GenerativeModel('gemini-flash-latest')
    
    prompt = f"""
    You are a Brutally Honest Data Consultant. Analyze this customer segment (Cluster {cluster_id}) and provide "Business-Ready Insights".
    
    HARD DATA:
    - Avg Age: {stats.get('avg_age'):.1f}
    - Avg Spend: ${stats.get('avg_spend'):.2f}
    - Avg Items: {stats.get('avg_items'):.1f}
    - Avg Rating: {stats.get('avg_rating'):.1f} / 5.0
    - Discount Usage: {stats.get('discount_usage') if stats.get('discount_usage') else 'N/A'}%
    - Days Since Purchase: {stats.get('avg_days_since'):.1f} (Recency)
    - Top Category: {stats.get('top_category')} (Affinity)
    - Sentiment Vibe: {stats.get('sentiment_vibe')} (Based on reviews)
    
    MANDATORY OUTPUT FORMAT (Markdown):

    # [Emoji] [Segment Name]

    ### 1. Behavior & Value 💰
    *   **Value Tier:** [High/Mid/Low]
    *   **Churn Risk:** [High/Low]
    *   **Top Affinity:** {stats.get('top_category')}
    *   **Sentiment:** {stats.get('sentiment_vibe')}

    ### 2. Actionable Decisions 🚀
    *   **Should we discount?** [YES/NO and WHY]
    *   **Engagement Strategy:** [Specific channel/message]
    *   **Product Fit:** [Premium bundles vs Budget packs]

    ### 3. The "Brutal Truth" ⚠️
    [1-2 sentences on whether this segment is actually worth our time or just draining resources.]
    """
    
    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        error_str = str(e)
        if "429" in error_str:
            return "⚠️ **AI Quota Exceeded**: You have hit the free tier rate limit. Please wait a minute and try again."
        return f"Error generation persona: {error_str}"
