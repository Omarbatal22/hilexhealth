using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Healthcare.Application.Common.Exceptions;
using Healthcare.Application.Common.Interfaces;
using Healthcare.Domain.Entities;
using Healthcare.Application.Features.Patients.Queries;

namespace Healthcare.Application.Features.Patients.Queries.GetPatientByUserId;

public record GetPatientByUserIdQuery(Guid UserId) : IRequest<PatientDto>;

public class GetPatientByUserIdQueryHandler : IRequestHandler<GetPatientByUserIdQuery, PatientDto>
{
    private readonly IApplicationDbContext _context;

    public GetPatientByUserIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PatientDto> Handle(GetPatientByUserIdQuery request, CancellationToken cancellationToken)
    {
        var patient = await _context.Patients
            .FirstOrDefaultAsync(p => p.UserId == request.UserId, cancellationToken);

        if (patient == null)
        {
            throw new NotFoundException(nameof(Patient), request.UserId);
        }

        return new PatientDto
        {
            Id = patient.Id,
            FirstName = patient.FirstName,
            LastName = patient.LastName,
            DateOfBirth = patient.DateOfBirth,
            PhoneNumber = patient.PhoneNumber,
            BiologicalSex = patient.BiologicalSex,
            BloodType = patient.BloodType,
            EmergencyContactName = patient.EmergencyContactName,
            EmergencyContactPhone = patient.EmergencyContactPhone
        };
    }
}
