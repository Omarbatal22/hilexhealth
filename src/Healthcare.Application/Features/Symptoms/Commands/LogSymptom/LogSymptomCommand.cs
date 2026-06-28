using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Healthcare.Application.Common.Exceptions;
using Healthcare.Application.Common.Interfaces;
using Healthcare.Domain.Entities;
using Healthcare.Domain.Events;

namespace Healthcare.Application.Features.Symptoms.Commands.LogSymptom;

public record LogSymptomCommand : IRequest<Guid>
{
    public Guid PatientId { get; init; }
    public string Description { get; init; } = null!;
    public int SeverityScale { get; init; }
}

public class LogSymptomCommandValidator : AbstractValidator<LogSymptomCommand>
{
    public LogSymptomCommandValidator()
    {
        RuleFor(x => x.PatientId).NotEmpty();
        RuleFor(x => x.Description).NotEmpty().MaximumLength(1000);
        RuleFor(x => x.SeverityScale).InclusiveBetween(1, 10).WithMessage("Severity scale must be between 1 and 10.");
    }
}

public class LogSymptomCommandHandler : IRequestHandler<LogSymptomCommand, Guid>
{
    private readonly IApplicationDbContext _context;
    private readonly IAiTriageService _aiTriageService;
    private readonly IMediator _mediator;

    public LogSymptomCommandHandler(IApplicationDbContext context, IAiTriageService aiTriageService, IMediator mediator)
    {
        _context = context;
        _aiTriageService = aiTriageService;
        _mediator = mediator;
    }

    public async Task<Guid> Handle(LogSymptomCommand request, CancellationToken cancellationToken)
    {
        var patientExists = await _context.Patients.AnyAsync(p => p.Id == request.PatientId, cancellationToken);
        if (!patientExists)
        {
            throw new NotFoundException(nameof(Patient), request.PatientId);
        }

        // Assess symptoms via the AI Triage Service abstraction
        var triageResult = await _aiTriageService.AssessSymptomsAsync(request.Description, cancellationToken);

        var symptom = new Symptom
        {
            PatientId = request.PatientId,
            Description = request.Description,
            SeverityScale = request.SeverityScale,
            AiTriageResult = triageResult.SeverityLevel,
            AiRecommendation = triageResult.Recommendation,
            LoggedAt = DateTime.UtcNow
        };

        _context.Symptoms.Add(symptom);

        symptom.AddDomainEvent(new SymptomLoggedEvent(symptom));

        await _context.SaveChangesAsync(cancellationToken);

        await _mediator.Publish(new SymptomLoggedEvent(symptom), cancellationToken);

        return symptom.Id;
    }
}
