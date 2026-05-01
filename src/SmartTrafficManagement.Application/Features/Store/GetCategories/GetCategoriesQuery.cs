using SmartTrafficManagement.Application.DTOs;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Interfaces;

namespace SmartTrafficManagement.Application.Features.Store.GetCategories;

public sealed record GetCategoriesQuery;

public sealed class GetCategoriesQueryHandler
{
    private readonly IStoreRepository _repo;

    public GetCategoriesQueryHandler(IStoreRepository repo) => _repo = repo;

    public async Task<Result<IReadOnlyList<CategoryDto>>> Handle(
        GetCategoriesQuery request,
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
