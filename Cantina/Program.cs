using Cantina.Data;
using Cantina.Persistence;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.EntityFrameworkCore;
using MudBlazor;
using MudBlazor.Services;
using Serilog;
//using Microsoft.Extensions.Configuration;


// Init Serilog configuration
var serilogConfiguration = new ConfigurationBuilder()
  .AddJsonFile("logger.json")
  .Build();

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .ReadFrom.Configuration(serilogConfiguration)
    .CreateLogger();

Log.Information("Server Booting Up...");

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog();

// Add services to the container.
builder.Services.AddRazorPages();
builder.Services.AddServerSideBlazor();
builder.Services.AddScoped<VinoService>();
builder.Services.AddScoped<CostiVinoService>();
builder.Services.AddScoped<FiltriService>();
builder.Services.AddMudServices();
builder.Services.AddMudServices(config =>
{
    config.SnackbarConfiguration.PositionClass = Defaults.Classes.Position.BottomLeft;

    config.SnackbarConfiguration.PreventDuplicates = false;
    config.SnackbarConfiguration.NewestOnTop = false;
    config.SnackbarConfiguration.ShowCloseIcon = true;
    config.SnackbarConfiguration.VisibleStateDuration = 10000;
    config.SnackbarConfiguration.HideTransitionDuration = 500;
    config.SnackbarConfiguration.ShowTransitionDuration = 500;
    config.SnackbarConfiguration.SnackbarVariant = Variant.Filled;
});

builder.Services.AddDbContext<CantinaContext>(options => options.UseSqlite(builder.Configuration.GetConnectionString("CantinaContext")));
builder.Services.AddTransient<DbInitialiser>();

var app = builder.Build();


using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;

    var initialiser = services.GetRequiredService<DbInitialiser>();
    initialiser.Run();

    Log.Information("SeedData Start...");
    SeedData.Initialize(services);
    Log.Information("SeedData End...");
}

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseStaticFiles();

app.UseRouting();

app.MapBlazorHub();
app.MapFallbackToPage("/_Host");

app.Run();
