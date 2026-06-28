using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Healthcare.Domain.Entities;

namespace Healthcare.Persistence;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(
        ApplicationDbContext context, 
        UserManager<User> userManager, 
        RoleManager<IdentityRole<Guid>> roleManager)
    {
        // 1. Seed Roles
        var roles = new[] { "Admin", "Doctor", "Patient" };
        foreach (var roleName in roles)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                await roleManager.CreateAsync(new IdentityRole<Guid>
                {
                    Name = roleName,
                    NormalizedName = roleName.ToUpperInvariant()
                });
            }
        }

        // 2. Seed Patient (Sarah Mitchell)
        var patientEmail = "sarah.mitchell@email.com";
        var patientUser = await userManager.FindByEmailAsync(patientEmail);
        if (patientUser == null)
        {
            patientUser = new User
            {
                Id = Guid.NewGuid(),
                UserName = patientEmail,
                Email = patientEmail,
                Role = "Patient",
                IsEmailVerified = true,
                EmailConfirmed = true
            };

            var result = await userManager.CreateAsync(patientUser, "Password123!");
            if (result.Succeeded)
            {
                await userManager.AddToRoleAsync(patientUser, "Patient");

                var patient = new Patient
                {
                    Id = Guid.NewGuid(),
                    UserId = patientUser.Id,
                    FirstName = "Sarah",
                    LastName = "Mitchell",
                    DateOfBirth = new DateTime(1992, 3, 15, 0, 0, 0, DateTimeKind.Utc),
                    PhoneNumber = "555-0199",
                    BiologicalSex = "Female",
                    BloodType = "A+",
                    EmergencyContactName = "Jane Mitchell",
                    EmergencyContactPhone = "555-0188"
                };

                context.Patients.Add(patient);
                await context.SaveChangesAsync();
            }
        }
        else
        {
            // Reset password to guarantee it is Password123! and ensure not locked out
            patientUser.PasswordHash = userManager.PasswordHasher.HashPassword(patientUser, "Password123!");
            await userManager.UpdateAsync(patientUser);
            await userManager.SetLockoutEndDateAsync(patientUser, null);
            await userManager.ResetAccessFailedCountAsync(patientUser);
        }

        // 3. Seed Doctors
        var doctorsToSeed = new[]
        {
            new { Email = "j.chen@helixhealth.com", FirstName = "James", LastName = "Chen", Specialty = "Internal Medicine", Dept = "General Practice", Exp = 12, License = "LIC10001" },
            new { Email = "a.osei@helixhealth.com", FirstName = "Amara", LastName = "Osei", Specialty = "Cardiology", Dept = "Cardiovascular", Exp = 15, License = "LIC10002" },
            new { Email = "e.rodriguez@helixhealth.com", FirstName = "Elena", LastName = "Rodriguez", Specialty = "Neurology", Dept = "Neurological Sciences", Exp = 9, License = "LIC10003" },
            new { Email = "r.patel@helixhealth.com", FirstName = "Raj", LastName = "Patel", Specialty = "Pediatrics", Dept = "Child Health", Exp = 8, License = "LIC10004" },
            new { Email = "s.bergstrom@helixhealth.com", FirstName = "Sofia", LastName = "Bergström", Specialty = "Dermatology", Dept = "Skin & Allergy", Exp = 11, License = "LIC10005" }
        };

        foreach (var docData in doctorsToSeed)
        {
            var docUser = await userManager.FindByEmailAsync(docData.Email);
            if (docUser == null)
            {
                docUser = new User
                {
                    Id = Guid.NewGuid(),
                    UserName = docData.Email,
                    Email = docData.Email,
                    Role = "Doctor",
                    IsEmailVerified = true,
                    EmailConfirmed = true
                };

                var result = await userManager.CreateAsync(docUser, "Password123!");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(docUser, "Doctor");

                    var doctor = new Doctor
                    {
                        Id = Guid.NewGuid(),
                        UserId = docUser.Id,
                        FirstName = docData.FirstName,
                        LastName = docData.LastName,
                        PhoneNumber = "555-0200",
                        Specialty = docData.Specialty,
                        LicenseNumber = docData.License,
                        IsVerified = true
                    };

                    context.Doctors.Add(doctor);
                    await context.SaveChangesAsync();
                }
            }
            else
            {
                // Reset password to guarantee it is Password123! and ensure not locked out
                docUser.PasswordHash = userManager.PasswordHasher.HashPassword(docUser, "Password123!");
                await userManager.UpdateAsync(docUser);
                await userManager.SetLockoutEndDateAsync(docUser, null);
                await userManager.ResetAccessFailedCountAsync(docUser);
            }
        }
    }
}
