using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Healthcare.Application.Common.Interfaces;
using Healthcare.Application.Common.Models;

namespace Healthcare.Application.Features.Doctors.Queries.ListDoctors;

public record ListDoctorsQuery(int PageNumber = 1, int PageSize = 10) : IRequest<PaginatedList<DoctorDto>>;

public class ListDoctorsQueryHandler : IRequestHandler<ListDoctorsQuery, PaginatedList<DoctorDto>>
{
    private readonly IApplicationDbContext _context;

    public ListDoctorsQueryHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<PaginatedList<DoctorDto>> Handle(ListDoctorsQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Doctors
            .OrderBy(d => d.LastName)
            .Select(d => new DoctorDto
            {
                Id = d.Id,
                FirstName = d.FirstName,
                LastName = d.LastName,
                Specialty = d.Specialty,
                PhoneNumber = d.PhoneNumber,
                LicenseNumber = d.LicenseNumber,
                IsVerified = d.IsVerified
            });

        return await PaginatedList<DoctorDto>.CreateAsync(query, request.PageNumber, request.PageSize, cancellationToken);
    }
}
