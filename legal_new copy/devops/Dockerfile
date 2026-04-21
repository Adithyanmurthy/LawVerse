FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies from Person 3's requirements
COPY Lperson_3/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy Person 3 backend source
COPY Lperson_3/src/ ./src/
COPY Lperson_3/pyproject.toml .

EXPOSE 8000

CMD ["uvicorn", "src.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
