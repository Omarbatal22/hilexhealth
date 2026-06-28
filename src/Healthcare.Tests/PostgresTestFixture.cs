using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Healthcare.Persistence;
using Testcontainers.PostgreSql;
using Xunit;

namespace Healthcare.Tests;

public class PostgresTestFixture : IAsyncLifetime
{
    private PostgreSqlContainer? _postgresContainer;
    private bool _isDockerAvailable = true;

    public string ConnectionString => _postgresContainer?.GetConnectionString() 
        ?? "Host=localhost;Database=test;Username=postgres;Password=postgres";

    public bool IsDockerAvailable => _isDockerAvailable;

    public async Task InitializeAsync()
    {
        try
        {
            _postgresContainer = new PostgreSqlBuilder()
                .WithDatabase("healthcare_test")
                .WithUsername("postgres")
                .WithPassword("postgres")
                .Build();

            await _postgresContainer.StartAsync();
        }
        catch (Exception ex)
        {
            _isDockerAvailable = false;
            Console.WriteLine($"Docker is not available: {ex.Message}");
        }
    }

    public async Task DisposeAsync()
    {
        if (_postgresContainer != null)
        {
            await _postgresContainer.DisposeAsync();
        }
    }

    public ApplicationDbContext CreateDbContext()
    {
        if (!_isDockerAvailable)
        {
            throw new Exception("Docker daemon is not available or permission is denied. Testcontainers cannot start the PostgreSQL instance.");
        }

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseNpgsql(ConnectionString)
            .Options;

        var context = new ApplicationDbContext(options);
        return context;
    }
}
