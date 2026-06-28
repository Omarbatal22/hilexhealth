using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Healthcare.Application.Common.Interfaces;

namespace Healthcare.Application.Features.Appointments.Queries.GetDoctorAppointments;

public record GetDoctorAppointmentsQuery(Guid DoctorId) : IRequest<IReadOnlyList<AppointmentDto>>;

public class GetDoctorAppointmentsQueryHandler : IRequestHandler<GetDoctorAppointmentsQuery, IReadOnlyList<AppointmentDto>>
{
    private readonly IApplicationDbContext _context;

    public GetDoctorAppointmentsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<AppointmentDto>> Handle(GetDoctorAppointmentsQuery request, CancellationToken cancellationToken)
    {
        var appointments = await _context.Appointments
            .Include(a => a.Patient)
            .Include(a => a.Doctor)
            .Where(a => a.DoctorId == request.DoctorId)
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
