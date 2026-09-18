# Build .NET app
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY DemandVision.Api/ DemandVision.Api/
RUN dotnet publish DemandVision.Api/DemandVision.Api.csproj -c Release -o /app/publish

# Runtime: .NET + Python
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
RUN apt-get update && apt-get install -y python3 python3-pip && rm -rf /var/lib/apt/lists/*
COPY --from=build /app/publish/ ./
COPY model-service/ /app/model-service/
RUN pip3 install --break-system-packages -r /app/model-service/requirements.txt
RUN python3 /app/model-service/prepare_model.py

ENV ASPNETCORE_URLS=http://0.0.0.0:8080
ENV MODEL_SERVICE_URL=http://127.0.0.1:8000
EXPOSE 8080

CMD ["sh", "-c", "python3 -m uvicorn model-service.app:app --host 127.0.0.1 --port 8000 & dotnet DemandVision.Api.dll"]
