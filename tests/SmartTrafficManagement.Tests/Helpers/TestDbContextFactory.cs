using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using SmartTrafficManagement.Infrastructure.Persistence;

namespace SmartTrafficManagement.Tests.Helpers;

public static class TestDbContextFactory
{

    public static ApplicationDbContext CreateSqliteInMemory()
    {
        var connection = new SqliteConnection("DataSource=:memory:");
        connection.Open();

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlite(connection)
            .Options;

        var context = new ApplicationDbContext(options);
        context.Database.EnsureCreated();
        return context;
    }
}
