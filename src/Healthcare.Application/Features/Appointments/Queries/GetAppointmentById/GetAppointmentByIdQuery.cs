using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Healthcare.Application.Common.Exceptions;
using Healthcare.Application.Common.Interfaces;
using Healthcare.Domain.Entities;

namespace Healthcare.Application.Features.Appointments.Queries.GetAppointmentById;

public record GetAppointmentByIdQuery(Guid Id) : IRequest<AppointmentDto>;

public class GetAppointmentByIdQueryHandler : IRequestHandler<GetAppointmentByIdQuery, AppointmentDto>
{
    private readonly IApplicationDbContext _context;

    public GetAppointmentByIdQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<AppointmentDto> Handle(GetAppointmentByIdQuery request, CancellationToken cancellationToken)
    {
        var appointment = await _context.Appointments
            .Include(a => a.Patient)
            .Include(a => a.Doctor)
            .FirstOrDefaultAsync(a => a.Id == request.Id, cancellationToken);

        if (appointment == null)
        {
            throw new NotFoundException(nameof(Appointment), request.Id);
        }

        return new AppointmentDto
        {
            Id = appointment.Id,
            PatientId = appointment.PatientId,
            PatientName = $"{appointment.Patient.FirstName} {appointment.Patient.LastName}",
            DoctorId = appointment.DoctorId,
            DoctorName = $"{appointment.Doctor.FirstName} {appointment.Doctor.LastName}",
            AppointmentDate = appointment.AppointmentDate,
            DurationMinutes = appointment.DurationMinutes,
            Reason = appointment.Reason,
            Status = appointment.Status,
            CancellationReason = appointment.CancellationReason
        };
    }
}
