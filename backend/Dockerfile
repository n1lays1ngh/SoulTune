# 1. Start with a lightweight, pre-configured Python environment
FROM python:3.11-slim

# 2. Create and move into the folder where our app will live inside the cloud
WORKDIR /app

# 3. Install the essential system-level C++ audio & threading tools
# This replaces the need for manual Homebrew installations on Linux
RUN apt-get update && apt-get install -y \
    libsndfile1 \
    libgomp1 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# 4. Copy the requirements list over first
COPY requirements.txt .

# 5. Install your top-level Python packages
RUN pip install --no-cache-dir -r requirements.txt

# 6. Copy the rest of your backend source code and .pkl models into the container
COPY . .

# 7. Tell the container to open up Port 8000
EXPOSE 8000

# 8. Spin up the Uvicorn server automatically when the container boots
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]


