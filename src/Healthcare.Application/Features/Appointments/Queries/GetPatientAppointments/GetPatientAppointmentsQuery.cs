using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Healthcare.Application.Common.Interfaces;

namespace Healthcare.Application.Features.Appointments.Queries.GetPatientAppointments;

public record GetPatientAppointmentsQuery(Guid PatientId) : IRequest<IReadOnlyList<AppointmentDto>>;

public class GetPatientAppointmentsQueryHandler : IRequestHandler<GetPatientAppointmentsQuery, IReadOnlyList<AppointmentDto>>
{
    private readonly IApplicationDbContext _context;

    public GetPatientAppointmentsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<AppointmentDto>> Handle(GetPatientAppointmentsQuery request, CancellationToken cancellationToken)
    {
        var appointments = await _context.Appointments
            .Include(a => a.Patient)
            .Include(a => a.Doctor)
            .Where(a => a.PatientId == request.PatientId)
            .OrderByDescending(a => a.AppointmentDate)
            .Select(a => new AppointmentDto
            {
                Id = a.Id,
                PatientId = a.PatientId,
                PatientName = $"{a.Patient.FirstName} {a.Patient.LastName}",
                DoctorId = a.DoctorId,
                DoctorName = $"{a.Doctor.FirstName} {a.Doctor.LastName}",
                AppointmentDate = a.AppointmentDate,
                DurationMinutes = a.DurationMinutes,
                Reason = a.Reason,
                Status = a.Status,
                CancellationReason = a.CancellationReason
            })
            .ToListAsync(cancellationToken);

        return appointments;
    }
}
