using System.Net.Http.Json;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddHttpClient("Model", client =>
{
    var url = Environment.GetEnvironmentVariable("MODEL_SERVICE_URL") ?? "http://127.0.0.1:8000";
    client.BaseAddress = new Uri(url.TrimEnd('/') + "/");
    client.Timeout = TimeSpan.FromSeconds(60);
});

var app = builder.Build();
app.UseDefaultFiles();
app.UseStaticFiles();

app.MapGet("/api/health", () => Results.Ok(new { status = "ok", backend = ".NET 8" }));

app.MapPost("/api/predict", async (PredictionRequest request, IHttpClientFactory factory) =>
{
    if (string.IsNullOrWhiteSpace(request.ProductId))
        return Results.BadRequest(new { error = "Product ID is required." });

    var client = factory.CreateClient("Model");
    try
    {
        var response = await client.PostAsJsonAsync("predict", request);
        var body = await response.Content.ReadAsStringAsync();
        return Results.Content(body, "application/json", statusCode: (int)response.StatusCode);
    }
    catch (Exception ex)
    {
        return Results.Problem("AI model service is unavailable: " + ex.Message);
    }
});

app.MapFallbackToFile("index.html");
app.Run();

public record PredictionRequest(string ProductId);
