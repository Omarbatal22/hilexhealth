using System;
using System.Collections.Generic;
using System.Data.Common;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Healthcare.Persistence;

namespace Healthcare.API.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class DbVerificationController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public DbVerificationController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("status")]
    public async Task<IActionResult> GetDbStatus()
    {
        try
        {
            var result = new Dictionary<string, object>();

            using var connection = _context.Database.GetDbConnection();
            await connection.OpenAsync();

            // 1. Get Tables
            var tables = new List<string>();
            using (var command = connection.CreateCommand())
            {
                command.CommandText = "SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;";
                using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    tables.Add(reader.GetString(0));
                }
            }
            result["tables"] = tables;

            // 2. Get Indexes
            var indexes = new List<object>();
            using (var command = connection.CreateCommand())
            {
                command.CommandText = "SELECT tablename, indexname, indexdef FROM pg_indexes WHERE schemaname='public' ORDER BY tablename, indexname;";
                using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    indexes.Add(new
                    {
                        TableName = reader.GetString(0),
                        IndexName = reader.GetString(1),
                        Definition = reader.GetString(2)
                    });
                }
            }
            result["indexes"] = indexes;

            // 3. Get Counts
            var counts = new Dictionary<string, int>();
            string[] tablesToCount = { "AspNetRoles", "AspNetUsers", "patients", "doctors", "appointments", "symptoms", "notifications", "audit_logs", "outbox_messages", "ModelVersions" };
            foreach (var table in tablesToCount)
            {
                try
                {
                    using var command = connection.CreateCommand();
                    command.CommandText = $"SELECT COUNT(*) FROM \"{table}\";";
                    var count = Convert.ToInt32(await command.ExecuteScalarAsync());
                    counts[table] = count;
                }
                catch
                {
                    try
                    {
                        using var command = connection.CreateCommand();
                        command.CommandText = $"SELECT COUNT(*) FROM {table};";
                        var count = Convert.ToInt32(await command.ExecuteScalarAsync());
                        counts[table] = count;
                    }
                    catch (Exception)
                    {
                        counts[table] = -1;
                    }
                }
            }
            result["counts"] = counts;

            // 4. Get Seeded Users
            var users = new List<object>();
            try
            {
                using var command = connection.CreateCommand();
                command.CommandText = "SELECT \"Id\", \"Email\", \"Role\" FROM \"AspNetUsers\";";
                using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    users.Add(new
                    {
                        Id = reader.GetGuid(0),
                        Email = reader.GetString(1),
                        Role = reader.GetString(2)
                    });
                }
            }
            catch (Exception ex)
            {
                result["users_error"] = ex.Message;
            }
            result["users"] = users;

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message, stackTrace = ex.StackTrace });
        }
    }
}
