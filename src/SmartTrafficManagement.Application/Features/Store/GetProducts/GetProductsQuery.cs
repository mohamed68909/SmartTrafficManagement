using AutoMapper;
using FluentValidation;
using SmartTrafficManagement.Application.DTOs;
using SmartTrafficManagement.Core.Common;
using SmartTrafficManagement.Core.Interfaces;

namespace SmartTrafficManagement.Application.Features.Store.GetProducts;

public sealed class GetProductsQuery
{
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? Search { get; set; }
    public Guid? CategoryId { get; set; }
}

public sealed class GetProductsQueryValidator : AbstractValidator<GetProductsQuery>
{
    public GetProductsQueryValidator()
    {
        RuleFor(x => x.PageNumber).GreaterThan(0);
        RuleFor(x => x.PageSize).InclusiveBetween(1, 100);
    }
}

public sealed class GetProductsQueryHandler
{
    private readonly IStoreRepository _storeRepository;
    private readonly IValidator<GetProductsQuery> _validator;
    private readonly IMapper _mapper;

    public GetProductsQueryHandler(
        IStoreRepository storeRepository,
        IValidator<GetProductsQuery> validator,
        IMapper mapper)
    {
        _storeRepository = storeRepository;
        _validator = validator;
        _mapper = mapper;
    }

    public async Task<Result<PagedResultDto<ProductDto>>> HandleAsync(GetProductsQuery query, CancellationToken cancellationToken = default)
    {
        var validationResult = await _validator.ValidateAsync(query, cancellationToken);
        if (!validationResult.IsValid)
        {
            var errors = string.Join("; ", validationResult.Errors.Select(x => x.ErrorMessage));
            return Result<PagedResultDto<ProductDto>>.Failure(DomainErrors.Common.Validation(errors), 400);
        }

        var products = await _storeRepository.GetProductsAsync(
            query.PageNumber, query.PageSize,
            query.Search, query.CategoryId,
            cancellationToken);
        var totalCount = await _storeRepository.CountProductsAsync(
            query.Search, query.CategoryId,
            cancellationToken);

        var dto = new PagedResultDto<ProductDto>
        {
            Items = _mapper.Map<IReadOnlyList<ProductDto>>(products),
            PageNumber = query.PageNumber,
            PageSize = query.PageSize,
            TotalCount = totalCount
        };

        return Result<PagedResultDto<ProductDto>>.Success(dto, 200);
    }
}
