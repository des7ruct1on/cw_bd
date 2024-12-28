FROM python:3.11

RUN apt-get update && \
    apt-get install -y lsb-release wget gnupg

RUN wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | tee /etc/apt/trusted.gpg.d/postgresql.asc && \
    DISTRO=$(lsb_release -c | awk '{print $2}') && \
    echo "deb http://apt.postgresql.org/pub/repos/apt/ $DISTRO-pgdg main" | tee /etc/apt/sources.list.d/pgdg.list && \
    apt-get update

RUN apt-get install -y postgresql-17

WORKDIR /app

COPY . /app

RUN pip install --no-cache-dir -r requirements.txt

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]