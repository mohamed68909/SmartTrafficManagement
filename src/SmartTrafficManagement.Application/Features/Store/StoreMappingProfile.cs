using AutoMapper;
using SmartTrafficManagement.Application.DTOs;
using SmartTrafficManagement.Core.Entities;

namespace SmartTrafficManagement.Application.Features.Store;

public sealed class StoreMappingProfile : Profile
{
    public StoreMappingProfile()
    {
        CreateMap<Product, ProductDto>()
            .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category.Name))
            .ForMember(dest => dest.Brand,        opt => opt.MapFrom(src => src.Brand))
            .ForMember(dest => dest.ImageUrl,     opt => opt.MapFrom(src => src.ImageUrl));
    }
}
