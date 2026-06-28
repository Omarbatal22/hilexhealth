using System;
using System.Collections.Generic;

namespace Healthcare.Application.Common.Exceptions;

public record ValidationError(string PropertyName, string ErrorMessage);

public class ValidationException : Exception
{
    public IReadOnlyCollection<ValidationError> Errors { get; }

    public ValidationException(IEnumerable<ValidationError> errors)
        : base("One or more validation failures have occurred.")
    {
        Errors = new List<ValidationError>(errors).AsReadOnly();
    }
}
