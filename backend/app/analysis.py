import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

import numpy as np
import random

def enrich_data(df: pd.DataFrame):
    """
    Auto-enriches the dataset with synthetic 'Category' and 'ReviewText' if missing.
    This ensures the 'Affinity Discovery' and 'NLP' features work even with basic CSVs.
    """
    if 'Category' not in df.columns:
        categories = ['Electronics', 'Fashion', 'Home & Garden', 'Beauty', 'Sports', 'Groceries']
        # Assign category with some correlation to Gender/Age to make it realistic (optional, but random is fine for POC)
        df['Category'] = np.random.choice(categories, size=len(df))

    if 'ReviewText' not in df.columns:
        # Generate reviews based on Satisfaction/Rating
        positive_reviews = [
             "Absolutely love this product! Highly recommended.",
             "Great quality and fast shipping. Will buy again.",
             "Good value for money. Very satisfied.",
             "Exceeded my expectations!",
             "Perfect fit and great material."
        ]
        neutral_reviews = [
             "It's okay, does the job.",
             "Decent product but delivery was slow.",
             "Average quality, nothing special.",
             "A bit pricey for what it is.",
             "Received the item, it's fine."
        ]
        negative_reviews = [
             "Terrible quality, broke after one use.",
             "Not as described. Very disappointed.",
             "Waste of money. Do not buy.",
             "Customer service was unhelpful.",
             "Shipping took forever and item was damaged."
        ]
        
        def get_review(row):
            if row.get('Satisfaction Level') == 'Satisfied' or row.get('Average Rating', 0) >= 4:
                return random.choice(positive_reviews)
            elif row.get('Satisfaction Level') == 'Unsatisfied' or row.get('Average Rating', 0) <= 2:
                return random.choice(negative_reviews)
            else:
                return random.choice(neutral_reviews)
                
        df['ReviewText'] = df.apply(get_review, axis=1)

    return df

def perform_clustering(df: pd.DataFrame, n_clusters=5):
    # 1. Auto-Enrich Data first
    df = enrich_data(df)

    # Select features for clustering
    # Based on consumer_dataset.csv
    features = ['Age', 'Total Spend', 'Items Purchased', 'Days Since Last Purchase', 'Average Rating']
    
    # Drop rows with missing values in these columns to avoid errors
    df_clean = df.dropna(subset=features).copy()
    
    X = df_clean[features]
    
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    
    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    df_clean['Cluster'] = kmeans.fit_predict(X_scaled)
    
    # Calculate derived metrics for enriching the dataset
    df_clean['AOV'] = df_clean['Total Spend'] / df_clean['Items Purchased']
    
    return df_clean
