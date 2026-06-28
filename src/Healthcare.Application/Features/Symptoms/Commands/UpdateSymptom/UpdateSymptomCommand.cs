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

namespace Healthcare.Application.Features.Symptoms.Commands.UpdateSymptom;

public record UpdateSymptomCommand : IRequest
{
    public Guid Id { get; init; }
    public string Description { get; init; } = null!;
    public int SeverityScale { get; init; }
}

public class UpdateSymptomCommandValidator : AbstractValidator<UpdateSymptomCommand>
{
    public UpdateSymptomCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty();
        RuleFor(x => x.Description).NotEmpty().MaximumLength(1000);
        RuleFor(x => x.SeverityScale).InclusiveBetween(1, 10).WithMessage("Severity scale must be between 1 and 10.");
    }
}

public class UpdateSymptomCommandHandler : IRequestHandler<UpdateSymptomCommand>
{
    private readonly IApplicationDbContext _context;
    private readonly IAiTriageService _aiTriageService;
    private readonly IMediator _mediator;

    public UpdateSymptomCommandHandler(IApplicationDbContext context, IAiTriageService aiTriageService, IMediator mediator)
    {
        _context = context;
        _aiTriageService = aiTriageService;
        _mediator = mediator;
    }

    public async Task Handle(UpdateSymptomCommand request, CancellationToken cancellationToken)
    {
        var symptom = await _context.Symptoms
            .FirstOrDefaultAsync(s => s.Id == request.Id, cancellationToken);

        if (symptom == null)
        {
            throw new NotFoundException(nameof(Symptom), request.Id);
        }

        // Re-assess if description has changed
        if (symptom.Description != request.Description)
        {
            var triageResult = await _aiTriageService.AssessSymptomsAsync(request.Description, cancellationToken);
            symptom.AiTriageResult = triageResult.SeverityLevel;
            symptom.AiRecommendation = triageResult.Recommendation;
        }

        symptom.Description = request.Description;
        symptom.SeverityScale = request.SeverityScale;

        await _context.SaveChangesAsync(cancellationToken);

        await _mediator.Publish(new SymptomLoggedEvent(symptom), cancellationToken);
    }
}
