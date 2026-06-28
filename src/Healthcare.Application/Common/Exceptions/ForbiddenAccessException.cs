using System;

namespace Healthcare.Application.Common.Exceptions;

public class ForbiddenAccessException : Exception
{
    public ForbiddenAccessException() : base("Access denied to the requested resource.")
    {
    }
}
