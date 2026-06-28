using System;
using Healthcare.Application.Common.Interfaces;

namespace Healthcare.Infrastructure.Services;

public class DateTimeProvider : IDateTimeProvider
{
    public DateTime UtcNow => DateTime.UtcNow;
}
