FROM python:3.11-slim

# Set up a working directory
WORKDIR /app

# Copy the requirements file into the image
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Hugging Face Spaces uses port 7860 by default
ENV PORT=7860
EXPOSE 7860

# We need a non-root user for Hugging Face Spaces Docker
RUN useradd -m -u 1000 user
RUN chown -R user:user /app
USER user

# Start the Flask app using gunicorn
CMD ["gunicorn", "server:app", "--bind", "0.0.0.0:7860", "--workers", "2", "--timeout", "300", "--preload"]
