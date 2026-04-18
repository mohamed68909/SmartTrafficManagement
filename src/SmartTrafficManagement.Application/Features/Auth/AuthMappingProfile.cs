using AutoMapper;
using SmartTrafficManagement.Application.DTOs;
using SmartTrafficManagement.Core.Entities;

namespace SmartTrafficManagement.Application.Features.Auth;

public sealed class AuthMappingProfile : Profile
{
    public AuthMappingProfile()
    {
        CreateMap<ApplicationUser, AuthResponseDto>()
            .ForMember(dest => dest.UserId, opt => opt.MapFrom(src => src.Id))
            .ForMember(dest => dest.Token, opt => opt.Ignore());
    }
}
