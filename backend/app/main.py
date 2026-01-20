from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
from .analysis import perform_clustering
from .llm_service import generate_persona_description

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Shopper Behavior API is running"}

@app.post("/analyze/upload")
async def upload_file(file: UploadFile = File(...)):
    contents = await file.read()
    df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
    
    # Store df temporarily or process immediately
    # For this hackathon, we'll process immediately and return cluster data
    
    clustered_data = perform_clustering(df)
    
    
    # Handle NaN values for JSON compliance
    clustered_data = clustered_data.where(pd.notnull(clustered_data), None)
    
    # Convert to JSON-serializable format
    result = clustered_data.to_dict(orient="records")
    return {"data": result}

@app.post("/analyze/persona")
async def generate_persona(cluster_id: int, cluster_stats: dict):
    description = generate_persona_description(cluster_id, cluster_stats)
    return {"description": description}
