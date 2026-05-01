using SmartTrafficManagement.Application.DTOs;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Entities;
using SmartTrafficManagement.Core.Interfaces;

namespace SmartTrafficManagement.Application.Features.Admin;

// ── Commands / Queries ────────────────────────────────────────────────────────

public sealed record GetAdminCategoriesQuery;
public sealed record CreateCategoryCommand(string Name, string? Description);
public sealed record UpdateCategoryCommand(Guid Id, string Name, string? Description);
public sealed record DeleteCategoryCommand(Guid Id);

// ── Handlers ─────────────────────────────────────────────────────────────────

/// <summary>GET /api/admin/categories — list all (including ones with products)</summary>
public sealed class GetAdminCategoriesQueryHandler
{
    private readonly IStoreRepository _repo;
    public GetAdminCategoriesQueryHandler(IStoreRepository repo) => _repo = repo;

    public async Task<Result<IReadOnlyList<CategoryDto>>> Handle(
        GetAdminCategoriesQuery request,
        CancellationToken cancellationToken)
    {
        var categories = await _repo.GetCategoriesAsync(cancellationToken);
        var dtos = categories.Select(c => new CategoryDto
        {
            Id          = c.Id,
            Name        = c.Name,
            Description = c.Description
        }).ToList();
        return Result<IReadOnlyList<CategoryDto>>.Success(dtos, 200);
    }
}

/// <summary>POST /api/admin/categories — create a new category</summary>
public sealed class CreateCategoryCommandHandler
{
    private readonly IStoreRepository _repo;
    public CreateCategoryCommandHandler(IStoreRepository repo) => _repo = repo;

    public async Task<Result<CategoryDto>> Handle(
        CreateCategoryCommand request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return Result<CategoryDto>.Failure(DomainErrors.Common.Validation("Name is required."), 400);

        var category = new Category
        {
            Name        = request.Name.Trim(),
            Description = request.Description?.Trim()
        };

        await _repo.AddCategoryAsync(category, cancellationToken);
        await _repo.SaveChangesAsync(cancellationToken);

        return Result<CategoryDto>.Success(new CategoryDto
        {
            Id          = category.Id,
            Name        = category.Name,
            Description = category.Description
        }, 201);
    }
}

/// <summary>PUT /api/admin/categories/{id} — update name/description</summary>
public sealed class UpdateCategoryCommandHandler
{
    private readonly IStoreRepository _repo;
    public UpdateCategoryCommandHandler(IStoreRepository repo) => _repo = repo;

    public async Task<Result<bool>> Handle(
        UpdateCategoryCommand request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return Result<bool>.Failure(DomainErrors.Common.Validation("Name is required."), 400);

        var category = await _repo.GetCategoryByIdAsync(request.Id, cancellationToken);
        if (category is null)
            return Result<bool>.Failure(DomainErrors.Common.NotFound, 404);

        category.Name        = request.Name.Trim();
        category.Description = request.Description?.Trim();
        category.UpdatedOnUtc = DateTime.UtcNow;

        await _repo.SaveChangesAsync(cancellationToken);
        return Result<bool>.Success(true, 200);
    }
}

/// <summary>DELETE /api/admin/categories/{id} — soft delete</summary>
public sealed class DeleteCategoryCommandHandler
{
    private readonly IStoreRepository _repo;
    public DeleteCategoryCommandHandler(IStoreRepository repo) => _repo = repo;

    public async Task<Result<bool>> Handle(
        DeleteCategoryCommand request,
        CancellationToken cancellationToken)
    {
        var category = await _repo.GetCategoryByIdAsync(request.Id, cancellationToken);
        if (category is null)
            return Result<bool>.Failure(DomainErrors.Common.NotFound, 404);

        _repo.RemoveCategory(category);   // triggers soft-delete in ApplicationDbContext
        await _repo.SaveChangesAsync(cancellationToken);
        return Result<bool>.Success(true, 200);
    }
}
