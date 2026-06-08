FROM mcr.microsoft.com/playwright:v1.60.0-jammy

WORKDIR /app

# Install Allure
RUN apt-get update && apt-get install -y default-jre-headless wget \
  && wget -q https://github.com/allure-framework/allure2/releases/download/2.29.0/allure-2.29.0.tgz \
  && tar -xzf allure-2.29.0.tgz -C /opt \
  && ln -s /opt/allure-2.29.0/bin/allure /usr/local/bin/allure \
  && rm allure-2.29.0.tgz \
  && apt-get clean

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

RUN mkdir -p /app/allure-results /app/allure-report /app/allure-history

EXPOSE 5050

RUN chmod +x run-tests.sh
ENTRYPOINT ["bash", "run-tests.sh"]
