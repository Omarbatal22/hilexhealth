using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Healthcare.Application.Common.Exceptions;
using Healthcare.Application.Common.Interfaces;
using Healthcare.Domain.Entities;
using Healthcare.Application.Features.Doctors.Queries;

namespace Healthcare.Application.Features.Doctors.Queries.GetDoctorByUserId;

public record GetDoctorByUserIdQuery(Guid UserId) : IRequest<DoctorDto>;

public class GetDoctorByUserIdQueryHandler : IRequestHandler<GetDoctorByUserIdQuery, DoctorDto>
{
    private readonly IApplicationDbContext _context;

    public GetDoctorByUserIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<DoctorDto> Handle(GetDoctorByUserIdQuery request, CancellationToken cancellationToken)
    {
        var doctor = await _context.Doctors
            .FirstOrDefaultAsync(d => d.UserId == request.UserId, cancellationToken);

        if (doctor == null)
        {
            throw new NotFoundException(nameof(Doctor), request.UserId);
        }

        return new DoctorDto
        {
            Id = doctor.Id,
            FirstName = doctor.FirstName,
            LastName = doctor.LastName,
            Specialty = doctor.Specialty,
            PhoneNumber = doctor.PhoneNumber,
            LicenseNumber = doctor.LicenseNumber,
            IsVerified = doctor.IsVerified
        };
    }
}
