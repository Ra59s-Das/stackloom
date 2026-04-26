<<<<<<< HEAD
FROM python:3.11

RUN useradd -m -u 1000 user
USER user
ENV PATH="/home/user/.local/bin:$PATH"

WORKDIR /app

COPY --chown=user ./requirements.txt requirements.txt
RUN pip install --no-cache-dir --upgrade -r requirements.txt

COPY --chown=user . /app
=======
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 7860
>>>>>>> 5286c17f79f617bf94be441f8aa223e1f6eb9aa0

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]