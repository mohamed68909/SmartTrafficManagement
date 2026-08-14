using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using SmartTrafficManagement.Application.Features.Diagnostics;
using SmartTrafficManagement.Infrastructure.Persistence;
using SmartTrafficManagement.Infrastructure.Persistence.Repositories;
using SmartTrafficManagement.Infrastructure.Seeding;
using SmartTrafficManagement.Tests.Helpers;
using Xunit;

namespace SmartTrafficManagement.Tests.Integration.Diagnostics;

public class DiagnosticsTests : IDisposable
{
    private readonly ApplicationDbContext _context;
    private readonly GetRootQuestionQueryHandler _rootHandler;
    private readonly SubmitAnswerCommandHandler _answerHandler;

    public DiagnosticsTests()
    {
        _context = TestDbContextFactory.CreateSqliteInMemory();
        var repo = new DiagnosticsRepository(_context);
        _rootHandler = new GetRootQuestionQueryHandler(repo);
        _answerHandler = new SubmitAnswerCommandHandler(repo);
    }

    [Fact]
    public async Task Diagnostics_WithSeededDatabase_ShouldRetrieveRootQuestion()
    {
        // Arrange
        await DiagnosticsSeeder.SeedAsync(CreateMockServiceProvider());

        // Act
        var result = await _rootHandler.Handle(new GetRootQuestionQuery(), CancellationToken.None);

        // Assert
        result.IsSuccess.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.Text.Should().Be("Does the engine start?");
        result.Data.Answers.Should().HaveCount(2); // Yes, No
    }

    [Fact]
    public async Task Diagnostics_AnswerNoToStarts_ProgressesToNextQuestion()
    {
        // Arrange
        await DiagnosticsSeeder.SeedAsync(CreateMockServiceProvider());
        var rootResult = await _rootHandler.Handle(new GetRootQuestionQuery(), CancellationToken.None);
        var noAnswer = rootResult.Data!.Answers.First(a => a.Text.Equals("No", StringComparison.OrdinalIgnoreCase));

        // Act
        var answerResult = await _answerHandler.Handle(
            new SubmitAnswerCommand(noAnswer.Id), CancellationToken.None);

        // Assert
        answerResult.IsSuccess.Should().BeTrue();
        answerResult.Data.Should().NotBeNull();
        answerResult.Data!.IsComplete.Should().BeFalse();
        answerResult.Data.NextQuestion.Should().NotBeNull();
        answerResult.Data.NextQuestion!.Text.Should().Be("Is the battery warning light ON?");
    }

    [Fact]
    public async Task Diagnostics_TraversesToTerminalDiagnosis_ReturnsCorrectResult()
    {
        // Arrange
        await DiagnosticsSeeder.SeedAsync(CreateMockServiceProvider());

        // Step 1: Does engine start? -> No
        var q1Result = await _rootHandler.Handle(new GetRootQuestionQuery(), CancellationToken.None);
        var a1 = q1Result.Data!.Answers.First(a => a.Text.Equals("No", StringComparison.OrdinalIgnoreCase));

        // Step 2: Is the battery warning light ON? -> Yes
        var q2Result = await _answerHandler.Handle(new SubmitAnswerCommand(a1.Id), CancellationToken.None);
        var a2 = q2Result.Data!.NextQuestion!.Answers.First(a => a.Text.Equals("Yes", StringComparison.OrdinalIgnoreCase));

        // Step 3: Do you hear a clicking sound when starting? -> Yes (clicking sound)
        var q3Result = await _answerHandler.Handle(new SubmitAnswerCommand(a2.Id), CancellationToken.None);
        var a3 = q3Result.Data!.NextQuestion!.Answers.First(a => a.Text.StartsWith("Yes", StringComparison.OrdinalIgnoreCase));

        // Act - Submit final answer
        var finalResult = await _answerHandler.Handle(
            new SubmitAnswerCommand(a3.Id), CancellationToken.None);

        // Assert
        finalResult.IsSuccess.Should().BeTrue();
        finalResult.Data.Should().NotBeNull();
        finalResult.Data!.IsComplete.Should().BeTrue();
        finalResult.Data.Result.Should().NotBeNull();
        finalResult.Data.Result!.Title.Should().Be("Weak Battery");
        finalResult.Data.Result.Urgency.Should().Be("High");
    }

    private IServiceProvider CreateMockServiceProvider()
    {
        var serviceCollection = new ServiceCollection();
        serviceCollection.AddSingleton(_context);
        return serviceCollection.BuildServiceProvider();
    }

    public void Dispose()
    {
        _context.Database.EnsureDeleted();
        _context.Dispose();
    }
}
