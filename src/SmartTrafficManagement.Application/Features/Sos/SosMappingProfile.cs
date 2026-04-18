using AutoMapper;
using SmartTrafficManagement.Application.DTOs;
using SmartTrafficManagement.Core.Entities;

namespace SmartTrafficManagement.Application.Features.Sos;

public sealed class SosMappingProfile : Profile
{
    public SosMappingProfile()
    {
        CreateMap<ServiceRequest, RequestDetailsDto>();

        CreateMap<ServiceRequest, SosStatusDto>()
            .ForMember(dest => dest.RequestId, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.Provider, opt => opt.MapFrom(src => src.Provider));

        CreateMap<ApplicationUser, ProviderInfoDto>()
            .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.FullName, opt => opt.MapFrom(src => $"{src.FirstName} {src.LastName}".Trim()));
    }
}
